# AI Wardrobe Frontend

React + Vite application for virtual try-on wardrobe management.

## Quick Start

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:8000
```

## Features

- Firebase Authentication (Email/Password + Google)
- Image upload to Firebase Storage
- Real-time wardrobe management
- AI-powered virtual try-on
- Mobile-first responsive design
- Outfit saving and management

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router
- Firebase SDK
- Axios
- Lucide React Icons
- React Hot Toast

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── context/         # React context providers
├── firebase/        # Firebase configuration and utilities
├── api/             # API client and services
├── styles/          # Global styles
├── App.jsx          # Main app component with routing
└── main.jsx         # Application entry point
```

## Mobile-First Design

The application is built with a mobile-first approach:

- Responsive layouts using TailwindCSS
- Touch-friendly interfaces
- Bottom navigation on mobile
- Optimized image loading
- Safe area support for notched devices

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
