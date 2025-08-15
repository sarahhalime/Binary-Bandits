from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from services.ai_service import generate_activity_suggestions
from datetime import datetime, timedelta
from bson import ObjectId

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/recommend', methods=['GET'])
@jwt_required()
def get_activity_recommendations():
    """Get activity recommendations based on mood"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get current mood from query parameters or recent mood entry
        mood = request.args.get('mood', '')
        intensity = request.args.get('intensity', 5, type=int)
        
        # If no mood provided, get from recent mood entry
        if not mood:
            recent_mood = db.mood_entries.find_one(
                {'user_id': ObjectId(user_id)},
                sort=[('timestamp', -1)]
            )
            if recent_mood:
                mood = recent_mood.get('mood', 'neutral')
                intensity = recent_mood.get('intensity', 5)
        
        # Generate AI-powered activity suggestions
        activities = generate_activity_suggestions(mood, intensity)
        
        # Add some predefined activities based on mood
        predefined_activities = get_predefined_activities(mood, intensity)
        
        return jsonify({
            'mood': mood,
            'intensity': intensity,
            'ai_suggestions': activities,
            'predefined_activities': predefined_activities,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/log', methods=['POST'])
@jwt_required()
def log_activity():
    """Log a completed activity"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('activity_name'):
            return jsonify({'error': 'Activity name is required'}), 400
        
        activity_name = data['activity_name']
        duration = data.get('duration', 0)
        mood_before = data.get('mood_before', '')
        mood_after = data.get('mood_after', '')
        notes = data.get('notes', '')
        
        # Create activity log entry
        activity_entry = {
            'user_id': ObjectId(user_id),
            'activity_name': activity_name,
            'duration': duration,
            'mood_before': mood_before,
            'mood_after': mood_after,
            'notes': notes,
            'timestamp': datetime.utcnow(),
            'completed': True
        }
        
        db = get_db()
        result = db.activities.insert_one(activity_entry)
        
        return jsonify({
            'message': 'Activity logged successfully',
            'activity': {
                'id': str(result.inserted_id),
                'activity_name': activity_name,
                'duration': duration,
                'timestamp': activity_entry['timestamp'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/history', methods=['GET'])
@jwt_required()
def get_activity_history():
    """Get user's activity history"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get activity entries
        entries = list(db.activities.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for entry in entries:
            entry['id'] = str(entry['_id'])
            entry['timestamp'] = entry['timestamp'].isoformat()
            del entry['_id']
        
        # Calculate activity statistics
        stats = calculate_activity_stats(entries)
        
        return jsonify({
            'entries': entries,
            'statistics': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_activity_stats():
    """Get detailed activity statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get activity entries for analysis
        entries = list(db.activities.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', 1))
        
        # Calculate detailed statistics
        stats = calculate_detailed_activity_stats(entries)
        
        return jsonify({
            'statistics': stats,
            'period_days': days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_predefined_activities(mood, intensity):
    """Get predefined activities based on mood"""
    mood_lower = mood.lower()
    
    # Breathing exercises for all moods
    breathing_activities = [
        {
            'name': '4-7-8 Breathing',
            'description': 'Inhale for 4, hold for 7, exhale for 8',
            'duration': '5 minutes',
            'benefit': 'Calms the nervous system',
            'category': 'breathing'
        },
        {
            'name': 'Box Breathing',
            'description': 'Equal inhale, hold, exhale, hold (4 counts each)',
            'duration': '3-5 minutes',
            'benefit': 'Reduces stress and anxiety',
            'category': 'breathing'
        }
    ]
    
    # Mood-specific activities
    if any(word in mood_lower for word in ['sad', 'depressed', 'down', 'blue']):
        return breathing_activities + [
            {
                'name': 'Gratitude Journal',
                'description': 'Write down 3 things you\'re grateful for',
                'duration': '5 minutes',
                'benefit': 'Shifts focus to positive aspects',
                'category': 'mindfulness'
            },
            {
                'name': 'Gentle Yoga',
                'description': 'Simple stretching and breathing poses',
                'duration': '10-15 minutes',
                'benefit': 'Releases tension and improves mood',
                'category': 'movement'
            },
            {
                'name': 'Nature Walk',
                'description': 'Take a slow walk outdoors',
                'duration': '15-20 minutes',
                'benefit': 'Connects you with nature and fresh air',
                'category': 'outdoor'
            }
        ]
    elif any(word in mood_lower for word in ['anxious', 'worried', 'stressed']):
        return breathing_activities + [
            {
                'name': 'Progressive Muscle Relaxation',
                'description': 'Tense and relax each muscle group',
                'duration': '10 minutes',
                'benefit': 'Releases physical tension',
                'category': 'relaxation'
            },
            {
                'name': 'Mindful Observation',
                'description': 'Focus on one object for 5 minutes',
                'duration': '5 minutes',
                'benefit': 'Grounds you in the present moment',
                'category': 'mindfulness'
            },
            {
                'name': 'Gentle Stretching',
                'description': 'Slow, controlled stretches',
                'duration': '10 minutes',
                'benefit': 'Relieves muscle tension',
                'category': 'movement'
            }
        ]
    elif any(word in mood_lower for word in ['angry', 'frustrated', 'irritated']):
        return breathing_activities + [
            {
                'name': 'Physical Exercise',
                'description': 'Quick workout or brisk walk',
                'duration': '15-20 minutes',
                'benefit': 'Releases pent-up energy',
                'category': 'movement'
            },
            {
                'name': 'Write It Out',
                'description': 'Write down your feelings',
                'duration': '10 minutes',
                'benefit': 'Provides emotional outlet',
                'category': 'expression'
            },
            {
                'name': 'Cold Shower',
                'description': 'Brief cold water exposure',
                'duration': '2-3 minutes',
                'benefit': 'Calms the nervous system',
                'category': 'physical'
            }
        ]
    else:
        return breathing_activities + [
            {
                'name': 'Quick Meditation',
                'description': 'Sit quietly and focus on your breath',
                'duration': '5-10 minutes',
                'benefit': 'Centers and calms the mind',
                'category': 'mindfulness'
            },
            {
                'name': 'Light Exercise',
                'description': 'Simple movements like walking or stretching',
                'duration': '10-15 minutes',
                'benefit': 'Boosts mood and energy',
                'category': 'movement'
            },
            {
                'name': 'Creative Expression',
                'description': 'Draw, write, or create something',
                'duration': '15 minutes',
                'benefit': 'Provides emotional outlet',
                'category': 'creative'
            }
        ]

def calculate_activity_stats(entries):
    """Calculate basic activity statistics"""
    if not entries:
        return {}
    
    total_activities = len(entries)
    total_duration = sum(entry.get('duration', 0) for entry in entries)
    activity_counts = {}
    
    for entry in entries:
        activity_name = entry.get('activity_name', 'Unknown')
        activity_counts[activity_name] = activity_counts.get(activity_name, 0) + 1
    
    # Find most popular activity
    most_popular = max(activity_counts.items(), key=lambda x: x[1])[0] if activity_counts else None
    
    return {
        'total_activities': total_activities,
        'total_duration_minutes': total_duration,
        'average_duration': round(total_duration / total_activities, 2) if total_activities > 0 else 0,
        'activity_distribution': activity_counts,
        'most_popular_activity': most_popular
    }

def calculate_detailed_activity_stats(entries):
    """Calculate detailed activity statistics"""
    if not entries:
        return {}
    
    # Group by day
    daily_activities = {}
    for entry in entries:
        date = entry['timestamp'].date()
        if date not in daily_activities:
            daily_activities[date] = []
        daily_activities[date].append(entry)
    
    # Calculate daily statistics
    daily_stats = {}
    for date, day_entries in daily_activities.items():
        daily_stats[date.isoformat()] = {
            'activities_count': len(day_entries),
            'total_duration': sum(entry.get('duration', 0) for entry in day_entries),
            'activities': [entry.get('activity_name') for entry in day_entries]
        }
    
    # Calculate mood impact
    mood_impact = {}
    for entry in entries:
        if entry.get('mood_before') and entry.get('mood_after'):
            before = entry['mood_before']
            after = entry['mood_after']
            if before not in mood_impact:
                mood_impact[before] = {}
            if after not in mood_impact[before]:
                mood_impact[before][after] = 0
            mood_impact[before][after] += 1
    
    return {
        'daily_stats': daily_stats,
        'mood_impact': mood_impact,
        'total_days': len(daily_stats),
        'average_activities_per_day': len(entries) / len(daily_stats) if daily_stats else 0
    }
