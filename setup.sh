#!/bin/bash

echo "🎵 Welcome to Mindful Harmony Setup! 🎵"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "   You can download it from: https://www.mongodb.com/try/download/community"
    echo ""
fi

echo "✅ Prerequisites check completed!"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update backend/.env with your API keys!"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update frontend/.env with your API configuration!"
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - MONGODB_URI (MongoDB connection string)"
echo "   - JWT_SECRET (random secret key)"
echo "   - SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)"
echo "   - GEMINI_API_KEY (from Google AI Studio)"
echo ""
echo "2. Update frontend/.env with your configuration:"
echo "   - REACT_APP_API_URL (backend API URL)"
echo "   - REACT_APP_SPOTIFY_CLIENT_ID (Spotify client ID)"
echo ""
echo "3. Start MongoDB (if not already running):"
echo "   mongod"
echo ""
echo "4. Start the backend server:"
echo "   cd backend && source venv/bin/activate && python app.py"
echo ""
echo "5. Start the frontend development server:"
echo "   cd frontend && npm start"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "💙 Thank you for using Mindful Harmony!"
