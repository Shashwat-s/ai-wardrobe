# AI Wardrobe - Node.js Backend

Lightweight Node.js/Express backend for AI Wardrobe application.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will run at **http://localhost:8000**

## Features

✅ **Lightweight** - No heavy ML dependencies  
✅ **Fast** - Non-blocking I/O for concurrent requests  
✅ **Flexible** - Calls your deployed NanoBanana API  
✅ **Placeholder mode** - Works without AI model for testing  
✅ **Easy deployment** - Deploy to Vercel, Railway, Render, etc.

## API Endpoints

### GET /
API information and status

### GET /health
Health check endpoint

### POST /tryon
Generate virtual try-on

**Request:**
```json
{
  "person_image_url": "https://storage.googleapis.com/...",
  "clothing_image_url": "https://storage.googleapis.com/...",
  "type": "upper"
}
```

**Response:**
```json
{
  "output_url": "https://...",
  "message": "Try-on generated successfully"
}
```

## Configuration

### Environment Variables

Create `.env` file:

```env
PORT=8000
NANOBANANA_API_URL=https://your-nanobanana-api.com/tryon
ALLOWED_ORIGINS=http://localhost:3000
```

### NanoBanana Integration

**Before deploying NanoBanana:**
- Leave `NANOBANANA_API_URL` empty
- Backend will use placeholder (returns original person image)

**After deploying NanoBanana:**
1. Deploy your NanoBanana VTON service
2. Get the API endpoint URL
3. Update `.env`:
```env
NANOBANANA_API_URL=https://your-nanobanana-service.run.app/tryon
```
4. Restart backend: `npm start`

The backend will automatically call the real AI model!

## How It Works

```
Frontend Request
      ↓
Node.js Backend
      ↓
Is NANOBANANA_API_URL set?
      ↓
YES → Call NanoBanana API → Return AI result
NO  → Use placeholder → Return original image
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Add environment variable in Vercel dashboard:
- `NANOBANANA_API_URL`: Your deployed NanoBanana URL

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy

### Render
1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Why Node.js vs Python?

✅ **Faster startup** - No ML library loading  
✅ **Better for API calls** - Built for HTTP requests  
✅ **Easier deployment** - Smaller container size  
✅ **Lower memory** - No PyTorch/TensorFlow overhead  
✅ **More hosting options** - Vercel, Netlify, Railway, etc.
