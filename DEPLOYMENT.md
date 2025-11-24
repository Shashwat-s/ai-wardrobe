# AI Wardrobe Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Firebase project configured
- Google Cloud account (for backend)
- Docker installed (for backend)

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy:
```bash
cd frontend
npm run build
vercel --prod
```

3. Configure environment variables in Vercel dashboard:
   - Add all Firebase configuration variables
   - Set `VITE_API_URL` to your backend URL

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build and deploy:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

3. Configure environment variables in Netlify dashboard

### Option 3: Firebase Hosting

1. Install Firebase CLI:
```bash
npm i -g firebase-tools
```

2. Initialize Firebase:
```bash
cd frontend
firebase init hosting
```

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

## Backend Deployment

### Option 1: Google Cloud Run (Recommended)

1. Install Google Cloud SDK:
```bash
# Follow instructions at: https://cloud.google.com/sdk/docs/install
```

2. Login and set project:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

3. Enable required APIs:
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

4. Build and deploy:
```bash
cd backend

# Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-wardrobe-backend

# Deploy to Cloud Run
gcloud run deploy ai-wardrobe-backend \
  --image gcr.io/YOUR_PROJECT_ID/ai-wardrobe-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

5. Note the service URL and update frontend `VITE_API_URL`

### Option 2: Docker + Any Cloud Provider

1. Build Docker image:
```bash
cd backend
docker build -t ai-wardrobe-backend .
```

2. Run locally to test:
```bash
docker run -p 8000:8000 --env-file .env ai-wardrobe-backend
```

3. Push to your container registry and deploy to your cloud provider

### Option 3: Traditional VPS Deployment

1. SSH into your server:
```bash
ssh user@your-server.com
```

2. Clone repository:
```bash
git clone your-repo-url
cd Ai-Wardrobe/backend
```

3. Set up Python environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
nano .env  # Edit with your values
```

5. Run with systemd service:
```ini
# /etc/systemd/system/ai-wardrobe.service
[Unit]
Description=AI Wardrobe Backend
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/Ai-Wardrobe/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

6. Start service:
```bash
sudo systemctl enable ai-wardrobe
sudo systemctl start ai-wardrobe
```

## Post-Deployment Configuration

### 1. Update Firebase Security Rules

Set up Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /wardrobe/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /outfits/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Set up Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. Configure CORS

Update backend CORS settings in `app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Set Up Monitoring

For Cloud Run:
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-wardrobe-backend" --limit 50

# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="AI Wardrobe High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

### 4. Configure Custom Domain

For frontend (Vercel):
```bash
vercel domains add yourdomain.com
```

For backend (Cloud Run):
```bash
gcloud run domain-mappings create \
  --service ai-wardrobe-backend \
  --domain api.yourdomain.com \
  --region us-central1
```

## Testing Deployment

1. Test backend health:
```bash
curl https://your-backend-url.run.app/health
```

2. Test try-on endpoint:
```bash
curl -X POST https://your-backend-url.run.app/tryon \
  -H "Content-Type: application/json" \
  -d '{
    "person_image_url": "https://example.com/person.jpg",
    "clothing_image_url": "https://example.com/clothing.jpg",
    "type": "upper"
  }'
```

3. Test frontend:
   - Visit your frontend URL
   - Sign up / Sign in
   - Upload profile photo
   - Upload wardrobe items
   - Try virtual try-on
   - Save outfit

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check Node.js version (use 18+)
- Clear node_modules and reinstall
- Verify environment variables

**Firebase connection fails:**
- Double-check Firebase config in .env
- Verify Firebase project is active
- Check browser console for errors

### Backend Issues

**Model loading fails:**
- Ensure sufficient memory (4GB+)
- Check PyTorch installation
- Verify GPU availability (if using)

**API timeout:**
- Increase Cloud Run timeout
- Optimize model inference
- Consider async processing

**CORS errors:**
- Update allowed origins
- Check request headers
- Verify preflight requests

## Scaling Considerations

### Frontend
- Use CDN for static assets
- Implement image optimization
- Enable caching headers

### Backend
- Use Cloud Run auto-scaling
- Implement request queuing
- Add Redis for caching
- Consider GPU instances for production

## Security Checklist

- [ ] Firebase security rules configured
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication tokens validated
- [ ] File upload size limits set
- [ ] Error messages don't leak sensitive info
- [ ] Monitoring and logging enabled

## Cost Optimization

### Frontend
- Use serverless hosting (Vercel/Netlify free tier)
- Optimize images before upload
- Implement lazy loading

### Backend
- Use Cloud Run pay-per-use model
- Set min instances to 0
- Implement request batching
- Cache API responses
- Use Cloud Storage lifecycle policies

---

For additional help, refer to the main README.md or create an issue.
