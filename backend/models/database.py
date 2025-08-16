from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

# Global database connection
db = None

def init_db(app):
    """Initialize database connection"""
    global db
    
    # Check if MongoDB URI is provided
    mongodb_uri = app.config.get('MONGODB_URI')
    if not mongodb_uri:
        print("❌ MONGODB_URI environment variable not set")
        print("⚠️  Running in demo mode without database. Some features will be limited.")
        db = None
        return
    
    try:
        # Production-ready MongoDB connection with retry logic
        client = MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=10000,  # 10 second timeout for production
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            maxPoolSize=10,  # Connection pooling
            retryWrites=True
        )
        
        # Test the connection
        client.admin.command('ping')
        
        # Extract database name from URI or use default
        if 'mindful_harmony' in mongodb_uri:
            db = client.mindful_harmony
        else:
            db = client.get_default_database()
            
        print(f"✅ Successfully connected to MongoDB: {db.name}")
        
        # Create indexes for better performance
        create_indexes()
        
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("⚠️  Database connection timeout. Check your connection string.")
        db = None
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("⚠️  Running in demo mode without database. Some features will be limited.")
        db = None

def create_indexes():
    """Create database indexes for better performance"""
    if db is None:
        print("⚠️  Skipping index creation - database not available")
        return
        
    # Users collection indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("username", unique=True)
    db.users.create_index("friend_code", unique=True)
    
    # Mood entries indexes
    db.mood_entries.create_index([("user_id", 1), ("timestamp", -1)])
    db.mood_entries.create_index("timestamp")
    
    # Journal entries indexes
    db.journal_entries.create_index([("user_id", 1), ("timestamp", -1)])
    
    # Activities indexes
    db.activities.create_index([("user_id", 1), ("timestamp", -1)])
    
    # Friend connections indexes
    db.friend_connections.create_index([("user_id", 1), ("friend_id", 1)], unique=True)
    
    # Vent posts indexes
    db.vent_posts.create_index([("timestamp", -1)])
    db.vent_posts.create_index([("is_active", 1), ("timestamp", -1)])
    db.vent_posts.create_index([("mood", 1), ("timestamp", -1)])
    db.vent_posts.create_index([("tags", 1), ("timestamp", -1)])
    
    # Vent comments indexes
    db.vent_comments.create_index([("post_id", 1), ("timestamp", 1)])
    db.vent_comments.create_index([("is_active", 1), ("timestamp", 1)])
    db.vent_comments.create_index([("user_id", 1), ("timestamp", -1)])
    
    print("✅ Database indexes created successfully")

def get_db():
    """Get database instance"""
    return db
