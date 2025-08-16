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
        
        # Demo mode - return sample friends
        if db is None:
            demo_friends = [
                {
                    'id': 'demo_friend_1',
                    'name': 'Sarah Johnson',
                    'username': 'sarah_j',
                    'profile_pic': None,
                    'current_mood': {
                        'mood': 'happy',
                        'intensity': 7,
                        'timestamp': datetime.utcnow().isoformat()
                    },
                    'last_seen': datetime.utcnow().isoformat()
                },
                {
                    'id': 'demo_friend_2',
                    'name': 'Mike Chen',
                    'username': 'mike_c',
                    'profile_pic': None,
                    'current_mood': {
                        'mood': 'calm',
                        'intensity': 5,
                        'timestamp': datetime.utcnow().isoformat()
                    },
                    'last_seen': datetime.utcnow().isoformat()
                },
                {
                    'id': 'demo_friend_3',
                    'name': 'Emma Davis',
                    'username': 'emma_d',
                    'profile_pic': None,
                    'current_mood': {
                        'mood': 'energetic',
                        'intensity': 8,
                        'timestamp': datetime.utcnow().isoformat()
                    },
                    'last_seen': datetime.utcnow().isoformat()
                }
            ]
            return jsonify({
                'friends': demo_friends,
                'total_friends': len(demo_friends)
            }), 200
        
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
        
        # Demo mode - return sample nudges
        if db is None:
            demo_nudges = [
                {
                    'id': 'demo_nudge_1',
                    'message': 'Hey! How are you feeling today? 💙',
                    'timestamp': datetime.utcnow().isoformat(),
                    'read': False,
                    'sender': {
                        'id': 'demo_friend_1',
                        'name': 'Sarah Johnson',
                        'username': 'sarah_j',
                        'profile_pic': None
                    }
                },
                {
                    'id': 'demo_nudge_2',
                    'message': 'Sending you positive vibes! ✨',
                    'timestamp': datetime.utcnow().isoformat(),
                    'read': True,
                    'sender': {
                        'id': 'demo_friend_2',
                        'name': 'Mike Chen',
                        'username': 'mike_c',
                        'profile_pic': None
                    }
                },
                {
                    'id': 'demo_nudge_3',
                    'message': 'You\'ve got this! 🌟',
                    'timestamp': datetime.utcnow().isoformat(),
                    'read': False,
                    'sender': {
                        'id': 'demo_friend_3',
                        'name': 'Emma Davis',
                        'username': 'emma_d',
                        'profile_pic': None
                    }
                }
            ]
            return jsonify({
                'nudges': demo_nudges,
                'unread_count': len([n for n in demo_nudges if not n.get('read', False)])
            }), 200
        
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

# Vent Wall Endpoints

@social_bp.route('/vent', methods=['POST'])
@jwt_required()
def create_vent_post():
    """Create an anonymous vent post"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Debug logging
        print(f"Received vent post data: {data}")
        print(f"User ID: {user_id}")
        
        # Validate request data exists
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        content = data['content'].strip()
        if len(content) < 5:
            return jsonify({'error': 'Content must be at least 5 characters'}), 400
        
        if len(content) > 500:
            return jsonify({'error': 'Content must be less than 500 characters'}), 400
        
        mood = data.get('mood', 'neutral')
        tags = data.get('tags', [])
        
        # Validate tags
        if len(tags) > 5:
            return jsonify({'error': 'Maximum 5 tags allowed'}), 400
        
        db = get_db()
        
        # Demo mode - return sample response
        if db is None:
            return jsonify({
                'message': 'Vent post created successfully',
                'post': {
                    'id': f'demo_vent_{int(datetime.utcnow().timestamp())}',
                    'content': content,
                    'mood': mood,
                    'tags': tags,
                    'timestamp': datetime.utcnow().isoformat(),
                    'reactions': {},
                    'reaction_count': 0
                }
            }), 201
        
        # Create vent post
        vent_post = {
            'user_id': ObjectId(user_id),
            'content': content,
            'mood': mood,
            'tags': tags,
            'timestamp': datetime.utcnow(),
            'reactions': {},  # Format: {user_id: reaction_type}
            'is_active': True
        }
        
        result = db.vent_posts.insert_one(vent_post)
        
        return jsonify({
            'message': 'Vent post created successfully',
            'post': {
                'id': str(result.inserted_id),
                'content': content,
                'mood': mood,
                'tags': tags,
                'timestamp': vent_post['timestamp'].isoformat(),
                'reactions': {},
                'reaction_count': 0
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent', methods=['GET'])
@jwt_required()
def get_vent_posts():
    """Get vent posts feed (anonymous)"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        limit = request.args.get('limit', 20, type=int)
        mood_filter = request.args.get('mood')
        tag_filter = request.args.get('tag')
        
        # Demo mode - return sample posts
        if db is None:
            demo_posts = [
                {
                    'id': 'demo_vent_1',
                    'content': 'Feeling overwhelmed with work lately. Just need to get this off my chest.',
                    'mood': 'stressed',
                    'tags': ['work', 'stress'],
                    'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    'reactions': {
                        'hug': 3,
                        'heart': 2,
                        'support': 1
                    },
                    'reaction_count': 6,
                    'user_reaction': None,
                    'relative_time': '2 hours ago'
                },
                {
                    'id': 'demo_vent_2',
                    'content': 'Today was actually pretty good! Small wins matter too.',
                    'mood': 'happy',
                    'tags': ['gratitude', 'positivity'],
                    'timestamp': (datetime.utcnow() - timedelta(hours=5)).isoformat(),
                    'reactions': {
                        'heart': 5,
                        'celebrate': 2
                    },
                    'reaction_count': 7,
                    'user_reaction': 'heart',
                    'relative_time': '5 hours ago'
                },
                {
                    'id': 'demo_vent_3',
                    'content': 'Anxiety has been really tough this week. Trying to take it one day at a time.',
                    'mood': 'anxious',
                    'tags': ['anxiety', 'mental-health'],
                    'timestamp': (datetime.utcnow() - timedelta(hours=8)).isoformat(),
                    'reactions': {
                        'hug': 8,
                        'support': 4,
                        'heart': 3
                    },
                    'reaction_count': 15,
                    'user_reaction': 'support',
                    'relative_time': '8 hours ago'
                }
            ]
            
            # Apply filters
            if mood_filter:
                demo_posts = [p for p in demo_posts if p['mood'] == mood_filter]
            if tag_filter:
                demo_posts = [p for p in demo_posts if tag_filter in p['tags']]
            
            return jsonify({
                'posts': demo_posts[:limit],
                'total_posts': len(demo_posts)
            }), 200
        
        # Build query
        query = {'is_active': True}
        if mood_filter:
            query['mood'] = mood_filter
        if tag_filter:
            query['tags'] = tag_filter
        
        # Get vent posts
        posts = list(db.vent_posts.find(query)
                    .sort('timestamp', -1)
                    .limit(limit))
        
        # Process posts (anonymize and add reaction info)
        processed_posts = []
        for post in posts:
            # Count reactions by type
            reactions = {}
            for reaction in post.get('reactions', {}).values():
                reactions[reaction] = reactions.get(reaction, 0) + 1
            
            # Check if current user reacted
            user_reaction = post.get('reactions', {}).get(str(user_id))
            
            # Calculate relative time
            time_diff = datetime.utcnow() - post['timestamp']
            if time_diff.days > 0:
                relative_time = f"{time_diff.days} days ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                relative_time = f"{hours} hours ago"
            elif time_diff.seconds >= 60:
                minutes = time_diff.seconds // 60
                relative_time = f"{minutes} minutes ago"
            else:
                relative_time = "Just now"
            
            processed_posts.append({
                'id': str(post['_id']),
                'content': post['content'],
                'mood': post['mood'],
                'tags': post['tags'],
                'timestamp': post['timestamp'].isoformat(),
                'reactions': reactions,
                'reaction_count': sum(reactions.values()),
                'user_reaction': user_reaction,
                'relative_time': relative_time
            })
        
        return jsonify({
            'posts': processed_posts,
            'total_posts': len(processed_posts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent/<post_id>/react', methods=['POST'])
@jwt_required()
def react_to_vent_post(post_id):
    """Add or update reaction to a vent post"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate reaction type
        reaction_type = data.get('reaction')
        valid_reactions = ['heart', 'hug', 'support', 'celebrate', 'strength']
        
        if not reaction_type or reaction_type not in valid_reactions:
            return jsonify({'error': 'Invalid reaction type'}), 400
        
        db = get_db()
        
        # Demo mode - return success
        if db is None:
            return jsonify({
                'message': 'Reaction added successfully',
                'reaction': reaction_type
            }), 200
        
        # Update or add reaction
        update_query = {
            '$set': {f'reactions.{user_id}': reaction_type}
        }
        
        result = db.vent_posts.update_one(
            {'_id': ObjectId(post_id), 'is_active': True},
            update_query
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Post not found'}), 404
        
        return jsonify({
            'message': 'Reaction added successfully',
            'reaction': reaction_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent/<post_id>/react', methods=['DELETE'])
@jwt_required()
def remove_vent_reaction(post_id):
    """Remove reaction from a vent post"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Demo mode - return success
        if db is None:
            return jsonify({
                'message': 'Reaction removed successfully'
            }), 200
        
        # Remove reaction
        result = db.vent_posts.update_one(
            {'_id': ObjectId(post_id), 'is_active': True},
            {'$unset': {f'reactions.{user_id}': 1}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Post not found'}), 404
        
        return jsonify({
            'message': 'Reaction removed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent/stats', methods=['GET'])
@jwt_required()
def get_vent_stats():
    """Get vent wall statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Demo mode - return sample stats
        if db is None:
            return jsonify({
                'total_posts': 15,
                'posts_today': 3,
                'user_posts': 2,
                'reactions_given': 8,
                'reactions_received': 12,
                'popular_moods': [
                    {'mood': 'anxious', 'count': 5},
                    {'mood': 'happy', 'count': 4},
                    {'mood': 'stressed', 'count': 3}
                ],
                'popular_tags': [
                    {'tag': 'anxiety', 'count': 4},
                    {'tag': 'work', 'count': 3},
                    {'tag': 'gratitude', 'count': 2}
                ]
            }), 200
        
        # Calculate stats
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total posts
        total_posts = db.vent_posts.count_documents({'is_active': True})
        
        # Posts today
        posts_today = db.vent_posts.count_documents({
            'is_active': True,
            'timestamp': {'$gte': today}
        })
        
        # User's posts
        user_posts = db.vent_posts.count_documents({
            'user_id': ObjectId(user_id),
            'is_active': True
        })
        
        # User's reactions given
        reactions_given = len(list(db.vent_posts.find({
            f'reactions.{user_id}': {'$exists': True}
        })))
        
        # Reactions received on user's posts
        user_post_reactions = list(db.vent_posts.find({
            'user_id': ObjectId(user_id),
            'is_active': True
        }, {'reactions': 1}))
        
        reactions_received = sum(len(post.get('reactions', {})) for post in user_post_reactions)
        
        # Popular moods and tags would require aggregation pipelines
        # For now, return basic stats
        
        return jsonify({
            'total_posts': total_posts,
            'posts_today': posts_today,
            'user_posts': user_posts,
            'reactions_given': reactions_given,
            'reactions_received': reactions_received
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Comment Endpoints

@social_bp.route('/vent/<post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    """Create a comment on a vent post"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('content'):
            return jsonify({'error': 'Comment content is required'}), 400
        
        content = data['content'].strip()
        if len(content) < 1:
            return jsonify({'error': 'Comment cannot be empty'}), 400
        
        if len(content) > 300:
            return jsonify({'error': 'Comment must be less than 300 characters'}), 400
        
        db = get_db()
        
        # Demo mode - return sample response
        if db is None:
            return jsonify({
                'message': 'Comment created successfully',
                'comment': {
                    'id': f'demo_comment_{int(datetime.utcnow().timestamp())}',
                    'content': content,
                    'timestamp': datetime.utcnow().isoformat(),
                    'relative_time': 'Just now',
                    'is_anonymous': True
                }
            }), 201
        
        # Verify the post exists
        post = db.vent_posts.find_one({'_id': ObjectId(post_id), 'is_active': True})
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Create comment
        comment = {
            'post_id': ObjectId(post_id),
            'user_id': ObjectId(user_id),
            'content': content,
            'timestamp': datetime.utcnow(),
            'is_active': True
        }
        
        result = db.vent_comments.insert_one(comment)
        
        return jsonify({
            'message': 'Comment created successfully',
            'comment': {
                'id': str(result.inserted_id),
                'content': content,
                'timestamp': comment['timestamp'].isoformat(),
                'relative_time': 'Just now',
                'is_anonymous': True
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent/<post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    """Get comments for a vent post"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get query parameters
        limit = request.args.get('limit', 10, type=int)
        
        # Demo mode - return sample comments
        if db is None:
            demo_comments = [
                {
                    'id': 'demo_comment_1',
                    'content': 'You\'re not alone in feeling this way. Sending you support! 💙',
                    'timestamp': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                    'relative_time': '30 minutes ago',
                    'is_anonymous': True
                },
                {
                    'id': 'demo_comment_2',
                    'content': 'Thank you for sharing. Your courage to speak up inspires others.',
                    'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                    'relative_time': '1 hour ago',
                    'is_anonymous': True
                },
                {
                    'id': 'demo_comment_3',
                    'content': 'This resonates with me so much. We\'re in this together! ✨',
                    'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    'relative_time': '2 hours ago',
                    'is_anonymous': True
                }
            ]
            
            return jsonify({
                'comments': demo_comments[:limit],
                'total_comments': len(demo_comments)
            }), 200
        
        # Get comments for the post
        comments = list(db.vent_comments.find({
            'post_id': ObjectId(post_id),
            'is_active': True
        }).sort('timestamp', 1).limit(limit))
        
        # Process comments (anonymize and add relative time)
        processed_comments = []
        for comment in comments:
            # Calculate relative time
            time_diff = datetime.utcnow() - comment['timestamp']
            if time_diff.days > 0:
                relative_time = f"{time_diff.days} days ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                relative_time = f"{hours} hours ago"
            elif time_diff.seconds >= 60:
                minutes = time_diff.seconds // 60
                relative_time = f"{minutes} minutes ago"
            else:
                relative_time = "Just now"
            
            processed_comments.append({
                'id': str(comment['_id']),
                'content': comment['content'],
                'timestamp': comment['timestamp'].isoformat(),
                'relative_time': relative_time,
                'is_anonymous': True  # Always anonymous for privacy
            })
        
        return jsonify({
            'comments': processed_comments,
            'total_comments': len(processed_comments)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@social_bp.route('/vent/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Delete a comment (only by the comment author)"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Demo mode - return success
        if db is None:
            return jsonify({
                'message': 'Comment deleted successfully'
            }), 200
        
        # Find and delete the comment (only if user is the author)
        result = db.vent_comments.update_one(
            {
                '_id': ObjectId(comment_id),
                'user_id': ObjectId(user_id),
                'is_active': True
            },
            {'$set': {'is_active': False}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Comment not found or unauthorized'}), 404
        
        return jsonify({
            'message': 'Comment deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
