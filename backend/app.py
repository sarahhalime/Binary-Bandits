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

# Import database
from models.database import init_db

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Production Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'fallback-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI')

# Environment-based CORS configuration
FRONTEND_URLS = [
    'http://localhost:3000',  # Local development
    'http://localhost:3001',  # Alternative local
    os.getenv('FRONTEND_URL', ''),  # Production frontend URL
]

# Filter out empty URLs
FRONTEND_URLS = [url for url in FRONTEND_URLS if url]

# Initialize extensions
CORS(app, 
     origins=FRONTEND_URLS, 
     supports_credentials=True,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     resources={r"/api/*": {"origins": FRONTEND_URLS}})
jwt = JWTManager(app)

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(mood_bp, url_prefix='/api/mood')
app.register_blueprint(journal_bp, url_prefix='/api/journal')
app.register_blueprint(activities_bp, url_prefix='/api/activities')
app.register_blueprint(social_bp, url_prefix='/api/social')
app.register_blueprint(music_bp, url_prefix='/api/music')
app.register_blueprint(profile_bp, url_prefix='/api/profile')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'Mindful Harmony API is running'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
