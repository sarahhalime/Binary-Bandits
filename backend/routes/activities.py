from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from datetime import datetime, timedelta
from bson import ObjectId
import json
import os
import random

activities_bp = Blueprint('activities', __name__)

# Load activities data
def load_activities():
    """Load activities from seed file"""
    try:
        seed_path = os.path.join(os.path.dirname(__file__), '..', 'seed', 'activities.json')
        with open(seed_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading activities: {e}")
        return []

# Global activities cache
ACTIVITIES_DATA = load_activities()

@activities_bp.route('/recommendations/activities', methods=['POST'])
def get_activity_recommendations():
    """Get activity recommendations based on mood and preferences"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('mood'):
            return jsonify({'error': 'Mood is required'}), 400
        
        mood = data['mood']
        energy = data.get('energy', 'med')
        time_min = data.get('time_min', 10)
        context = data.get('context', 'any')
        user_id = None  # For now, no auth required
        
        # Score activities
        scored_activities = []
        for activity in ACTIVITIES_DATA:
            score = _calculate_activity_score(activity, mood, energy, time_min, context, user_id)
            scored_activities.append({
                **activity,
                'score': score
            })
        
        # Sort by score and return top 5
        scored_activities.sort(key=lambda x: x['score'], reverse=True)
        top_activities = scored_activities[:5]
        
        return jsonify({
            'activities': top_activities,
            'filters': {
                'mood': mood,
                'energy': energy,
                'time_min': time_min,
                'context': context
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/complete', methods=['POST'])
def complete_activity():
    """Mark an activity as completed"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('activity_id'):
            return jsonify({'error': 'Activity ID is required'}), 400
        
        activity_id = data['activity_id']
        user_id = None  # For now, no auth required
        
        # Log activity completion
        activity_log = {
            'user_id': user_id,
            'activity_id': activity_id,
            'ts': datetime.utcnow(),
            'completed': True
        }
        
        db = get_db()
        if db is not None:
            result = db.activities_log.insert_one(activity_log)
            activity_log['id'] = str(result.inserted_id)
        else:
            # Demo mode
            activity_log['id'] = f"demo_log_{datetime.utcnow().timestamp()}"
        
        return jsonify({
            'message': 'Activity completed successfully',
            'log': activity_log
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _calculate_activity_score(activity, mood, energy, time_min, context, user_id):
    """Calculate activity score based on various factors"""
    score = 0.0
    
    # Mood fit (45% weight)
    mood_fit = 0.0
    if mood in activity['mood_targets']:
        mood_fit = 1.0
    elif _is_mood_related(mood, activity['mood_targets']):
        mood_fit = 0.5
    score += 0.45 * mood_fit
    
    # Duration fit (25% weight)
    duration_diff = abs(activity['duration_min'] - time_min)
    if duration_diff <= 2:
        duration_fit = 1.0
    else:
        duration_fit = max(0.1, 1.0 - (duration_diff - 2) * 0.1)
    score += 0.25 * duration_fit
    
    # Energy fit (15% weight)
    energy_fit = 1.0 if activity['energy'] == energy else 0.5
    score += 0.15 * energy_fit
    
    # Context fit (10% weight)
    context_fit = 1.0 if context in activity['context'] or 'any' in activity['context'] else 0.3
    score += 0.10 * context_fit
    
    # Novelty (5% weight) - boost if not done recently
    novelty = _calculate_novelty(activity['id'], user_id)
    score += 0.05 * novelty
    
    return score

def _is_mood_related(mood, targets):
    """Check if mood is related to target moods"""
    mood_groups = {
        'anxious': ['stressed', 'overwhelmed'],
        'stressed': ['anxious', 'overwhelmed'],
        'overwhelmed': ['anxious', 'stressed'],
        'low': ['sad'],
        'sad': ['low'],
        'restless': ['anxious']
    }
    
    for target in targets:
        if mood in mood_groups.get(target, []) or target in mood_groups.get(mood, []):
            return True
    return False

def _calculate_novelty(activity_id, user_id):
    """Calculate novelty score based on recent activity completion"""
    if not user_id:
        return 1.0  # No user tracking in demo mode
    
    db = get_db()
    if db is None:
        return 1.0  # Demo mode
    
    # Check if activity was completed in last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_completion = db.activities_log.find_one({
        'user_id': user_id,
        'activity_id': activity_id,
        'ts': {'$gte': week_ago}
    })
    
    if recent_completion:
        return 0.3  # Recently done, lower novelty
    else:
        return 1.0  # Not done recently, higher novelty

@activities_bp.route('/history', methods=['GET'])
def get_activity_history():
    """Get user's activity completion history"""
    try:
        user_id = None  # For now, no auth required
        limit = request.args.get('limit', 20, type=int)
        
        db = get_db()
        if db is not None:
            logs = list(db.activities_log.find({
                'user_id': user_id
            }).sort('ts', -1).limit(limit))
            
            # Convert ObjectId to string
            for log in logs:
                log['id'] = str(log['_id'])
                log['ts'] = log['ts'].isoformat()
                del log['_id']
        else:
            # Demo mode
            logs = [
                {
                    'id': 'demo_log_1',
                    'activity_id': 'box_breath_5',
                    'ts': datetime.utcnow().isoformat(),
                    'completed': True
                }
            ]
        
        return jsonify({
            'logs': logs,
            'total_completed': len(logs)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
