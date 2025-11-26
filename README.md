# AI Wardrobe - Virtual Try-On Application

A full-stack web application that allows users to virtually try on clothing using AI-powered virtual try-on technology.

## 🌟 Features

- **User Authentication**: Firebase Authentication with Google Sign-in and Email/Password
- **Profile Management**: Upload full-body photos for virtual try-on
- **Wardrobe Management**: Upload and organize topwear and bottomwear items
- **AI Virtual Try-On**: Real-time clothing try-on using NanoBanana VTON technology
- **Mobile-First Design**: Fully responsive UI optimized for mobile devices
- **Outfit Saving**: Save and manage favorite outfit combinations
- **Real-time Preview**: Instant preview updates when selecting clothing items

## 🏗️ Architecture

### Frontend
- **React 18** with Vite for fast development
- **TailwindCSS** for mobile-first responsive design
- **React Router** for navigation
- **Firebase SDK** for authentication and storage
- **Axios** for API communication

### Backend
- **Node.js & Express** server
- **Google Gemini** AI model integration
- **Firebase Admin SDK** for storage management
- **Sharp** for image processing
- **Cloud Run** ready deployment

## 📁 Project Structure

```
Ai-Wardrobe/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── ClothingGrid.jsx
│   │   │   ├── SelectedClothingBadge.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadProfilePhoto.jsx
│   │   │   ├── UploadWardrobe.jsx
│   │   │   └── TryWardrobe.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── firebase/
│   │   │   ├── config.js
│   │   │   ├── storage.js
│   │   │   └── firestore.js
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── tryonApi.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── backend/
│   ├── server.js
│   ├── services/
│   │   └── geminiTryOn.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- Google Cloud account (for Cloud Run deployment)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. (Optional) Use nvm for Node version:
```bash
nvm use 18
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Configure environment variables in `.env`:
```env
PORT=8000
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

6. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:8000`

## 🔥 Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers

3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

4. Enable Storage:
   - Go to Storage
   - Get started and enable storage
   - Set up security rules (see below)

### Firestore Security Rules

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

### Storage Security Rules

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

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
npm i -g vercel
vercel --prod
```

Or deploy to Netlify:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Backend Deployment (Google Cloud Run)

1. Build the Docker image:
```bash
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/ai-wardrobe-backend .
```

2. Push to Google Container Registry:
```bash
docker push gcr.io/YOUR_PROJECT_ID/ai-wardrobe-backend
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy ai-wardrobe-backend \
  --image gcr.io/YOUR_PROJECT_ID/ai-wardrobe-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --timeout 300
```

## 🎨 Mobile-First UI Features

### Try-On Page Layout

**Mobile (<768px):**
- Preview image at the top (full width)
- Selected clothing badges below preview
- Horizontal tabs for topwear/bottomwear
- Scrollable clothing grid
- Save button at bottom

**Desktop (≥768px):**
- Split screen layout
- Left: Large preview + selected items
- Right: Clothing tabs and grid
- Better use of horizontal space

### Key Mobile Features

- Touch-friendly buttons with visual feedback
- Horizontal scrolling for clothing items
- Bottom navigation bar for easy thumb access
- Safe area insets for notched devices
- Optimized image loading
- Smooth animations and transitions

## 🔧 API Documentation

### POST /tryon

Generate a virtual try-on image.

**Request:**
```json
{
  "person_image_url": "https://storage.googleapis.com/...",
  "clothing_image_url": "https://storage.googleapis.com/...",
  "type": "upper"  // or "lower"
}
```

**Response:**
```json
{
  "output_url": "https://storage.googleapis.com/...",
  "message": "Try-on generated successfully"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Backend Testing
```bash
cd backend
npm test
```

## 📱 Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for the AI try-on technology
- Firebase for backend services
- TailwindCSS for the UI framework
- Express for the backend API

## 📞 Support

For support, email support@aiwardrobe.com or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Add more clothing categories (accessories, shoes)
- [ ] Implement outfit recommendations
- [ ] Add social sharing features
- [ ] Multi-language support
- [ ] Advanced editing tools
- [ ] AR try-on using camera

---

Made with ❤️ by the AI Wardrobe Team
