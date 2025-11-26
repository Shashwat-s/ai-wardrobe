import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import sharp from 'sharp';
import multer from 'multer';
import convert from 'heic-convert';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { Storage } from '@google-cloud/storage';
import { initializeGemini, generateTryOnWithGemini, getCacheStats } from './services/geminiTryOn.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (or specify your frontend URL)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini API (primary)
let geminiEnabled = false;
if (process.env.GOOGLE_GEMINI_API_KEY) {
  geminiEnabled = initializeGemini(process.env.GOOGLE_GEMINI_API_KEY);
} else {
  console.log('⚠️  GOOGLE_GEMINI_API_KEY not set - Gemini API disabled');
}

// Initialize GCP clients (fallback)
let gcsStorage = null;
let vertexAiClient = null;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_LOCATION = process.env.GCP_LOCATION || 'us-central1';
const VTO_MODEL = process.env.VTO_MODEL || 'virtual-try-on-preview-08-04';

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    gcsStorage = new Storage({
      projectId: GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    vertexAiClient = new PredictionServiceClient({
      apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    console.log('✅ GCP Vertex AI initialized (fallback)');
    console.log(`   Project: ${GCP_PROJECT_ID}`);
    console.log(`   Location: ${GCP_LOCATION}`);
    console.log(`   Model: ${VTO_MODEL}`);
  }
} catch (error) {
  console.log('⚠️  GCP Vertex AI not initialized:', error.message);
}

// Initialize Firebase Admin (optional - for storing results)
let bucket = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString()
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    bucket = admin.storage().bucket();
    console.log('✅ Firebase Admin initialized');
  }
} catch (error) {
  console.log('⚠️  Firebase Admin not initialized (optional)');
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Wardrobe Try-On API',
    version: '2.0.0',
    status: 'running',
    services: {
      gemini: geminiEnabled ? 'enabled' : 'disabled',
      vertexAI: vertexAiClient ? 'available' : 'unavailable',
    },
    endpoints: {
      health: 'GET /health',
      convertImage: 'POST /convert-image',
      tryon: 'POST /tryon',
      cacheStats: 'GET /cache-stats',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint to convert HEIC/Image to JPEG
app.post('/convert-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`Converting image: ${req.file.originalname} (${req.file.size} bytes)`);

    let imageBuffer = req.file.buffer;
    const isHeic = req.file.originalname.toLowerCase().endsWith('.heic') ||
      req.file.originalname.toLowerCase().endsWith('.heif') ||
      req.file.mimetype === 'image/heic' ||
      req.file.mimetype === 'image/heif';

    // If it's HEIC, decode it first
    if (isHeic) {
      console.log('Decoding HEIC format...');
      try {
        imageBuffer = await convert({
          buffer: req.file.buffer,
          format: 'JPEG',
          quality: 0.9
        });
        console.log('HEIC decoded successfully');
      } catch (heicError) {
        console.error('HEIC decode error:', heicError);
        return res.status(500).json({ error: 'Failed to decode HEIC image' });
      }
    }

    // Convert/optimize to JPEG using sharp
    const convertedBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 85 })
      .toBuffer();

    console.log(`Conversion successful. New size: ${convertedBuffer.length} bytes`);

    res.set('Content-Type', 'image/jpeg');
    res.send(convertedBuffer);
  } catch (error) {
    console.error('Image conversion error:', error);
    res.status(500).json({ error: 'Failed to convert image', details: error.message });
  }
});


// Cache stats endpoint
app.get('/cache-stats', (req, res) => {
      const stats = getCacheStats();
      res.json({
        cache: stats,
        timestamp: new Date().toISOString(),
      });
    });

    // Try-on endpoint
    app.post('/tryon', async (req, res) => {
      try {
        const { person_image_url, clothing_image_url, type, instructions } = req.body;

        // Validate input
        if (!person_image_url || !clothing_image_url || !type) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['person_image_url', 'clothing_image_url', 'type'],
          });
        }

        if (!['upper', 'lower'].includes(type)) {
          return res.status(400).json({
            error: 'Invalid type',
            message: 'Type must be "upper" or "lower"',
          });
        }

        console.log(`🎨 Generating try-on for ${type} clothing...`);
        console.log('Person image:', person_image_url);
        console.log('Clothing image:', clothing_image_url);
        if (instructions) {
          console.log('Instructions:', instructions);
        }

        // Priority 1: Use Gemini API (fast, cheap, reliable)
        if (geminiEnabled) {
          try {
            console.log('🤖 Using Google Gemini API...');

            const result = await generateTryOnWithGemini(
              person_image_url,
              clothing_image_url,
              type,
              instructions || ''
            );

            console.log('✅ Gemini try-on completed successfully');

            return res.json({
              output_url: result,
              message: 'Try-on generated successfully with Google Gemini',
              provider: 'gemini'
            });

          } catch (geminiError) {
            console.error('❌ Gemini error:', geminiError.message);
            console.log('Trying fallback options...');

            // Continue to fallback options
          }
        }

        // Priority 2: Use GCP Vertex AI if configured (expensive, complex)
        if (vertexAiClient && GCP_PROJECT_ID) {
          try {
            console.log('🤖 Using GCP Vertex AI Virtual Try-On...');

            const result = await callVertexAIVirtualTryOnREST(
              person_image_url,
              clothing_image_url,
              type
            );

            console.log('✅ GCP Virtual Try-On completed successfully');

            return res.json({
              output_url: result,
              message: 'Try-on generated successfully with GCP Vertex AI',
              provider: 'gcp-vertex-ai'
            });

          } catch (gcpError) {
            console.error('❌ GCP Vertex AI error:', gcpError.message);
            console.error('Falling back to placeholder...');

            // Fall through to placeholder
          }
        }

        // Priority 3: FALLBACK - Use placeholder
        console.log('⚠️  Using placeholder (no AI service available)');
        console.log('💡 Tip: Set GOOGLE_GEMINI_API_KEY for real try-on generation');

        const personResponse = await axios.get(person_image_url, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        const personBuffer = Buffer.from(personResponse.data);

        // Process and return person image as placeholder
        const processedPerson = await sharp(personBuffer)
          .resize(512, 768, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        const outputBase64 = processedPerson.toString('base64');
        const outputUrl = `data:image/jpeg;base64,${outputBase64}`;

        console.log('✅ Placeholder generated');

        res.json({
          output_url: outputUrl,
          message: 'Placeholder generated (set GOOGLE_GEMINI_API_KEY for real try-on)',
          provider: 'placeholder'
        });

      } catch (error) {
        console.error('❌ Try-on error:', error.message);
        res.status(500).json({
          error: 'Try-on generation failed',
          message: error.message,
        });
      }
    });

    /**
     * Call GCP Vertex AI Virtual Try-On API
     */
    async function callVertexAIVirtualTryOn(personImageUrl, clothingImageUrl, type) {
      try {
        // Map type to GCP category
        const category = type === 'upper' ? 'tops' : 'bottoms';

        // Upload images to GCS if they're not already GCS URIs
        const personGcsUri = await ensureGcsUri(personImageUrl, 'person');
        const clothingGcsUri = await ensureGcsUri(clothingImageUrl, 'clothing');

        console.log('Using GCS URIs:', { personGcsUri, clothingGcsUri, category });

        // Prepare the request with correct format for Virtual Try-On
        const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${VTO_MODEL}`;

        // Correct instance format for Virtual Try-On
        const instances = [
          {
            person_image: {
              gcs_uri: personGcsUri
            },
            garment_image: {
              gcs_uri: clothingGcsUri
            },
            category: category
          }
        ];

        const parameters = {
          sampleCount: 1
        };

        const request = {
          endpoint,
          instances,
          parameters
        };

        console.log('Calling Vertex AI Virtual Try-On with request:', JSON.stringify(request, null, 2));

        // Make the prediction
        const [response] = await vertexAiClient.predict(request);

        console.log('Vertex AI response received:', JSON.stringify(response, null, 2));

        if (!response.predictions || response.predictions.length === 0) {
          throw new Error('No predictions returned from Vertex AI');
        }

        const prediction = response.predictions[0];
        console.log('Prediction keys:', Object.keys(prediction));

        // The response contains the output image
        let outputImage;

        if (prediction.bytesBase64Encoded) {
          // If we have base64 encoded bytes
          outputImage = `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`;
        } else if (prediction.outputImage) {
          outputImage = prediction.outputImage;
        } else if (prediction.gcsUri || prediction.gcs_uri) {
          // If GCS URI, download and convert to base64
          const gcsUri = prediction.gcsUri || prediction.gcs_uri;
          const base64Image = await downloadFromGCS(gcsUri);
          outputImage = `data:image/jpeg;base64,${base64Image}`;
        } else if (prediction.output_image && prediction.output_image.gcs_uri) {
          // Alternative format
          const base64Image = await downloadFromGCS(prediction.output_image.gcs_uri);
          outputImage = `data:image/jpeg;base64,${base64Image}`;
        } else {
          console.error('Unexpected prediction format:', prediction);
          throw new Error('Unexpected response format from Vertex AI: ' + JSON.stringify(prediction));
        }

        return outputImage;

      } catch (error) {
        console.error('Error calling Vertex AI:', error);
        if (error.details) {
          console.error('Error details:', error.details);
        }
        throw error;
      }
    }

    /**
     * Call GCP Vertex AI Virtual Try-On via REST API
     */
    async function callVertexAIVirtualTryOnREST(personImageUrl, clothingImageUrl, type) {
      try {
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        // Map type to GCP category
        const category = type === 'upper' ? 'tops' : 'bottoms';

        // Upload images to GCS
        const personGcsUri = await ensureGcsUri(personImageUrl, 'person');
        const clothingGcsUri = await ensureGcsUri(clothingImageUrl, 'clothing');

        console.log('Using GCS URIs:', { personGcsUri, clothingGcsUri, category });

        // Try different API formats
        const endpoint = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${VTO_MODEL}:predict`;

        // Format 1: Try with person_image and garment_image
        let requestBody = {
          instances: [
            {
              person_image: {
                gcs_uri: personGcsUri
              },
              garment_image: {
                gcs_uri: clothingGcsUri
              },
              category: category
            }
          ],
          parameters: {
            sampleCount: 1
          }
        };

        console.log('Calling Vertex AI REST API...');
        console.log('Endpoint:', endpoint);
        console.log('Request (format 1):', JSON.stringify(requestBody, null, 2));

        try {
          const response = await axios.post(endpoint, requestBody, {
            headers: {
              'Authorization': `Bearer ${accessToken.token}`,
              'Content-Type': 'application/json'
            },
            timeout: 120000
          });

          return await handleVertexAIResponse(response);

        } catch (error1) {
          console.log('Format 1 failed, trying format 2...');
          console.log('Error:', error1.response?.data || error1.message);

          // Format 2: Try with model_image and product_image
          requestBody = {
            instances: [
              {
                model_image: {
                  gcs_uri: personGcsUri
                },
                product_image: {
                  gcs_uri: clothingGcsUri
                },
                garment_type: category
              }
            ]
          };

          console.log('Request (format 2):', JSON.stringify(requestBody, null, 2));

          try {
            const response2 = await axios.post(endpoint, requestBody, {
              headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
              },
              timeout: 120000
            });

            return await handleVertexAIResponse(response2);

          } catch (error2) {
            console.log('Format 2 failed, trying format 3...');
            console.log('Error:', error2.response?.data || error2.message);

            // Format 3: Try simple format
            requestBody = {
              instances: [
                {
                  person: {
                    gcsUri: personGcsUri
                  },
                  garment: {
                    gcsUri: clothingGcsUri
                  },
                  category: category
                }
              ]
            };

            console.log('Request (format 3):', JSON.stringify(requestBody, null, 2));

            const response3 = await axios.post(endpoint, requestBody, {
              headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
              },
              timeout: 120000
            });

            return await handleVertexAIResponse(response3);
          }
        }

      } catch (error) {
        console.error('REST API error:', error.response?.data || error.message);
        throw error;
      }
    }

    async function handleVertexAIResponse(response) {
      console.log('Vertex AI response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      if (!response.data.predictions || response.data.predictions.length === 0) {
        throw new Error('No predictions in response');
      }

      const prediction = response.data.predictions[0];

      // Handle different response formats
      let outputImage;

      if (prediction.bytesBase64Encoded) {
        outputImage = `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`;
      } else if (prediction.output_image && prediction.output_image.gcs_uri) {
        const base64Image = await downloadFromGCS(prediction.output_image.gcs_uri);
        outputImage = `data:image/jpeg;base64,${base64Image}`;
      } else if (prediction.gcs_uri) {
        const base64Image = await downloadFromGCS(prediction.gcs_uri);
        outputImage = `data:image/jpeg;base64,${base64Image}`;
      } else if (prediction.image) {
        outputImage = `data:image/jpeg;base64,${prediction.image}`;
      } else {
        console.error('Unexpected response format:', prediction);
        throw new Error('Cannot find output image in response');
      }

      return outputImage;
    }

    /**
     * Ensure the image URL is a GCS URI, upload if necessary
     */
    async function ensureGcsUri(imageUrl, prefix) {
      // If already a GCS URI, return it
      if (imageUrl.startsWith('gs://')) {
        return imageUrl;
      }

      // Download the image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const imageBuffer = Buffer.from(response.data);

      // Upload to GCS
      const timestamp = Date.now();
      const fileName = `temp/${prefix}_${timestamp}.jpg`;
      const bucket = gcsStorage.bucket(process.env.GCS_BUCKET_UPLOADS);
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        contentType: 'image/jpeg',
        metadata: {
          cacheControl: 'public, max-age=3600',
        }
      });

      const gcsUri = `gs://${process.env.GCS_BUCKET_UPLOADS}/${fileName}`;
      console.log(`Uploaded ${prefix} image to GCS: ${gcsUri}`);

      return gcsUri;
    }

    /**
     * Download image from GCS and convert to base64
     */
    async function downloadFromGCS(gcsUri) {
      try {
        // Parse GCS URI (gs://bucket/path)
        const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
        if (!match) {
          throw new Error('Invalid GCS URI format');
        }

        const bucketName = match[1];
        const filePath = match[2];

        const bucket = gcsStorage.bucket(bucketName);
        const file = bucket.file(filePath);

        const [buffer] = await file.download();
        return buffer.toString('base64');

      } catch (error) {
        console.error('Error downloading from GCS:', error);
        throw error;
      }
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 AI Wardrobe Backend Server');
      console.log('================================');
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ API docs: http://localhost:${PORT}`);
      console.log('================================\n');
    });

    export default app;
