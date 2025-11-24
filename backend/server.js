import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Wardrobe Try-On API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      tryon: 'POST /tryon',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    modelLoaded: false, // Will be true when AI model is integrated
  });
});

// Try-on endpoint
app.post('/tryon', async (req, res) => {
  try {
    const { person_image_url, clothing_image_url, type } = req.body;

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

    // Check if NanoBanana API URL is configured
    const nanoBananaApiUrl = process.env.NANOBANANA_API_URL;

    if (nanoBananaApiUrl) {
      // PRODUCTION: Call deployed NanoBanana API
      console.log('🤖 Calling NanoBanana API...');
      
      try {
        const vtonResponse = await axios.post(nanoBananaApiUrl, {
          person_image_url,
          clothing_image_url,
          type,
        }, {
          timeout: 120000, // 2 minutes timeout
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('✅ NanoBanana API response received');

        res.json({
          output_url: vtonResponse.data.output_url || vtonResponse.data.result_url,
          message: 'Try-on generated successfully',
        });
        return;

      } catch (apiError) {
        console.error('❌ NanoBanana API error:', apiError.message);
        // Fall through to placeholder if API fails
      }
    }

    // DEVELOPMENT/FALLBACK: Use placeholder
    console.log('⚠️  Using placeholder (NanoBanana API not configured)');
    
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
      message: 'Placeholder generated (configure NANOBANANA_API_URL for real try-on)',
    });

  } catch (error) {
    console.error('❌ Try-on error:', error.message);
    res.status(500).json({
      error: 'Try-on generation failed',
      message: error.message,
    });
  }
});

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
