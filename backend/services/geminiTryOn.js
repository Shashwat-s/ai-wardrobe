import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import sharp from 'sharp';

/**
 * Gemini-based Virtual Try-On Service
 * EXACT implementation from outfit-generator using Google Gemini API
 */

// Constants - matching outfit-generator exactly
const MODEL = 'gemini-2.5-flash-image-preview';

// Initialize Gemini API
let genAI = null;

// In-memory cache for generated images
const generationCache = new Map();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Initialize Gemini API client
 */
export function initializeGemini(apiKey) {
  if (!apiKey) {
    console.log('⚠️  Gemini API key not provided');
    return false;
  }

  try {
    genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
    console.log('✅ Gemini API initialized');
    console.log(`   Model: ${MODEL}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
    return false;
  }
}

/**
 * Helper function to check if error is quota/rate limit error
 */
function isQuotaError(err) {
  const code = err?.error?.code || err?.status || err?.code;
  if (code === 429) return true;
  const status = err?.error?.status || err?.statusMessage;
  return status === 'RESOURCE_EXHAUSTED';
}

/**
 * Get retry delay from error response
 */
function getRetryMsFromError(err, fallbackMs = 20000) {
  try {
    const details = err?.error?.details || [];
    const retry = details.find((d) => d['@type']?.includes('RetryInfo'));
    if (retry?.retryDelay) {
      const m = /^(\d+)(?:\.(\d+))?s$/.exec(retry.retryDelay);
      if (m) {
        const sec = parseInt(m[1], 10);
        const frac = m[2] ? parseInt(m[2].slice(0, 3).padEnd(3, '0'), 10) : 0;
        return sec * 1000 + frac;
      }
    }
  } catch { }
  return fallbackMs;
}

/**
 * Convert image URL to base64 data
 * Uses Promise-based approach to avoid call stack issues (matching outfit-generator)
 */
async function imageUrlToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const buffer = Buffer.from(response.data);

    // Optimize image size to reduce API payload
    // Reduced from 1024 to 768 for faster processing (approx 40% smaller payload)
    const optimized = await sharp(buffer)
      .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 }) // Reduced quality slightly for speed
      .toBuffer();

    return optimized.toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error.message);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Generate cache key for request
 */
function getCacheKey(personImageUrl, clothingImageUrl, type) {
  return `${personImageUrl}|${clothingImageUrl}|${type}`;
}

/**
 * Get from cache if available and not expired
 */
function getFromCache(cacheKey) {
  const cached = generationCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    generationCache.delete(cacheKey);
    return null;
  }

  console.log('✅ Cache hit for try-on request');
  return cached.data;
}

/**
 * Save to cache with size limit
 */
function saveToCache(cacheKey, data) {
  // Implement LRU-style eviction
  if (generationCache.size >= CACHE_MAX_SIZE) {
    const firstKey = generationCache.keys().next().value;
    generationCache.delete(firstKey);
  }

  generationCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Generate virtual try-on using Gemini API
 * EXACT implementation from outfit-generator
 * 
 * @param {string} personImageUrl - URL of the person/model image
 * @param {string} clothingImageUrl - URL of the clothing item
 * @param {string} type - Type of clothing ('upper' or 'lower')
 * @returns {Promise<string>} Base64 encoded result image
 */
export async function generateTryOnWithGemini(personImageUrl, clothingImageUrl, type) {
  if (!genAI) {
    throw new Error('Gemini API not initialized');
  }

  // Check cache first
  const cacheKey = getCacheKey(personImageUrl, clothingImageUrl, type);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    console.log('🤖 Generating try-on with Gemini API...');
    console.log(`   Type: ${type}`);

    // Build prompt - matching outfit-generator's prompt structure
    const garmentName = type === 'upper' ? 'top clothing' : 'bottom clothing';
    const prompt = `Create a new image by combining the elements from the provided images. Take the ${garmentName} item from image 2, and place it naturally onto the body in image 1 so it looks like the person is wearing the selected outfit. Fit to body shape and pose, preserve garment proportions and textures, match lighting and shadows, handle occlusion by hair and arms. CRITICAL: The background must be completely white (#FFFFFF) - do not use black, transparent, or any other background color. Replace any existing background with solid white. Do not change the person identity or add accessories.`;

    // Convert images to base64
    console.log('📥 Downloading and converting images...');
    const [personBase64, clothingBase64] = await Promise.all([
      imageUrlToBase64(personImageUrl),
      imageUrlToBase64(clothingImageUrl),
    ]);

    console.log('✅ Images converted to base64');

    // Prepare contents array - EXACT format from outfit-generator
    const contents = [
      { text: prompt },
      { inlineData: { mimeType: 'image/jpeg', data: personBase64 } }, // image 1: person
      { inlineData: { mimeType: 'image/jpeg', data: clothingBase64 } }, // image 2: clothing
    ];

    // Call Gemini API with retry logic - matching outfit-generator
    console.log('🚀 Calling Gemini API...');
    let resp;
    let attempt = 0;
    const maxAttempts = 3;

    while (true) {
      try {
        resp = await genAI.models.generateContent({ model: MODEL, contents });
        break;
      } catch (err) {
        if (!isQuotaError(err) || attempt >= maxAttempts - 1) {
          const msg = typeof err?.message === 'string' ? err.message : JSON.stringify(err);
          throw new Error(`Gemini API error. ${msg}`);
        }
        attempt += 1;
        const base = getRetryMsFromError(err, 20000);
        const waitMs = Math.round(base * Math.pow(2, attempt - 1));
        console.log(`⏳ Rate limit hit, waiting ${waitMs}ms before retry ${attempt}/${maxAttempts}...`);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    // Extract image from response - matching outfit-generator
    const parts = resp.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart) {
      const msg = parts
        .map((p) => p.text)
        .filter(Boolean)
        .join('\n') || 'No image data returned';
      throw new Error(`Gemini did not return an image. ${msg}`);
    }

    if (!imagePart.inlineData?.data) {
      throw new Error('No image data in response');
    }

    const dataUrl = `data:image/jpeg;base64,${imagePart.inlineData.data}`;

    console.log('✅ Try-on generated successfully with Gemini');

    // Cache the result
    saveToCache(cacheKey, dataUrl);

    return dataUrl;
  } catch (error) {
    console.error('❌ Gemini try-on generation failed:', error.message);
    throw error;
  }
}

/**
 * Clear the generation cache
 */
export function clearCache() {
  generationCache.clear();
  console.log('🗑️  Generation cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: generationCache.size,
    maxSize: CACHE_MAX_SIZE,
    ttl: CACHE_TTL,
  };
}

export default {
  initializeGemini,
  generateTryOnWithGemini,
  clearCache,
  getCacheStats,
};
