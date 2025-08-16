from datetime import datetime
import bcrypt
import secrets
import string
from models.database import get_db

# Demo account credentials for everyone to use
DEMO_ACCOUNT = {
    'username': 'demo_user',
    'email': 'demo@mindfulharmony.com',
    'password': 'demo123',
    'name': 'Demo User',
    'friend_code': 'DEMO1234'
}

class User:
    def __init__(self, username, email, password, name=None, profile_pic=None):
        self.username = username
        self.email = email
        self.password_hash = self._hash_password(password)
        self.name = name or username
        self.profile_pic = profile_pic
        self.friend_code = self._generate_friend_code()
        self.favorite_genres = []
        self.biometrics = {
            'heart_rate': None,
            'sleep_hours': None,
            'exercise_minutes': None
        }
        # Extended profile data from onboarding
        self.profile_data = {
            'age': None,
            'bio': '',
            'primary_concerns': [],
            'therapy_experience': '',
            'preferred_communication_style': '',
            'coping_strategies': [],
            'support_system': '',
            'occupation': '',
            'stress_level': 5,
            'sleep_schedule': {
                'bedtime': '',
                'wake_time': '',
                'sleep_quality': 5
            },
            'music_genres': [],
            'activity_preferences': [],
            'content_length': '',
            'motivational_style': '',
            'goals': [],
            'notification_preferences': {
                'daily_check_in': True,
                'mood_reminders': True,
                'activity_suggestions': True
            },
            'preferred_notification_times': [],
            'onboarding_completed': False
        }
        self.created_at = datetime.utcnow()
        self.last_login = datetime.utcnow()
        self.is_active = True

    def _hash_password(self, password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    def _generate_friend_code(self):
        """Generate unique 8-character friend code"""
        alphabet = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(8))

    def verify_password(self, password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash)

    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        # Ensure profile_data exists (for backwards compatibility with existing users)
        if not hasattr(self, 'profile_data'):
            self.profile_data = {
                'age': None,
                'bio': '',
                'primary_concerns': [],
                'therapy_experience': '',
                'preferred_communication_style': '',
                'coping_strategies': [],
                'support_system': '',
                'occupation': '',
                'stress_level': 5,
                'sleep_schedule': {
                    'bedtime': '',
                    'wake_time': '',
                    'sleep_quality': 5
                },
                'music_genres': [],
                'activity_preferences': [],
                'content_length': '',
                'motivational_style': '',
                'goals': [],
                'notification_preferences': {
                    'daily_check_in': True,
                    'mood_reminders': True,
                    'activity_suggestions': True
                },
                'preferred_notification_times': [],
                'onboarding_completed': False
            }
        
        return {
            'id': str(self._id) if hasattr(self, '_id') else None,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'profile_pic': self.profile_pic,
            'friend_code': self.friend_code,
            'favorite_genres': self.favorite_genres,
            'biometrics': self.biometrics,
            'profile_data': self.profile_data,
            'created_at': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            'last_login': self.last_login.isoformat() if hasattr(self, 'last_login') else None,
            'is_active': getattr(self, 'is_active', True)
        }

    @staticmethod
    def create_user(username, email, password, name=None, profile_pic=None):
        """Create a new user in the database"""
        db = get_db()
        
        # Demo mode - create user with provided details
        if db is None:
            user = User(
                username=username,
                email=email,
                password=password,
                name=name or username
            )
            user._id = "demo_user_" + str(hash(email))  # Generate unique ID based on email
            user.friend_code = "DEMO" + str(hash(email))[-4:].upper()  # Generate unique friend code
            return user, None
        
        # Check if user already exists
        if db.users.find_one({"$or": [{"email": email}, {"username": username}]}):
            return None, "User already exists"
        
        user = User(username, email, password, name, profile_pic)
        result = db.users.insert_one(user.__dict__)
        user._id = result.inserted_id
        
        return user, None

    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_db()
        
        # Demo mode - accept any email and create a user with that email
        if db is None:
            # Create a user with the provided email and any password
            user = User(
                username=email.split('@')[0],  # Use email prefix as username
                email=email,
                password="demo123",  # Any password works in demo mode
                name=email.split('@')[0].title()  # Capitalize username as name
            )
            user._id = "demo_user_" + str(hash(email))  # Generate unique ID based on email
            user.friend_code = "DEMO" + str(hash(email))[-4:].upper()  # Generate unique friend code
            return user
            
        user_data = db.users.find_one({"email": email})
        if user_data:
            user = User.__new__(User)
            user.__dict__.update(user_data)
            return user
        return None

    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        db = get_db()
        user_data = db.users.find_one({"username": username})
        if user_data:
            user = User.__new__(User)
            user.__dict__.update(user_data)
            return user
        return None

    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        db = get_db()
        
        # Demo mode - create a generic demo user
        if db is None:
            if user_id.startswith("demo_user_"):
                # Extract email hash from user_id and create a generic user
                user = User(
                    username="demo_user",
                    email="demo@mindfulharmony.com",
                    password="demo123",
                    name="Demo User"
                )
                user._id = user_id
                user.friend_code = "DEMO1234"
                return user
            return None
            
        from bson import ObjectId
        user_data = db.users.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user = User.__new__(User)
            user.__dict__.update(user_data)
            return user
        return None

    @staticmethod
    def find_by_friend_code(friend_code):
        """Find user by friend code"""
        db = get_db()
        user_data = db.users.find_one({"friend_code": friend_code})
        if user_data:
            user = User.__new__(User)
            user.__dict__.update(user_data)
            return user
        return None

    def update_last_login(self):
        """Update last login timestamp"""
        db = get_db()
        self.last_login = datetime.utcnow()
        
        # Demo mode - just update the instance
        if db is None:
            return
            
        db.users.update_one(
            {"_id": self._id},
            {"$set": {"last_login": self.last_login}}
        )

    def update_profile(self, name=None, profile_pic=None, favorite_genres=None, biometrics=None):
        """Update user profile"""
        db = get_db()
        update_data = {}
        
        if name is not None:
            self.name = name
            update_data["name"] = name
        
        if profile_pic is not None:
            self.profile_pic = profile_pic
            update_data["profile_pic"] = profile_pic
        
        if favorite_genres is not None:
            self.favorite_genres = favorite_genres
            update_data["favorite_genres"] = favorite_genres
        
        if biometrics is not None:
            self.biometrics.update(biometrics)
            update_data["biometrics"] = self.biometrics
        
        if update_data:
            db.users.update_one(
                {"_id": self._id},
                {"$set": update_data}
            )
        
        return True
    
    def update_profile_data(self, profile_data):
        """Update user's extended profile data from onboarding"""
        db = get_db()
        
        # Update the instance
        if profile_data:
            self.profile_data.update(profile_data)
            
        # Demo mode - just update the instance
        if db is None:
            return True
            
        # Update in database
        try:
            result = db.users.update_one(
                {"_id": self._id},
                {"$set": {"profile_data": self.profile_data}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating profile data: {e}")
            return False
