# Mindful Harmony - Mental Health Web App

A comprehensive mental health web application that combines mood tracking, AI therapy, music therapy, and social support.

## Features

- **Mood-to-Music**: AI-powered playlist generation based on mood
- **Journal + AI Therapy**: Intelligent journaling with empathetic AI responses
- **Mood-to-Activity Recommender**: Personalized activity suggestions
- **Social Support**: Connect with friends and send supportive nudges
- **Profile & Biometrics**: User profiles with optional health tracking
- **Mood History**: Visualize mood trends over time

## Tech Stack

- **Frontend**: React.js with modern UI/UX
- **Backend**: Flask (Python) REST API
- **Database**: MongoDB
- **AI**: Gemini API for sentiment analysis and text generation
- **Music**: Spotify Web API integration
- **Authentication**: JWT tokens

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB
- Spotify Developer Account
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
MONGODB_URI=mongodb://localhost:27017/mindful_harmony
JWT_SECRET=your_jwt_secret_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

5. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

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
- `POST /api/journal/entry` - Create journal entry
- `GET /api/journal/entries` - Get journal entries
- `POST /api/journal/ai-response` - Get AI therapy response

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
