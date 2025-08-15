# 🎵 Mindful Harmony - Complete Setup & Verification Guide

This guide will help you set up the project and verify that all features work correctly with the built-in demo user.

## 📋 Prerequisites

Before starting, ensure you have:
- **Python 3.8+** installed
- **Node.js 16+** installed
- **MongoDB** (optional - project works in demo mode without it)

## 🚀 Quick Setup

### 1. Clone and Navigate to Project
```bash
git clone <your-repository-url>
cd Ignition-Hacks
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy env.example .env  # Windows
cp env.example .env    # macOS/Linux
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
copy env.example .env  # Windows
cp env.example .env    # macOS/Linux
```

## ⚙️ Environment Configuration

### Backend Environment (.env)
Update `backend/.env` with the following minimum configuration:

```env
# Database Configuration (optional - works without MongoDB)
MONGODB_URI=mongodb://localhost:27017/mindful_harmony

# JWT Configuration (required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# API Keys (optional for demo mode)
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Environment (.env)
Update `frontend/.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Spotify Configuration (optional)
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

## 🏃‍♂️ Running the Application

### 1. Start Backend Server
```bash
cd backend
# Ensure virtual environment is activated
python app.py
```

You should see:
```
✅ Successfully connected to MongoDB
✅ Database indexes created successfully
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[::1]:5000
```

Or if MongoDB is not available:
```
❌ Failed to connect to MongoDB: [Errno 111] Connection refused
⚠️  Running in demo mode without database. Some features will be limited.
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
```

### 2. Start Frontend Server
```bash
cd frontend
npm start
```

The frontend should open at `http://localhost:3000`

## 🧪 Verification Checklist

### 1. Basic Connectivity ✅
- [ ] Backend health check: Visit `http://localhost:5000/api/health`
- [ ] Frontend loads: Visit `http://localhost:3000`
- [ ] No console errors in browser

### 2. Demo User Authentication ✅

The project includes a built-in demo account:
- **Email**: `demo@mindfulharmony.com`
- **Password**: `demo123`

**Login Steps:**
1. Navigate to login page
2. Enter demo credentials
3. Click "Sign In"
4. Should redirect to home page with welcome message

### 3. Feature Verification ✅

After logging in with the demo user, verify each feature:

#### 🏠 Home/Dashboard
- [ ] Dashboard loads with user info
- [ ] Navigation menu is accessible
- [ ] User profile displays correctly

#### 😊 Mood Tracking
- [ ] Can access mood tracking page
- [ ] Can submit mood entries
- [ ] Mood history displays (demo data or empty state)
- [ ] Mood trends visualization works

#### 📝 Journal
- [ ] Can create new journal entries
- [ ] Can view journal history
- [ ] AI response feature works (if Gemini API configured)
- [ ] Can edit/delete entries

#### 🎯 Activities
- [ ] Activity recommendations load
- [ ] Can log activities
- [ ] Activity history displays
- [ ] Activity stats show correctly

#### 👥 Social Features
- [ ] Can view friend code: `DEMO1234`
- [ ] Can send friend requests (to other demo users)
- [ ] Social feed loads
- [ ] Nudges feature works

#### 🎵 Music
- [ ] Music page loads
- [ ] Mood-based playlist generation works (if Spotify API configured)
- [ ] Music recommendations display
- [ ] Favorites functionality works

#### 👤 Profile
- [ ] Profile page displays user info
- [ ] Can update profile information
- [ ] Biometrics tracking works
- [ ] Profile stats display

### 4. API Endpoints Testing ✅

Test key endpoints directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Login with demo user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mindfulharmony.com","password":"demo123"}'
```

## 🐛 Troubleshooting

### Common Issues:

#### Backend won't start
- Check Python version: `python --version`
- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

#### Frontend won't start
- Check Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

#### Database connection issues
- The app works in demo mode without MongoDB
- If you want to use MongoDB, ensure it's running: `mongod`

#### API connection issues
- Check backend is running on port 5000
- Verify REACT_APP_API_URL in frontend/.env
- Check browser console for CORS errors

#### Authentication issues
- Use exact demo credentials: `demo@mindfulharmony.com` / `demo123`
- Check JWT_SECRET is set in backend/.env
- Clear browser localStorage if needed

### Demo Mode vs Full Mode

**Demo Mode (No Database):**
- ✅ Authentication works with demo user
- ✅ All pages load correctly
- ✅ UI components function
- ⚠️ Data doesn't persist between sessions
- ⚠️ Limited social features

**Full Mode (With Database):**
- ✅ All demo mode features
- ✅ Data persistence
- ✅ Full social features
- ✅ Multiple user accounts

## 🎯 Production Readiness

Before deploying to production:

1. **Security:**
   - Change JWT_SECRET to a secure random string
   - Use environment variables for all secrets
   - Enable HTTPS

2. **Database:**
   - Set up MongoDB Atlas or hosted MongoDB
   - Update MONGODB_URI

3. **APIs:**
   - Configure Spotify Developer App
   - Set up Google AI (Gemini) API
   - Update respective API keys

4. **Build:**
   - Frontend: `npm run build`
   - Backend: Configure production WSGI server

## 📞 Support

If you encounter issues:
1. Check this verification guide
2. Review console logs for errors
3. Ensure all prerequisites are installed
4. Try demo mode first (without MongoDB)

---

## ✨ Demo User Credentials

**Email**: `demo@mindfulharmony.com`  
**Password**: `demo123`  
**Friend Code**: `DEMO1234`

This demo user has access to all features and provides a complete demonstration of the application's capabilities. 