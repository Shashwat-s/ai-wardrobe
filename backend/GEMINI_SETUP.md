# Google Gemini API Setup Guide

## Quick Start (5 minutes)

The AI Wardrobe now uses **Google Gemini API** for virtual try-on generation - the **EXACT same approach** as the outfit-generator project. This uses the **image generation model** that can create new images.

## Critical Details

✅ **Package**: `@google/genai` (NOT `@google/generative-ai`)  
✅ **Model**: `gemini-2.5-flash-image-preview` (image generation model)  
✅ **API**: `genAI.models.generateContent()` (multimodal generation)  
✅ **Result**: Actually generates NEW images with clothing applied  

## Why This Works

The previous implementation had the **wrong package and wrong model**:
- ❌ Old: `@google/generative-ai` + `gemini-2.0-flash-exp` (chat/vision model)
- ✅ New: `@google/genai` + `gemini-2.5-flash-image-preview` (image generation model)

**Image generation models can CREATE new images, while vision models can only ANALYZE images.**

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

**Cost**: Free tier includes generous limits. Paid tier is ~$0.002-0.005 per image generation.

## Step 2: Configure Your Backend

Create a `.env` file in the `backend/` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API key:

```env
# Google Gemini API (REQUIRED)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Port (optional)
PORT=8000
```

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

The package.json now includes `@google/genai` package (the correct one for image generation).

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
✅ Gemini API initialized
✅ Server running on http://localhost:8000
```

## Testing

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "gemini": true,
    "vertexAI": false,
    "firebase": false
  }
}
```

## How It Works

### Architecture

```
Frontend → POST /tryon → Backend → Gemini API → Generated Image
                                       ↓
                                   Cache (1hr)
```

### Generation Flow

1. **Download Images**: Person & clothing images from URLs
2. **Optimize**: Resize to 1024x1024, compress to JPEG
3. **Convert**: Encode images to base64
4. **Generate**: Send to Gemini with descriptive prompt
5. **Cache**: Store result for 1 hour (reduces API calls)
6. **Retry**: Auto-retry on rate limits with exponential backoff

### Prompt Template

```
You are a virtual fashion try-on assistant.

Your task: Place the [top/bottom clothing] from the second image 
onto the person in the first image.

Requirements:
- Preserve the person's face, body shape, and pose exactly
- Apply the clothing item naturally and realistically
- Maintain proper proportions and perspective
- Ensure realistic folds and shadows
- Use a clean white background (#FFFFFF)
- Output high-quality, photorealistic result
```

## Features

### 1. In-Memory Caching
- Caches generated images for 1 hour
- Max 100 items (LRU eviction)
- Check stats: `GET http://localhost:8000/cache-stats`

### 2. Retry Logic
- Auto-retries on quota errors (429)
- Exponential backoff: 2s, 4s, 8s
- Max 3 attempts per request

### 3. Image Optimization
- Resizes to 1024x1024 (max)
- JPEG compression (85% quality)
- Reduces API payload size

### 4. Fallback Chain
1. **Gemini API** (primary) ← Fast & Reliable
2. **GCP Vertex AI** (fallback) ← If configured
3. **Placeholder** (last resort) ← Just returns person image

## API Endpoints

### POST /tryon
Generate virtual try-on image

**Request:**
```json
{
  "person_image_url": "https://...",
  "clothing_image_url": "https://...",
  "type": "upper"  // or "lower"
}
```

**Response:**
```json
{
  "output_url": "data:image/jpeg;base64,...",
  "message": "Try-on generated successfully with Google Gemini",
  "provider": "gemini"
}
```

### GET /health
Check service status

### GET /cache-stats
View cache statistics

## Troubleshooting

### "Gemini API not initialized"
- Check your API key is set in `.env`
- Verify the key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### "Rate limit hit"
- Free tier has limits (15 requests/minute)
- Server will auto-retry with backoff
- Upgrade to paid tier for higher limits

### "No image data found in response"
- Gemini model may not support image generation
- Try model: `gemini-2.0-flash-exp` or `gemini-1.5-flash`
- Check model availability in your region

### "Failed to process image"
- Check image URLs are accessible
- Verify images are in supported formats (JPEG, PNG)
- Ensure images aren't too large (>10MB)

## Cost Estimation

### Free Tier
- **15 requests/minute**
- **1,500 requests/day**
- Good for development & testing

### Paid Tier
- **$0.002 - $0.005 per generation**
- For 1000 users doing 10 try-ons/day:
  - 10,000 generations/day
  - ~$20-50/day = **$600-1500/month**

Compare to Vertex AI: ~$0.05-0.10 per generation = **$5000-10000/month**

**Gemini is 10x cheaper!**

## Advanced Configuration

### Change Gemini Model

Edit `backend/services/geminiTryOn.js`:

```javascript
geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',  // Fastest
  // model: 'gemini-1.5-flash',   // Stable
  // model: 'gemini-1.5-pro',     // Best quality
});
```

### Adjust Cache Settings

Edit `backend/services/geminiTryOn.js`:

```javascript
const CACHE_MAX_SIZE = 100;      // Max items
const CACHE_TTL = 3600000;       // 1 hour (ms)
```

### Customize Prompt

Edit `backend/services/geminiTryOn.js` → `generateTryOnWithGemini()` function

## Migration from Vertex AI

If you were using GCP Vertex AI before:

1. **Remove complexity**: No more GCS uploads, service accounts
2. **Faster**: Direct API calls vs multi-step Vertex AI
3. **Cheaper**: 10x cost reduction
4. **Simpler**: Just need an API key

Your old `.env` variables are still supported as fallback:
- `GCP_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- etc.

But Gemini will be tried first!

## Production Deployment

### Environment Variables

Set in your hosting platform (Vercel, Railway, Render):

```bash
GOOGLE_GEMINI_API_KEY=your_key_here
PORT=8000
```

### Rate Limiting (Recommended)

Add express-rate-limit for production:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 requests per IP
});

app.use('/tryon', limiter);
```

### Monitoring

- Track API usage in [Google Cloud Console](https://console.cloud.google.com)
- Monitor cache hit rate via `/cache-stats`
- Set up alerts for quota warnings

## Need Help?

- [Google AI Studio Docs](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/rest)
- [outfit-generator reference](../outfit-generator) - Similar implementation

## Comparison: Gemini vs Vertex AI

| Feature | Gemini API | Vertex AI VTO |
|---------|-----------|---------------|
| **Setup** | API key only | GCP project + service account |
| **Cost** | $0.002-0.005/gen | $0.05-0.10/gen |
| **Speed** | ~2-5 seconds | ~10-30 seconds |
| **Storage** | None required | GCS bucket required |
| **Complexity** | Low | High |
| **Quotas** | 15/min free | 10/min paid |
| **Best For** | Most use cases | Enterprise with existing GCP |

**Recommendation**: Use Gemini API unless you have specific Vertex AI requirements.

---

**Last Updated**: November 2025  
**Version**: 2.0.0
