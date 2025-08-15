from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from models.user import User
from datetime import datetime, timedelta
from bson import ObjectId

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_mood():
    """Submit a new mood entry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('mood'):
            return jsonify({'error': 'Mood is required'}), 400
        
        mood = data['mood'].lower()
        intensity = data.get('intensity', 5)  # 1-10 scale
        notes = data.get('notes', '')
        
        # Validate mood intensity
        if not (1 <= intensity <= 10):
            return jsonify({'error': 'Intensity must be between 1 and 10'}), 400
        
        # Create mood entry
        mood_entry = {
            'user_id': ObjectId(user_id),
            'mood': mood,
            'intensity': intensity,
            'notes': notes,
            'timestamp': datetime.utcnow(),
            'activities': data.get('activities', []),
            'weather': data.get('weather', ''),
            'location': data.get('location', '')
        }
        
        db = get_db()
        result = db.mood_entries.insert_one(mood_entry)
        
        # Get mood insights
        insights = get_mood_insights(user_id, mood, intensity)
        
        return jsonify({
            'message': 'Mood submitted successfully',
            'mood_entry': {
                'id': str(result.inserted_id),
                'mood': mood,
                'intensity': intensity,
                'timestamp': mood_entry['timestamp'].isoformat(),
                'insights': insights
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mood_bp.route('/history', methods=['GET'])
@jwt_required()
def get_mood_history():
    """Get user's mood history"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get mood entries
        entries = list(db.mood_entries.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for entry in entries:
            entry['id'] = str(entry['_id'])
            entry['timestamp'] = entry['timestamp'].isoformat()
            del entry['_id']
        
        # Calculate mood statistics
        stats = calculate_mood_stats(entries)
        
        return jsonify({
            'entries': entries,
            'statistics': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mood_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_mood():
    """Get user's most recent mood"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Demo mode - return a sample mood entry
        if db is None:
            demo_entry = {
                'id': 'demo_mood_123',
                'mood': 'calm',
                'intensity': 6,
                'notes': 'Feeling peaceful today',
                'timestamp': datetime.utcnow().isoformat(),
                'activities': ['meditation', 'walking'],
                'weather': 'sunny',
                'location': 'home'
            }
            return jsonify({
                'current_mood': demo_entry
            }), 200
        
        # Get most recent mood entry
        entry = db.mood_entries.find_one(
            {'user_id': ObjectId(user_id)},
            sort=[('timestamp', -1)]
        )
        
        if not entry:
            return jsonify({'message': 'No mood entries found'}), 404
        
        entry['id'] = str(entry['_id'])
        entry['timestamp'] = entry['timestamp'].isoformat()
        del entry['_id']
        
        return jsonify({
            'current_mood': entry
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mood_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_mood_trends():
    """Get mood trends and patterns"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get mood entries for trend analysis
        entries = list(db.mood_entries.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', 1))
        
        # Calculate trends
        trends = analyze_mood_trends(entries)
        
        return jsonify({
            'trends': trends
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_mood_insights(user_id, mood, intensity):
    """Generate insights based on mood submission"""
    insights = {
        'message': '',
        'suggestions': []
    }
    
    # Mood-specific insights
    if mood in ['happy', 'joyful', 'excited']:
        insights['message'] = "Great to see you're feeling positive! Keep up the good energy."
        insights['suggestions'] = [
            "Share your joy with friends",
            "Try some upbeat music",
            "Take a walk in nature"
        ]
    elif mood in ['sad', 'depressed', 'down']:
        insights['message'] = "It's okay to feel this way. Remember, this too shall pass."
        insights['suggestions'] = [
            "Practice self-compassion",
            "Listen to calming music",
            "Reach out to a friend"
        ]
    elif mood in ['anxious', 'worried', 'stressed']:
        insights['message'] = "Anxiety is a natural response. Let's help you find some calm."
        insights['suggestions'] = [
            "Try deep breathing exercises",
            "Listen to soothing sounds",
            "Write down your thoughts"
        ]
    elif mood in ['angry', 'frustrated', 'irritated']:
        insights['message'] = "Anger is a valid emotion. Let's channel it constructively."
        insights['suggestions'] = [
            "Take a few deep breaths",
            "Go for a walk or run",
            "Write about what's bothering you"
        ]
    else:
        insights['message'] = "Thank you for sharing your mood. How can we support you today?"
        insights['suggestions'] = [
            "Try some mood-lifting activities",
            "Connect with friends",
            "Practice mindfulness"
        ]
    
    # Intensity-based insights
    if intensity >= 8:
        insights['message'] += " Your mood intensity is quite high. Consider reaching out for support if needed."
    elif intensity <= 3:
        insights['message'] += " Your mood seems quite low. Remember, it's okay to ask for help."
    
    return insights

def calculate_mood_stats(entries):
    """Calculate mood statistics"""
    if not entries:
        return {}
    
    mood_counts = {}
    total_intensity = 0
    mood_intensities = {}
    
    for entry in entries:
        mood = entry['mood']
        intensity = entry['intensity']
        
        # Count moods
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        # Track intensities
        total_intensity += intensity
        if mood not in mood_intensities:
            mood_intensities[mood] = []
        mood_intensities[mood].append(intensity)
    
    # Calculate averages
    avg_intensity = total_intensity / len(entries)
    mood_avg_intensities = {}
    for mood, intensities in mood_intensities.items():
        mood_avg_intensities[mood] = sum(intensities) / len(intensities)
    
    # Find most common mood
    most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else None
    
    return {
        'total_entries': len(entries),
        'average_intensity': round(avg_intensity, 2),
        'mood_distribution': mood_counts,
        'mood_avg_intensities': mood_avg_intensities,
        'most_common_mood': most_common_mood
    }

def analyze_mood_trends(entries):
    """Analyze mood trends over time"""
    if not entries:
        return {}
    
    # Group by day
    daily_moods = {}
    for entry in entries:
        date = entry['timestamp'].date()
        if date not in daily_moods:
            daily_moods[date] = []
        daily_moods[date].append(entry)
    
    # Calculate daily averages
    daily_averages = {}
    for date, day_entries in daily_moods.items():
        avg_intensity = sum(entry['intensity'] for entry in day_entries) / len(day_entries)
        daily_averages[date.isoformat()] = round(avg_intensity, 2)
    
    # Detect patterns
    patterns = {
        'improving': False,
        'declining': False,
        'stable': False
    }
    
    if len(daily_averages) >= 7:
        recent_avg = sum(list(daily_averages.values())[-7:]) / 7
        earlier_avg = sum(list(daily_averages.values())[:7]) / 7
        
        if recent_avg > earlier_avg + 1:
            patterns['improving'] = True
        elif recent_avg < earlier_avg - 1:
            patterns['declining'] = True
        else:
            patterns['stable'] = True
    
    return {
        'daily_averages': daily_averages,
        'patterns': patterns,
        'total_days': len(daily_averages)
    }
