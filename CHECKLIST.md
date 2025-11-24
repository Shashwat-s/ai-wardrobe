# Setup Checklist

Use this checklist to ensure your AI Wardrobe application is properly configured and ready for development or deployment.

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Firebase account created
- [ ] Google Cloud account (for backend deployment)

## ✅ Firebase Configuration

### Authentication Setup
- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Google Sign-in authentication enabled
- [ ] Authorized domains configured

### Firestore Database
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Test read/write permissions
- [ ] Indexes created (auto-created on first use)

### Storage
- [ ] Storage bucket enabled
- [ ] Security rules deployed
- [ ] CORS configuration set
- [ ] Test file upload

### Get Credentials
- [ ] Firebase config values copied
- [ ] Service account key downloaded (for backend)
- [ ] Storage bucket name noted

## ✅ Frontend Setup

### Installation
- [ ] Navigate to `frontend/` directory
- [ ] Run `npm install`
- [ ] No installation errors

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `VITE_FIREBASE_API_KEY` set
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` set
- [ ] `VITE_FIREBASE_PROJECT_ID` set
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` set
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `VITE_FIREBASE_APP_ID` set
- [ ] `VITE_API_URL` set (http://localhost:8000 for development)

### Testing
- [ ] Run `npm run dev`
- [ ] App opens at http://localhost:3000
- [ ] No console errors
- [ ] Can navigate to auth page

## ✅ Backend Setup

### Installation
- [ ] Navigate to `backend/` directory
- [ ] Python virtual environment created (`python -m venv venv`)
- [ ] Virtual environment activated
- [ ] Run `pip install -r requirements.txt`
- [ ] No installation errors

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `PORT` set (8000 for development)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` path set (optional)
- [ ] `FIREBASE_STORAGE_BUCKET` set (optional)

### Testing
- [ ] Run `python app.py`
- [ ] Server starts on port 8000
- [ ] Visit http://localhost:8000
- [ ] See API information
- [ ] Visit http://localhost:8000/health
- [ ] Health check returns "healthy"

## ✅ Integration Testing

### Authentication Flow
- [ ] Can access login page
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Redirects to dashboard after login
- [ ] Can log out

### Profile Photo Upload
- [ ] Can access upload profile page
- [ ] Can select image file
- [ ] Image uploads successfully
- [ ] Preview shows uploaded image
- [ ] Image stored in Firebase Storage
- [ ] Can continue to wardrobe upload

### Wardrobe Upload
- [ ] Can switch between topwear/bottomwear tabs
- [ ] Can upload single image
- [ ] Can upload multiple images
- [ ] Images appear in grid
- [ ] Can delete uploaded items
- [ ] Items stored in Firestore
- [ ] Can continue to try-on page

### Try-On Functionality
- [ ] Profile photo displays in preview
- [ ] Wardrobe items load in tabs
- [ ] Can select topwear item
- [ ] API call triggered on selection
- [ ] Loading indicator shows
- [ ] Preview updates after generation
- [ ] Can select bottomwear item
- [ ] Both selections work together
- [ ] Selected items show as thumbnails
- [ ] Can save complete outfit

### Dashboard
- [ ] Saved outfits display in grid
- [ ] Can click to view outfit details
- [ ] Full-screen modal works
- [ ] Can delete saved outfits
- [ ] Deletion updates list

### Mobile Responsiveness
- [ ] Test on mobile viewport (< 768px)
- [ ] Bottom navigation visible
- [ ] Preview at top on try-on page
- [ ] Tabs work correctly
- [ ] Touch interactions smooth
- [ ] Images load properly
- [ ] All buttons accessible

## ✅ Pre-Deployment Checklist

### Frontend
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Run `npm run build` successfully
- [ ] Test production build (`npm run preview`)
- [ ] No console errors in production mode
- [ ] All environment variables in hosting platform

### Backend
- [ ] Production environment variables configured
- [ ] CORS origins updated for production domain
- [ ] Firebase service account key secured
- [ ] Docker image builds successfully
- [ ] Health check endpoint working
- [ ] API timeout configured appropriately

### Security
- [ ] Firebase security rules reviewed and deployed
- [ ] No sensitive data in code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] File upload limits set
- [ ] Rate limiting considered

### Monitoring
- [ ] Error tracking configured (optional)
- [ ] Logging enabled
- [ ] Health check endpoint monitored
- [ ] Analytics configured (optional)

## ✅ Documentation

- [ ] README.md reviewed
- [ ] QUICKSTART.md followed
- [ ] DEPLOYMENT.md steps completed
- [ ] Environment variables documented
- [ ] Team members can set up locally

## ✅ Optional Enhancements

- [ ] Add rate limiting
- [ ] Implement caching
- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Add analytics tracking
- [ ] Set up error monitoring
- [ ] Create backup strategy
- [ ] Write unit tests
- [ ] Add E2E tests
- [ ] Performance optimization

## 🎉 Launch Checklist

- [ ] All above items completed
- [ ] Tested with real user data
- [ ] Load testing performed (optional)
- [ ] Backup and recovery plan in place
- [ ] Monitoring dashboards set up
- [ ] Support email configured
- [ ] Documentation finalized
- [ ] Team trained on deployment process

---

## 📝 Notes

Use this section to track any issues or special configurations:

```
Date: _______________
Notes:



Issues:



```

---

**Checklist Version**: 1.0
**Last Updated**: November 2025
