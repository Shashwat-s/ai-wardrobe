@echo off
echo =====================================
echo AI Wardrobe - Reinstall Dependencies
echo =====================================
echo.
echo This will install the CORRECT package for image generation
echo Package: @google/genai (not @google/generative-ai)
echo Model: gemini-2.5-flash-image-preview
echo.

cd backend

echo [1/3] Removing old node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo [2/3] Installing correct dependencies...
call npm install

echo.
echo [3/3] Checking installation...
call npm list @google/genai

echo.
echo =====================================
echo Installation Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Make sure GOOGLE_GEMINI_API_KEY is set in backend/.env
echo 2. Run: npm start
echo 3. Test virtual try-on - clothing should now appear!
echo.
pause
