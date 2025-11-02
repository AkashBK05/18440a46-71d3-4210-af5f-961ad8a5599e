#!/bin/bash

echo "🚀 Setting up Ampd Energy Device Savings API..."
echo "Repository UUID: 4841cb59-343d-48ae-955e-2a549a387422"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Current Node.js version: $node_version"

if [[ "$node_version" != "v18.19.0" ]]; then
    echo "⚠️  Warning: This project is designed for Node.js v18.19.0"
    echo "   Current version: $node_version"
    echo "   Consider using nvm to switch versions:"
    echo "   nvm install 18.19.0 && nvm use 18.19.0"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
echo "For development with auto-reload:"
echo "  npm run dev"