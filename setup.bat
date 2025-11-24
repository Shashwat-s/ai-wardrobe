@echo off
REM AI Wardrobe Setup Script for Windows
REM This script helps set up the complete development environment

echo ================================
echo AI Wardrobe Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Python is not installed. Please install Python 3.10+ first.
    exit /b 1
)

echo + Prerequisites check passed
echo.

REM Frontend Setup
echo Setting up Frontend...
cd frontend

if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ! Please update frontend\.env with your Firebase credentials
)

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo + Frontend setup complete
) else (
    echo X Frontend setup failed
    exit /b 1
)

cd ..
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ! Please update backend\.env with your configuration
)

echo Installing backend dependencies...
pip install -r requirements.txt

if %ERRORLEVEL% EQU 0 (
    echo + Backend setup complete
) else (
    echo X Backend setup failed
    exit /b 1
)

cd ..
echo.

REM Final Instructions
echo ================================
echo + Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Configure Firebase:
echo    - Create a Firebase project at https://console.firebase.google.com
echo    - Enable Authentication (Email/Password + Google)
echo    - Enable Firestore Database
echo    - Enable Storage
echo    - Copy credentials to frontend\.env
echo.
echo 2. Start the development servers:
echo.
echo    Terminal 1 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo    Terminal 2 (Backend):
echo    cd backend
echo    venv\Scripts\activate
echo    python app.py
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md
echo ================================

pause
