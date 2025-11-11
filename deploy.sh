#!/bin/bash

echo "🚀 Swiss Chess Tournament - Deployment Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean up any previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the application
echo "🏗️  Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy/chess-tournament

# Copy necessary files
cp package.json deploy/chess-tournament/
cp server.js deploy/chess-tournament/
cp .htaccess deploy/chess-tournament/
cp -r dist deploy/chess-tournament/

# Create a zip file
cd deploy
zip -r chess-tournament-deploy.zip chess-tournament/
cd ..

echo "✅ Deployment package created: deploy/chess-tournament-deploy.zip"
echo ""
echo "📋 Next steps:"
echo "1. Upload 'deploy/chess-tournament-deploy.zip' to your cPanel"
echo "2. Extract it in your domain's public directory"
echo "3. Set up Node.js application in cPanel"
echo "4. Run 'npm install' in the application directory"
echo "5. Start the Node.js application"
echo ""
echo "🌐 Your tournament URLs will be:"
echo "   - https://chess.belovezem.com (main setup)"
echo "   - https://chess.belovezem.com/1 (tournament 1)"
echo "   - https://chess.belovezem.com/1#organizer-roshavi4ak (organizer view)"
echo ""
echo "🔐 Password: 1905"