# AI Wardrobe Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd Ai-Wardrobe

# Run setup script
# Linux/Mac:
chmod +x setup.sh
./setup.sh

# Windows:
setup.bat
```

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Email/Password
   - Google Sign-in
4. Create Firestore Database (production mode)
5. Enable Storage
6. Copy your config to `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_URL=http://localhost:8000
```

### Step 3: Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend

# Linux/Mac:
source venv/bin/activate

# Windows:
venv\Scripts\activate

python app.py
```

### Step 4: Open the App

Visit `http://localhost:3000` in your browser!

## 📱 Using the App

1. **Sign Up** - Create an account or sign in with Google
2. **Upload Profile Photo** - Upload a full-body photo
3. **Upload Wardrobe** - Add your clothing items (tops and bottoms)
4. **Try On Outfits** - Mix and match to see virtual try-on
5. **Save Favorites** - Save your best outfit combinations

## 🎨 Key Features

### Mobile-First Design
- The app is optimized for mobile phones
- Preview image appears at the top on mobile
- Easy-to-use tabs for clothing selection
- One-hand friendly navigation

### Try-On Page
- Select topwear and bottomwear
- See instant AI-generated preview
- Selected items shown as thumbnails
- Save complete outfits

### Dashboard
- View all saved outfits
- Delete unwanted combinations
- Full-screen outfit viewing

## 🔧 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

### Firebase connection error
- Double-check all credentials in `.env`
- Make sure Firebase project is active
- Verify Authentication and Storage are enabled

### API not connecting
- Check backend is running on port 8000
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

## 📚 Learn More

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## 💡 Tips

- Use well-lit photos for best results
- Plain backgrounds work better
- Upload multiple clothing items to experiment
- Try different outfit combinations

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed docs
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Create an issue on GitHub for bugs
- Join our community discussions

---

Happy styling! 👕👖✨
