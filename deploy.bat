@echo off
echo 🚀 Swiss Chess Tournament - Deployment Script
echo =============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Clean up any previous build
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Build the application
echo 🏗️  Building the application...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Create deployment package
echo 📦 Creating deployment package...
if not exist deploy mkdir deploy
if not exist deploy\chess-tournament mkdir deploy\chess-tournament

REM Copy necessary files
copy package.json deploy\chess-tournament\
copy server.js deploy\chess-tournament\
copy .htaccess deploy\chess-tournament\
xcopy /e /i dist deploy\chess-tournament\dist

REM Create a zip file (requires 7zip or similar)
echo Creating zip file...
cd deploy
powershell -command "Compress-Archive -Path chess-tournament\* -DestinationPath chess-tournament-deploy.zip"
cd ..

echo ✅ Deployment package created: deploy\chess-tournament-deploy.zip
echo.
echo 📋 Next steps:
echo 1. Upload 'deploy\chess-tournament-deploy.zip' to your cPanel
echo 2. Extract it in your domain's public directory
echo 3. Set up Node.js application in cPanel
echo 4. Run 'npm install' in the application directory
echo 5. Start the Node.js application
echo.
echo 🌐 Your tournament URLs will be:
echo    - https://chess.belovezem.com (main setup)
echo    - https://chess.belovezem.com/1 (tournament 1)
echo    - https://chess.belovezem.com/1#organizer-roshavi4ak (organizer view)
echo.
echo 🔐 Password: 1905
pause