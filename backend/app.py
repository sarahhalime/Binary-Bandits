# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

# Import routes
from routes.auth import auth_bp
from routes.mood import mood_bp
from routes.journal import journal_bp
from routes.activities import activities_bp
from routes.social import social_bp
from routes.music import music_bp
from routes.profile import profile_bp
from routes.voice import voice_bp

# Import database
from models.database import init_db, get_db  

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/mindful_harmony')
app.config['MONGO_DB'] = os.getenv('MONGO_DB', 'ignition')

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]}}, supports_credentials=True)
jwt = JWTManager(app)

# Initialize database
init_db(app)

# Register blueprints (each file uses root path "/" so final URLs are exactly these)
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(mood_bp, url_prefix='/api/mood')
app.register_blueprint(journal_bp, url_prefix='/api/journal')
app.register_blueprint(activities_bp, url_prefix='/api/activities')
app.register_blueprint(social_bp, url_prefix='/api/social')
app.register_blueprint(music_bp, url_prefix='/api/music')
app.register_blueprint(voice_bp, url_prefix='/api/voice')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'Mindful Harmony API is running'
    })

@app.route('/api/health/db', methods=['GET'])
def health_check_db():
    try:
        db = get_db()
        if db is not None:
            db.command('ping')
            return jsonify({'db': 'ok'}), 200
        else:
            return jsonify({'db': 'demo_mode'}), 200
    except Exception as e:
        return jsonify({'db': 'error', 'message': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # change port here if 5001 is busy
    app.run(debug=True, host='0.0.0.0', port=5001)
