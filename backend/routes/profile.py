from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from models.user import User
from datetime import datetime, timedelta
from bson import ObjectId

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update profile fields
        update_data = {}
        
        if 'name' in data:
            update_data['name'] = data['name']
        
        if 'profile_pic' in data:
            update_data['profile_pic'] = data['profile_pic']
        
        if 'favorite_genres' in data:
            update_data['favorite_genres'] = data['favorite_genres']
        
        if 'biometrics' in data:
            update_data['biometrics'] = data['biometrics']
        
        # Update user profile
        success = user.update_profile(**update_data)
        
        if success:
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/biometrics', methods=['POST'])
@jwt_required()
def log_biometrics():
    """Log biometric data"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not any(key in data for key in ['heart_rate', 'sleep_hours', 'exercise_minutes']):
            return jsonify({'error': 'At least one biometric measurement is required'}), 400
        
        # Create biometric entry
        biometric_entry = {
            'user_id': ObjectId(user_id),
            'heart_rate': data.get('heart_rate'),
            'sleep_hours': data.get('sleep_hours'),
            'exercise_minutes': data.get('exercise_minutes'),
            'timestamp': datetime.utcnow(),
            'notes': data.get('notes', '')
        }
        
        db = get_db()
        result = db.biometrics.insert_one(biometric_entry)
        
        # Update user's current biometrics
        user = User.find_by_id(user_id)
        if user:
            user.update_profile(biometrics={
                'heart_rate': data.get('heart_rate'),
                'sleep_hours': data.get('sleep_hours'),
                'exercise_minutes': data.get('exercise_minutes')
            })
        
        return jsonify({
            'message': 'Biometrics logged successfully',
            'biometric': {
                'id': str(result.inserted_id),
                'heart_rate': data.get('heart_rate'),
                'sleep_hours': data.get('sleep_hours'),
                'exercise_minutes': data.get('exercise_minutes'),
                'timestamp': biometric_entry['timestamp'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/biometrics', methods=['GET'])
@jwt_required()
def get_biometrics_history():
    """Get user's biometric history"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get biometric entries
        entries = list(db.biometrics.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }).sort('timestamp', -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for entry in entries:
            entry['id'] = str(entry['_id'])
            entry['timestamp'] = entry['timestamp'].isoformat()
            del entry['_id']
        
        # Calculate biometric statistics
        stats = calculate_biometric_stats(entries)
        
        return jsonify({
            'entries': entries,
            'statistics': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get comprehensive user statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get user
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get mood statistics
        mood_entries = list(db.mood_entries.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }))
        
        mood_stats = calculate_mood_stats(mood_entries)
        
        # Get journal statistics
        journal_entries = list(db.journal_entries.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }))
        
        journal_stats = calculate_journal_stats(journal_entries)
        
        # Get activity statistics
        activity_entries = list(db.activities.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }))
        
        activity_stats = calculate_activity_stats(activity_entries)
        
        # Get biometric statistics
        biometric_entries = list(db.biometrics.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }))
        
        biometric_stats = calculate_biometric_stats(biometric_entries)
        
        # Get music statistics
        music_entries = list(db.playlists.find({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': start_date}
        }))
        
        music_stats = calculate_music_stats(music_entries)
        
        # Get social statistics
        friend_connections = list(db.friend_connections.find({
            '$or': [
                {'user_id': ObjectId(user_id)},
                {'friend_id': ObjectId(user_id)}
            ]
        }))
        
        social_stats = calculate_social_stats(friend_connections, user_id)
        
        return jsonify({
            'user': user.to_dict(),
            'period_days': days,
            'mood_stats': mood_stats,
            'journal_stats': journal_stats,
            'activity_stats': activity_stats,
            'biometric_stats': biometric_stats,
            'music_stats': music_stats,
            'social_stats': social_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_user_insights():
    """Get personalized insights based on user data"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get recent data
        recent_moods = list(db.mood_entries.find({
            'user_id': ObjectId(user_id)
        }).sort('timestamp', -1).limit(10))
        
        recent_activities = list(db.activities.find({
            'user_id': ObjectId(user_id)
        }).sort('timestamp', -1).limit(10))
        
        recent_biometrics = list(db.biometrics.find({
            'user_id': ObjectId(user_id)
        }).sort('timestamp', -1).limit(10))
        
        # Generate insights
        insights = generate_user_insights(recent_moods, recent_activities, recent_biometrics)
        
        return jsonify({
            'insights': insights
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_biometric_stats(entries):
    """Calculate biometric statistics"""
    if not entries:
        return {}
    
    heart_rates = [e.get('heart_rate') for e in entries if e.get('heart_rate')]
    sleep_hours = [e.get('sleep_hours') for e in entries if e.get('sleep_hours')]
    exercise_minutes = [e.get('exercise_minutes') for e in entries if e.get('exercise_minutes')]
    
    stats = {
        'total_entries': len(entries)
    }
    
    if heart_rates:
        stats['heart_rate'] = {
            'average': round(sum(heart_rates) / len(heart_rates), 1),
            'min': min(heart_rates),
            'max': max(heart_rates),
            'count': len(heart_rates)
        }
    
    if sleep_hours:
        stats['sleep_hours'] = {
            'average': round(sum(sleep_hours) / len(sleep_hours), 1),
            'min': min(sleep_hours),
            'max': max(sleep_hours),
            'count': len(sleep_hours)
        }
    
    if exercise_minutes:
        stats['exercise_minutes'] = {
            'average': round(sum(exercise_minutes) / len(exercise_minutes), 1),
            'min': min(exercise_minutes),
            'max': max(exercise_minutes),
            'count': len(exercise_minutes)
        }
    
    return stats

def calculate_mood_stats(entries):
    """Calculate mood statistics"""
    if not entries:
        return {}
    
    mood_counts = {}
    total_intensity = 0
    
    for entry in entries:
        mood = entry.get('mood', 'unknown')
        intensity = entry.get('intensity', 5)
        
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
        total_intensity += intensity
    
    return {
        'total_entries': len(entries),
        'average_intensity': round(total_intensity / len(entries), 2) if entries else 0,
        'mood_distribution': mood_counts,
        'most_common_mood': max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else None
    }

def calculate_journal_stats(entries):
    """Calculate journal statistics"""
    if not entries:
        return {}
    
    total_words = sum(entry.get('word_count', 0) for entry in entries)
    
    return {
        'total_entries': len(entries),
        'total_words': total_words,
        'average_words_per_entry': round(total_words / len(entries), 1) if entries else 0
    }

def calculate_activity_stats(entries):
    """Calculate activity statistics"""
    if not entries:
        return {}
    
    total_duration = sum(entry.get('duration', 0) for entry in entries)
    activity_counts = {}
    
    for entry in entries:
        activity = entry.get('activity_name', 'Unknown')
        activity_counts[activity] = activity_counts.get(activity, 0) + 1
    
    return {
        'total_activities': len(entries),
        'total_duration_minutes': total_duration,
        'average_duration': round(total_duration / len(entries), 2) if entries else 0,
        'activity_distribution': activity_counts
    }

def calculate_music_stats(entries):
    """Calculate music statistics"""
    if not entries:
        return {}
    
    mood_distribution = {}
    total_tracks = 0
    
    for entry in entries:
        mood = entry.get('mood', 'unknown')
        tracks_count = entry.get('tracks_count', 0)
        
        mood_distribution[mood] = mood_distribution.get(mood, 0) + 1
        total_tracks += tracks_count
    
    return {
        'total_playlists': len(entries),
        'total_tracks': total_tracks,
        'mood_distribution': mood_distribution
    }

def calculate_social_stats(connections, user_id):
    """Calculate social statistics"""
    if not connections:
        return {}
    
    return {
        'total_friends': len(connections),
        'connections_this_period': len([c for c in connections if c.get('created_at', datetime.utcnow()) >= datetime.utcnow() - timedelta(days=30)])
    }

def generate_user_insights(moods, activities, biometrics):
    """Generate personalized insights"""
    insights = []
    
    # Mood insights
    if moods:
        recent_mood = moods[0].get('mood', 'unknown')
        if recent_mood in ['sad', 'depressed', 'down']:
            insights.append({
                'type': 'mood',
                'message': 'I notice you\'ve been feeling down lately. Remember, it\'s okay to not be okay.',
                'suggestion': 'Try reaching out to a friend or engaging in a mood-lifting activity.'
            })
        elif recent_mood in ['anxious', 'worried', 'stressed']:
            insights.append({
                'type': 'mood',
                'message': 'Stress and anxiety are common, but there are ways to manage them.',
                'suggestion': 'Consider trying some breathing exercises or meditation.'
            })
    
    # Activity insights
    if activities:
        recent_activity = activities[0].get('activity_name', '')
        if 'breathing' in recent_activity.lower():
            insights.append({
                'type': 'activity',
                'message': 'Great job practicing breathing exercises!',
                'suggestion': 'Try to make this a daily habit for better stress management.'
            })
    
    # Biometric insights
    if biometrics:
        recent_bio = biometrics[0]
        sleep_hours = recent_bio.get('sleep_hours')
        if sleep_hours and sleep_hours < 7:
            insights.append({
                'type': 'biometric',
                'message': 'Getting enough sleep is crucial for mental health.',
                'suggestion': 'Try to aim for 7-9 hours of sleep per night.'
            })
    
    # General insights
    if len(moods) >= 5:
        insights.append({
            'type': 'general',
            'message': 'You\'ve been consistently tracking your mood. That\'s a great habit!',
            'suggestion': 'Keep up the good work with your mental health journey.'
        })
    
    return insights
