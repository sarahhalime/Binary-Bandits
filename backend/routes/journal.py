from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from services.ai_service import get_ai_response
from datetime import datetime, timedelta
from bson import ObjectId

journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/entry', methods=['POST'])
@jwt_required()
def create_journal_entry():
    """Create a new journal entry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Journal content is required'}), 400
        
        content = data['content']
        title = data.get('title', '')
        mood = data.get('mood', '')
        tags = data.get('tags', [])
        
        # Create journal entry
        journal_entry = {
            'user_id': ObjectId(user_id),
            'title': title,
            'content': content,
            'mood': mood,
            'tags': tags,
            'timestamp': datetime.utcnow(),
            'word_count': len(content.split()),
            'ai_response': None,
            'is_private': data.get('is_private', True)
        }
        
        db = get_db()
        result = db.journal_entries.insert_one(journal_entry)
        
        return jsonify({
            'message': 'Journal entry created successfully',
            'entry': {
                'id': str(result.inserted_id),
                'title': title,
                'content': content,
                'timestamp': journal_entry['timestamp'].isoformat(),
                'word_count': journal_entry['word_count']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entries', methods=['GET'])
@jwt_required()
def get_journal_entries():
    """Get user's journal entries"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        skip = (page - 1) * limit
        
        # Get journal entries
        entries = list(db.journal_entries.find({
            'user_id': ObjectId(user_id)
        }).sort('timestamp', -1).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for entry in entries:
            entry['id'] = str(entry['_id'])
            entry['timestamp'] = entry['timestamp'].isoformat()
            del entry['_id']
        
        # Get total count
        total_count = db.journal_entries.count_documents({'user_id': ObjectId(user_id)})
        
        return jsonify({
            'entries': entries,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entry/<entry_id>', methods=['GET'])
@jwt_required()
def get_journal_entry(entry_id):
    """Get a specific journal entry"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get journal entry
        entry = db.journal_entries.find_one({
            '_id': ObjectId(entry_id),
            'user_id': ObjectId(user_id)
        })
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        entry['id'] = str(entry['_id'])
        entry['timestamp'] = entry['timestamp'].isoformat()
        del entry['_id']
        
        return jsonify({
            'entry': entry
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entry/<entry_id>', methods=['PUT'])
@jwt_required()
def update_journal_entry(entry_id):
    """Update a journal entry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        db = get_db()
        
        # Check if entry exists and belongs to user
        entry = db.journal_entries.find_one({
            '_id': ObjectId(entry_id),
            'user_id': ObjectId(user_id)
        })
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Update fields
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'content' in data:
            update_data['content'] = data['content']
            update_data['word_count'] = len(data['content'].split())
        if 'mood' in data:
            update_data['mood'] = data['mood']
        if 'tags' in data:
            update_data['tags'] = data['tags']
        if 'is_private' in data:
            update_data['is_private'] = data['is_private']
        
        if update_data:
            update_data['updated_at'] = datetime.utcnow()
            db.journal_entries.update_one(
                {'_id': ObjectId(entry_id)},
                {'$set': update_data}
            )
        
        return jsonify({
            'message': 'Journal entry updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/entry/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete_journal_entry(entry_id):
    """Delete a journal entry"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Check if entry exists and belongs to user
        entry = db.journal_entries.find_one({
            '_id': ObjectId(entry_id),
            'user_id': ObjectId(user_id)
        })
        
        if not entry:
            return jsonify({'error': 'Journal entry not found'}), 404
        
        # Delete entry
        db.journal_entries.delete_one({'_id': ObjectId(entry_id)})
        
        return jsonify({
            'message': 'Journal entry deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/ai-response', methods=['POST'])
@jwt_required()
def get_ai_therapy_response():
    """Get AI therapy response for journal entry"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Journal content is required'}), 400
        
        content = data['content']
        mood = data.get('mood', '')
        entry_id = data.get('entry_id')
        
        # Generate AI response
        ai_response = get_ai_response(content, mood, user_id)
        
        # If entry_id is provided, save the AI response
        if entry_id:
            db = get_db()
            db.journal_entries.update_one(
                {'_id': ObjectId(entry_id), 'user_id': ObjectId(user_id)},
                {'$set': {'ai_response': ai_response}}
            )
        
        return jsonify({
            'ai_response': ai_response
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@journal_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_journal_stats():
    """Get journal statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get basic stats
        total_entries = db.journal_entries.count_documents({'user_id': ObjectId(user_id)})
        
        # Get entries from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_entries = db.journal_entries.count_documents({
            'user_id': ObjectId(user_id),
            'timestamp': {'$gte': thirty_days_ago}
        })
        
        # Get total word count
        pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {'$group': {'_id': None, 'total_words': {'$sum': '$word_count'}}}
        ]
        word_count_result = list(db.journal_entries.aggregate(pipeline))
        total_words = word_count_result[0]['total_words'] if word_count_result else 0
        
        # Get mood distribution
        mood_pipeline = [
            {'$match': {'user_id': ObjectId(user_id), 'mood': {'$ne': ''}}},
            {'$group': {'_id': '$mood', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        mood_distribution = list(db.journal_entries.aggregate(mood_pipeline))
        
        # Get most active writing days
        day_pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                'entries': {'$sum': 1}
            }},
            {'$sort': {'entries': -1}},
            {'$limit': 5}
        ]
        active_days = list(db.journal_entries.aggregate(day_pipeline))
        
        return jsonify({
            'total_entries': total_entries,
            'recent_entries': recent_entries,
            'total_words': total_words,
            'mood_distribution': mood_distribution,
            'most_active_days': active_days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
