from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if '@' not in data['email']:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Create user
        user, error = User.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            name=data.get('name'),
            profile_pic=data.get('profile_pic')
        )
        
        if error:
            return jsonify({'error': error}), 400
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user._id))
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'token': access_token,  # For frontend compatibility
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # In demo mode, accept any password
        from models.database import get_db
        db = get_db()
        if db is None:
            # Demo mode - accept any password
            pass
        else:
            # Verify password only in production mode
            if not user.verify_password(data['password']):
                return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        user.update_last_login()
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user._id))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'token': access_token,  # For frontend compatibility
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update profile
        success = user.update_profile(
            name=data.get('name'),
            profile_pic=data.get('profile_pic'),
            favorite_genres=data.get('favorite_genres'),
            biometrics=data.get('biometrics')
        )
        
        if success:
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/friend-code', methods=['GET'])
@jwt_required()
def get_friend_code():
    """Get user's friend code"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Debug logging
        print(f"User found: {user.username}")
        print(f"User friend_code: {getattr(user, 'friend_code', 'NOT_FOUND')}")
        print(f"User dict: {user.__dict__}")
        
        # If friend_code is missing, generate one and save it
        if not hasattr(user, 'friend_code') or not user.friend_code:
            import secrets
            import string
            alphabet = string.ascii_uppercase + string.digits
            user.friend_code = ''.join(secrets.choice(alphabet) for _ in range(8))
            
            # Save the friend code to database
            from models.database import get_db
            db = get_db()
            if db is not None:
                from bson import ObjectId
                db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"friend_code": user.friend_code}}
                )
                print(f"Generated and saved new friend_code: {user.friend_code}")
        
        return jsonify({
            'friend_code': user.friend_code
        }), 200
        
    except Exception as e:
        print(f"Error in get_friend_code: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    """Complete user onboarding with extended profile data"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Transform frontend data structure to match backend
        profile_data = {
            'age': data.get('age'),
            'bio': data.get('bio', ''),
            'primary_concerns': data.get('primaryConcerns', []),
            'therapy_experience': data.get('therapyExperience', ''),
            'preferred_communication_style': data.get('preferredCommunicationStyle', ''),
            'coping_strategies': data.get('copingStrategies', []),
            'support_system': data.get('supportSystem', ''),
            'occupation': data.get('occupation', ''),
            'stress_level': data.get('stressLevel', 5),
            'sleep_schedule': {
                'bedtime': data.get('sleepSchedule', {}).get('bedtime', ''),
                'wake_time': data.get('sleepSchedule', {}).get('wakeTime', ''),
                'sleep_quality': data.get('sleepSchedule', {}).get('sleepQuality', 5)
            },
            'music_genres': data.get('musicGenres', []),
            'activity_preferences': data.get('activityPreferences', []),
            'content_length': data.get('contentLength', ''),
            'motivational_style': data.get('motivationalStyle', ''),
            'goals': data.get('goals', []),
            'notification_preferences': {
                'daily_check_in': data.get('notificationPreferences', {}).get('dailyCheckIn', True),
                'mood_reminders': data.get('notificationPreferences', {}).get('moodReminders', True),
                'activity_suggestions': data.get('notificationPreferences', {}).get('activitySuggestions', True)
            },
            'preferred_notification_times': data.get('preferredNotificationTimes', []),
            'onboarding_completed': True
        }
        
        # Update profile photo if provided with validation
        if data.get('profilePhoto'):
            profile_photo = data.get('profilePhoto')
            
            # Validate base64 image data
            if not profile_photo.startswith('data:image/'):
                return jsonify({'error': 'Invalid image format'}), 400
            
            # Check if it's an allowed image type
            allowed_formats = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp']
            if not any(profile_photo.startswith(fmt) for fmt in allowed_formats):
                return jsonify({'error': 'Only JPG, PNG, and WebP images are allowed'}), 400
            
            # Estimate base64 size (base64 is ~1.37x larger than original)
            # Remove data URL prefix to get just the base64 data
            base64_data = profile_photo.split(',')[1] if ',' in profile_photo else profile_photo
            estimated_size = len(base64_data) * 0.75  # Convert base64 length to estimated bytes
            max_size = 2 * 1024 * 1024  # 2MB
            
            if estimated_size > max_size:
                return jsonify({'error': 'Image size must be less than 2MB'}), 400
            
            user.profile_pic = profile_photo
        
        # Update name if provided
        if data.get('name'):
            user.name = data.get('name')
        
        # Update profile data
        success = user.update_profile_data(profile_data)
        
        if success:
            try:
                user_dict = user.to_dict()
                return jsonify({
                    'message': 'Onboarding completed successfully',
                    'user': user_dict
                }), 200
            except Exception as dict_error:
                print(f"Error converting user to dict: {dict_error}")
                return jsonify({'error': f'Error serializing user data: {str(dict_error)}'}), 500
        else:
            return jsonify({'error': 'Failed to update profile data'}), 500
        
    except Exception as e:
        print(f"Onboarding error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/photo', methods=['POST'])
@jwt_required()
def update_profile_photo():
    """Update user profile photo immediately"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        profile_photo = data.get('profilePhoto')
        
        if not profile_photo:
            return jsonify({'error': 'No photo provided'}), 400
        
        # Validate base64 image data
        if not profile_photo.startswith('data:image/'):
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Check if it's an allowed image type
        allowed_formats = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp']
        if not any(profile_photo.startswith(fmt) for fmt in allowed_formats):
            return jsonify({'error': 'Only JPG, PNG, and WebP images are allowed'}), 400
        
        # Estimate base64 size (base64 is ~1.37x larger than original)
        base64_data = profile_photo.split(',')[1] if ',' in profile_photo else profile_photo
        estimated_size = len(base64_data) * 0.75  # Convert base64 length to estimated bytes
        max_size = 2 * 1024 * 1024  # 2MB
        
        if estimated_size > max_size:
            return jsonify({'error': 'Image size must be less than 2MB'}), 400
        
        # Update user profile photo
        user.profile_pic = profile_photo
        
        # Save to database
        from models.database import get_db
        db = get_db()
        users_collection = db.users
        
        result = users_collection.update_one(
            {'_id': user._id},
            {'$set': {'profile_pic': profile_photo}}
        )
        
        if result.modified_count > 0:
            return jsonify({
                'message': 'Profile photo updated successfully',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Failed to update profile photo'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
