from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

# Global database connection
db = None

def init_db(app):
    """Initialize database connection"""
    global db
    try:
        # Add timeout to prevent hanging
        client = MongoClient(
            app.config['MONGODB_URI'],
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        # Test the connection
        client.admin.command('ping')
        db = client.mindful_harmony
        print("✅ Successfully connected to MongoDB")
        
        # Create indexes for better performance
        create_indexes()
        
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
    
    print("✅ Database indexes created successfully")

def get_db():
    """Get database instance"""
    return db
