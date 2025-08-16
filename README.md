# Mindful Harmony - Mental Health Web App

A comprehensive mental health web application that combines mood tracking, AI therapy, music therapy, and social support.

## Features

- **Journal AI Therapy / Venting to AI**: Intelligent journaling with empathetic AI responses using OpenAI GPT-4o-mini or Google Gemini
- **Voice Toggle Mode**: Speech-to-text functionality using Web Speech API and OpenAI Whisper
- **Mood-to-Activity Recommender**: Personalized activity suggestions based on mood, energy, time, and context
- **Mood-to-Music**: AI-powered playlist generation based on mood
- **Social Support**: Connect with friends and send supportive nudges
- **Profile & Biometrics**: User profiles with optional health tracking
- **Mood History**: Visualize mood trends over time

## Tech Stack

- **Frontend**: React.js with Tailwind CSS and Framer Motion
- **Backend**: Flask (Python) REST API
- **Database**: MongoDB Atlas
- **AI**: OpenAI GPT-4o-mini and Google Gemini for sentiment analysis and text generation
- **Voice**: Web Speech API and OpenAI Whisper for speech-to-text
- **Music**: Spotify Web API integration
- **Authentication**: JWT tokens

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB Atlas account
- Spotify Developer Account
- OpenAI API key (for GPT-4o-mini and Whisper)
- Google AI Studio Account (for Gemini API)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Ignition-Hacks
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Variables**
Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_DB=ignition

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# AI Provider Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

**Frontend (.env):**
```
REACT_APP_API_BASE=http://localhost:5001
```

5. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Mood & Music
- `POST /api/mood/submit` - Submit mood and get playlist
- `GET /api/mood/history` - Get mood history
- `POST /api/music/generate` - Generate mood-based playlist

### Journal
- `POST /api/journal` - Create journal entry with AI analysis
- `GET /api/journal` - Get journal entries
- `POST /api/journal/ai-response` - Get AI therapy response

### Activities
- `POST /api/activities/recommendations/activities` - Get activity recommendations
- `POST /api/activities/complete` - Mark activity as completed
- `GET /api/activities/history` - Get activity history

### Voice
- `POST /api/voice/transcribe` - Transcribe audio using OpenAI Whisper

### Activities
- `GET /api/activities/recommend` - Get activity recommendations
- `POST /api/activities/log` - Log completed activity

### Social
- `POST /api/social/friend-request` - Send friend request
- `GET /api/social/friends` - Get friends list
- `POST /api/social/nudge` - Send supportive nudge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
