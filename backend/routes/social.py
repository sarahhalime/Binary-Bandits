from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from models.user import User
from datetime import datetime, timedelta
from bson import ObjectId

social_bp = Blueprint('social', __name__)

@social_bp.route('/friend-request', methods=['POST'])
@jwt_required()
def send_friend_request():
    """Send a friend request using friend code"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('friend_code'):
            return jsonify({'error': 'Friend code is required'}), 400
        
        friend_code = data['friend_code'].upper()
        
        # Check if user is trying to add themselves
        current_user = User.find_by_id(user_id)
        if current_user.friend_code == friend_code:
            return jsonify({'error': 'You cannot add yourself as a friend'}), 400
        
        # Find friend by friend code
        friend = User.find_by_friend_code(friend_code)
        if not friend:
            return jsonify({'error': 'Friend code not found'}), 404
        
        db = get_db()
        
        # Check if connection already exists
        existing_connection = db.friend_connections.find_one({
            '$or': [
                {'user_id': ObjectId(user_id), 'friend_id': friend._id},
                {'user_id': friend._id, 'friend_id': ObjectId(user_id)}
            ]
        })
        
        if existing_connection:
            return jsonify({'error': 'Friend connection already exists'}), 400
        
        # Create friend connection
        connection = {
            'user_id': ObjectId(user_id),
            'friend_id': friend._id,
            'status': 'accepted',  # Auto-accept for simplicity
            'created_at': datetime.utcnow(),
            'last_interaction': datetime.utcnow()
        }
        
        result = db.friend_connections.insert_one(connection)
        
        return jsonify({
            'message': f'Successfully connected with {friend.name}',
            'friend': {
                'id': str(friend._id),
                'name': friend.name,
                'username': friend.username,
                'profile_pic': friend.profile_pic
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends_list():
    """Get user's friends list with their current moods"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get all friend connections
        connections = list(db.friend_connections.find({
            '$or': [
                {'user_id': ObjectId(user_id)},
                {'friend_id': ObjectId(user_id)}
            ]
        }))
        
        friends = []
        for connection in connections:
            # Determine which user is the friend
            if connection['user_id'] == ObjectId(user_id):
                friend_id = connection['friend_id']
            else:
                friend_id = connection['user_id']
            
            # Get friend details
            friend = User.find_by_id(str(friend_id))
            if friend:
                # Get friend's current mood
                current_mood = db.mood_entries.find_one(
                    {'user_id': friend_id},
                    sort=[('timestamp', -1)]
                )
                
                friend_data = {
                    'id': str(friend._id),
                    'name': friend.name,
                    'username': friend.username,
                    'profile_pic': friend.profile_pic,
                    'current_mood': current_mood.get('mood', 'unknown') if current_mood else 'unknown',
                    'mood_intensity': current_mood.get('intensity', 5) if current_mood else 5,
                    'last_mood_update': current_mood.get('timestamp', '').isoformat() if current_mood else None,
                    'connection_date': connection['created_at'].isoformat()
                }
                friends.append(friend_data)
        
        return jsonify({
            'friends': friends,
            'total_friends': len(friends)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/nudge', methods=['POST'])
@jwt_required()
def send_supportive_nudge():
    """Send a supportive nudge to a friend"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('friend_id'):
            return jsonify({'error': 'Friend ID is required'}), 400
        
        friend_id = data['friend_id']
        message = data.get('message', 'Thinking of you! 💙')
        
        # Verify friend connection exists
        db = get_db()
        connection = db.friend_connections.find_one({
            '$or': [
                {'user_id': ObjectId(user_id), 'friend_id': ObjectId(friend_id)},
                {'user_id': ObjectId(friend_id), 'friend_id': ObjectId(user_id)}
            ]
        })
        
        if not connection:
            return jsonify({'error': 'Friend connection not found'}), 404
        
        # Create nudge
        nudge = {
            'from_user_id': ObjectId(user_id),
            'to_user_id': ObjectId(friend_id),
            'message': message,
            'timestamp': datetime.utcnow(),
            'read': False
        }
        
        result = db.nudges.insert_one(nudge)
        
        # Update last interaction
        db.friend_connections.update_one(
            {'_id': connection['_id']},
            {'$set': {'last_interaction': datetime.utcnow()}}
        )
        
        return jsonify({
            'message': 'Supportive nudge sent successfully',
            'nudge': {
                'id': str(result.inserted_id),
                'message': message,
                'timestamp': nudge['timestamp'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/nudges', methods=['GET'])
@jwt_required()
def get_received_nudges():
    """Get nudges received by the user"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        limit = request.args.get('limit', 20, type=int)
        
        # Get received nudges
        nudges = list(db.nudges.find({
            'to_user_id': ObjectId(user_id)
        }).sort('timestamp', -1).limit(limit))
        
        # Get sender details for each nudge
        for nudge in nudges:
            sender = User.find_by_id(str(nudge['from_user_id']))
            nudge['sender'] = {
                'id': str(sender._id),
                'name': sender.name,
                'username': sender.username,
                'profile_pic': sender.profile_pic
            } if sender else None
            nudge['id'] = str(nudge['_id'])
            nudge['timestamp'] = nudge['timestamp'].isoformat()
            del nudge['_id']
        
        return jsonify({
            'nudges': nudges,
            'unread_count': len([n for n in nudges if not n.get('read', False)])
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/nudge/<nudge_id>/read', methods=['PUT'])
@jwt_required()
def mark_nudge_as_read(nudge_id):
    """Mark a nudge as read"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Update nudge as read
        result = db.nudges.update_one(
            {
                '_id': ObjectId(nudge_id),
                'to_user_id': ObjectId(user_id)
            },
            {'$set': {'read': True}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Nudge not found'}), 404
        
        return jsonify({
            'message': 'Nudge marked as read'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/mood-share', methods=['POST'])
@jwt_required()
def share_mood_with_friends():
    """Share current mood with friends"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('mood'):
            return jsonify({'error': 'Mood is required'}), 400
        
        mood = data['mood']
        message = data.get('message', '')
        share_with_all = data.get('share_with_all', False)
        friend_ids = data.get('friend_ids', [])
        
        db = get_db()
        
        # Get current user
        current_user = User.find_by_id(user_id)
        
        # Determine which friends to share with
        if share_with_all:
            # Get all friends
            connections = list(db.friend_connections.find({
                '$or': [
                    {'user_id': ObjectId(user_id)},
                    {'friend_id': ObjectId(user_id)}
                ]
            }))
            
            for connection in connections:
                if connection['user_id'] == ObjectId(user_id):
                    friend_ids.append(str(connection['friend_id']))
                else:
                    friend_ids.append(str(connection['user_id']))
        elif not friend_ids:
            return jsonify({'error': 'Must specify friends to share with'}), 400
        
        # Create mood share entries
        shared_moods = []
        for friend_id in friend_ids:
            # Verify friend connection exists
            connection = db.friend_connections.find_one({
                '$or': [
                    {'user_id': ObjectId(user_id), 'friend_id': ObjectId(friend_id)},
                    {'user_id': ObjectId(friend_id), 'friend_id': ObjectId(user_id)}
                ]
            })
            
            if connection:
                shared_mood = {
                    'from_user_id': ObjectId(user_id),
                    'to_user_id': ObjectId(friend_id),
                    'mood': mood,
                    'message': message,
                    'timestamp': datetime.utcnow(),
                    'read': False
                }
                
                result = db.shared_moods.insert_one(shared_mood)
                shared_moods.append({
                    'id': str(result.inserted_id),
                    'friend_id': friend_id,
                    'mood': mood,
                    'timestamp': shared_mood['timestamp'].isoformat()
                })
        
        return jsonify({
            'message': f'Mood shared with {len(shared_moods)} friends',
            'shared_moods': shared_moods
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/shared-moods', methods=['GET'])
@jwt_required()
def get_shared_moods():
    """Get moods shared by friends"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        limit = request.args.get('limit', 20, type=int)
        
        # Get shared moods
        shared_moods = list(db.shared_moods.find({
            'to_user_id': ObjectId(user_id)
        }).sort('timestamp', -1).limit(limit))
        
        # Get sender details for each shared mood
        for shared_mood in shared_moods:
            sender = User.find_by_id(str(shared_mood['from_user_id']))
            shared_mood['sender'] = {
                'id': str(sender._id),
                'name': sender.name,
                'username': sender.username,
                'profile_pic': sender.profile_pic
            } if sender else None
            shared_mood['id'] = str(shared_mood['_id'])
            shared_mood['timestamp'] = shared_mood['timestamp'].isoformat()
            del shared_mood['_id']
        
        return jsonify({
            'shared_moods': shared_moods,
            'unread_count': len([m for m in shared_moods if not m.get('read', False)])
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/friend/<friend_id>/remove', methods=['DELETE'])
@jwt_required()
def remove_friend(friend_id):
    """Remove a friend connection"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Find and remove friend connection
        result = db.friend_connections.delete_one({
            '$or': [
                {'user_id': ObjectId(user_id), 'friend_id': ObjectId(friend_id)},
                {'user_id': ObjectId(friend_id), 'friend_id': ObjectId(user_id)}
            ]
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Friend connection not found'}), 404
        
        return jsonify({
            'message': 'Friend removed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
