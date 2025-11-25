import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import SavedOutfits from './pages/SavedOutfits';
import UploadProfilePhoto from './pages/UploadProfilePhoto';
import UploadWardrobe from './pages/UploadWardrobe';
import TryWardrobe from './pages/TryWardrobe';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-profile"
          element={
            <ProtectedRoute>
              <UploadProfilePhoto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-wardrobe"
          element={
            <ProtectedRoute>
              <UploadWardrobe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/try-wardrobe"
          element={
            <ProtectedRoute>
              <TryWardrobe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-outfits"
          element={
            <ProtectedRoute>
              <SavedOutfits />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
