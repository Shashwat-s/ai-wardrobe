#!/bin/bash

# AI Wardrobe Setup Script
# This script helps set up the complete development environment

echo "================================"
echo "AI Wardrobe Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.10+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update frontend/.env with your Firebase credentials"
fi

echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend setup complete"
else
    echo "❌ Frontend setup failed"
    exit 1
fi

cd ..
echo ""

# Backend Setup
echo "🐍 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your configuration"
fi

echo "Installing backend dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend setup complete"
else
    echo "❌ Backend setup failed"
    exit 1
fi

cd ..
echo ""

# Final Instructions
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Firebase:"
echo "   - Create a Firebase project at https://console.firebase.google.com"
echo "   - Enable Authentication (Email/Password + Google)"
echo "   - Enable Firestore Database"
echo "   - Enable Storage"
echo "   - Copy credentials to frontend/.env"
echo ""
echo "2. Start the development servers:"
echo ""
echo "   Terminal 1 (Frontend):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "   Terminal 2 (Backend):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md"
echo "================================"
