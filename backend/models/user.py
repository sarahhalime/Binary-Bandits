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
        return {
            'id': str(self._id) if hasattr(self, '_id') else None,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'profile_pic': self.profile_pic,
            'friend_code': self.friend_code,
            'favorite_genres': self.favorite_genres,
            'biometrics': self.biometrics,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat(),
            'is_active': self.is_active
        }

    @staticmethod
    def create_user(username, email, password, name=None, profile_pic=None):
        """Create a new user in the database"""
        db = get_db()
        
        # Demo mode - always return the demo account
        if db is None:
            user = User(
                DEMO_ACCOUNT['username'],
                DEMO_ACCOUNT['email'],
                DEMO_ACCOUNT['password'],
                DEMO_ACCOUNT['name']
            )
            user._id = "demo_user_12345"  # Fixed demo ID
            user.friend_code = DEMO_ACCOUNT['friend_code']
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
        
        # Demo mode - always return the demo account
        if db is None:
            user = User(
                DEMO_ACCOUNT['username'],
                DEMO_ACCOUNT['email'],
                DEMO_ACCOUNT['password'],
                DEMO_ACCOUNT['name']
            )
            user._id = "demo_user_12345"  # Fixed demo ID
            user.friend_code = DEMO_ACCOUNT['friend_code']
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
        
        # Demo mode - always return the demo account
        if db is None:
            user = User(
                DEMO_ACCOUNT['username'],
                DEMO_ACCOUNT['email'],
                DEMO_ACCOUNT['password'],
                DEMO_ACCOUNT['name']
            )
            user._id = "demo_user_12345"  # Fixed demo ID
            user.friend_code = DEMO_ACCOUNT['friend_code']
            return user
            
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
