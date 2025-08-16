from flask import Blueprint, request, jsonify, redirect, session
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
from services.spotify_service import SpotifyService
from datetime import datetime
from bson import ObjectId
import secrets

music_bp = Blueprint('music', __name__)

# Initialize Spotify service
spotify_service = SpotifyService()

@music_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_mood_playlist():
    """Generate a mood-based playlist using Spotify API"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('mood'):
            return jsonify({'error': 'Mood is required'}), 400
        
        mood = data['mood'].lower()
        intensity = data.get('intensity', 5)
        limit = data.get('limit', 20)
        
        # Generate playlist based on mood
        playlist = spotify_service.generate_mood_playlist(mood, intensity, limit)
        
        # Save playlist to database
        db = get_db()
        playlist_entry = {
            'user_id': ObjectId(user_id),
            'mood': mood,
            'intensity': intensity,
            'playlist': playlist,
            'timestamp': datetime.utcnow(),
            'tracks_count': len(playlist.get('tracks', []))
        }
        
        result = db.playlists.insert_one(playlist_entry)
        
        return jsonify({
            'message': 'Playlist generated successfully',
            'playlist': {
                'id': str(result.inserted_id),
                'mood': mood,
                'intensity': intensity,
                'tracks': playlist.get('tracks', []),
                'timestamp': playlist_entry['timestamp'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/spotify/auth', methods=['GET'])
@jwt_required()
def spotify_auth():
    """Initiate Spotify OAuth"""
    try:
        user_id = get_jwt_identity()
        
        # Generate state for security
        state = secrets.token_urlsafe(32)
        
        # Store state in session or database (for demo, we'll use a simple approach)
        auth_url = spotify_service.get_oauth_url(state=f"{state}:{user_id}")
        
        if not auth_url:
            return jsonify({'error': 'Spotify authentication not available'}), 500
        
        return jsonify({
            'auth_url': auth_url,
            'state': state
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/spotify/callback', methods=['GET'])
def spotify_callback():
    """Handle Spotify OAuth callback - this won't be used with the new redirect setup"""
    return jsonify({'message': 'This endpoint is not used with external redirect'}), 200

@music_bp.route('/create-spotify-playlist', methods=['POST'])
@jwt_required()
def create_spotify_playlist():
    """Create a playlist in user's Spotify account"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print(f"Creating Spotify playlist for user: {user_id}")
        print(f"Request data: {data}")
        
        # Validate required fields
        if not data.get('mood'):
            return jsonify({'error': 'Mood is required'}), 400
        
        mood = data['mood'].lower()
        intensity = data.get('intensity', 5)
        limit = data.get('limit', 20)
        
        print(f"Mood: {mood}, Intensity: {intensity}, Limit: {limit}")
        
        # Check if Spotify service is available
        if not spotify_service.spotify_available:
            # Demo mode - simulate successful playlist creation
            demo_playlist = {
                'success': True,
                'playlist_id': 'demo_spotify_playlist',
                'playlist_url': 'https://open.spotify.com/playlist/demo',
                'playlist_name': f"My {mood.title()} Mood Playlist - Demo",
                'tracks_added': 15
            }
            
            return jsonify({
                'message': 'Demo Spotify playlist created successfully!',
                'playlist': {
                    'id': 'demo_playlist_id',
                    'spotify_id': demo_playlist['playlist_id'],
                    'name': demo_playlist['playlist_name'],
                    'url': demo_playlist['playlist_url'],
                    'tracks_added': demo_playlist['tracks_added'],
                    'mood': mood,
                    'intensity': intensity
                }
            }), 201
        
        # Get user's Spotify token
        db = get_db()
        if db is None:
            return jsonify({'error': 'Database not available'}), 500
        
        try:
            token_doc = db.spotify_tokens.find_one({'user_id': ObjectId(user_id)})
            print(f"Token document found: {token_doc is not None}")
        except Exception as e:
            print(f"Database query error: {e}")
            return jsonify({'error': f'Database query failed: {str(e)}'}), 500
        
        if not token_doc:
            return jsonify({'error': 'Spotify not connected. Please authenticate first.'}), 401
        
        access_token = token_doc['access_token']
        
        # Check if token is expired and refresh if needed
        if datetime.utcnow().timestamp() >= token_doc['expires_at']:
            refresh_token = token_doc['refresh_token']
            new_token_info = spotify_service.refresh_token(refresh_token)
            
            if not new_token_info:
                return jsonify({'error': 'Failed to refresh Spotify token. Please re-authenticate.'}), 401
            
            # Update token in database
            db.spotify_tokens.update_one(
                {'user_id': ObjectId(user_id)},
                {
                    '$set': {
                        'access_token': new_token_info['access_token'],
                        'expires_at': new_token_info['expires_at'],
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            access_token = new_token_info['access_token']
        
        # Generate playlist tracks
        playlist_data = spotify_service.generate_mood_playlist(mood, intensity, limit)
        tracks = playlist_data.get('tracks', [])
        
        # Create playlist in Spotify
        result = spotify_service.create_spotify_playlist(access_token, mood, intensity, tracks)
        
        if not result['success']:
            return jsonify({'error': f"Failed to create Spotify playlist: {result['error']}"}), 500
        
        # Save playlist info to database
        playlist_entry = {
            'user_id': ObjectId(user_id),
            'mood': mood,
            'intensity': intensity,
            'spotify_playlist_id': result['playlist_id'],
            'spotify_playlist_url': result['playlist_url'],
            'playlist_name': result['playlist_name'],
            'tracks': tracks,
            'tracks_count': result['tracks_added'],
            'timestamp': datetime.utcnow(),
            'created_in_spotify': True
        }
        
        db_result = db.playlists.insert_one(playlist_entry)
        
        return jsonify({
            'message': 'Spotify playlist created successfully!',
            'playlist': {
                'id': str(db_result.inserted_id),
                'spotify_id': result['playlist_id'],
                'name': result['playlist_name'],
                'url': result['playlist_url'],
                'tracks_added': result['tracks_added'],
                'mood': mood,
                'intensity': intensity
            }
        }), 201
        
    except Exception as e:
        print(f"Create playlist error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@music_bp.route('/playlists', methods=['GET'])
@jwt_required()
def get_user_playlists():
    """Get user's generated playlists"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Demo mode - return sample playlists
        if db is None:
            demo_playlists = [
                {
                    'id': 'demo_playlist_1',
                    'mood': 'calm',
                    'intensity': 6,
                    'tracks_count': 15,
                    'timestamp': datetime.utcnow().isoformat(),
                    'playlist': {
                        'mood': 'calm',
                        'intensity': 6,
                        'tracks': [
                            {'name': 'Weightless', 'artist': 'Marconi Union'},
                            {'name': 'Claire de Lune', 'artist': 'Debussy'},
                            {'name': 'River Flows in You', 'artist': 'Yiruma'}
                        ]
                    }
                },
                {
                    'id': 'demo_playlist_2',
                    'mood': 'happy',
                    'intensity': 8,
                    'tracks_count': 18,
                    'timestamp': datetime.utcnow().isoformat(),
                    'playlist': {
                        'mood': 'happy',
                        'intensity': 8,
                        'tracks': [
                            {'name': 'Happy', 'artist': 'Pharrell Williams'},
                            {'name': 'Good Life', 'artist': 'OneRepublic'},
                            {'name': 'Walking on Sunshine', 'artist': 'Katrina & The Waves'}
                        ]
                    }
                },
                {
                    'id': 'demo_playlist_3',
                    'mood': 'energetic',
                    'intensity': 9,
                    'tracks_count': 20,
                    'timestamp': datetime.utcnow().isoformat(),
                    'playlist': {
                        'mood': 'energetic',
                        'intensity': 9,
                        'tracks': [
                            {'name': 'Eye of the Tiger', 'artist': 'Survivor'},
                            {'name': 'We Will Rock You', 'artist': 'Queen'},
                            {'name': 'Don\'t Stop Believin\'', 'artist': 'Journey'}
                        ]
                    }
                }
            ]
            return jsonify({
                'playlists': demo_playlists,
                'pagination': {
                    'page': 1,
                    'limit': 10,
                    'total': len(demo_playlists),
                    'pages': 1
                }
            }), 200
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        skip = (page - 1) * limit
        
        # Get playlists
        playlists = list(db.playlists.find({
            'user_id': ObjectId(user_id)
        }).sort('timestamp', -1).skip(skip).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for playlist in playlists:
            playlist['id'] = str(playlist['_id'])
            playlist['timestamp'] = playlist['timestamp'].isoformat()
            # Convert user_id ObjectId to string if present
            if 'user_id' in playlist:
                playlist['user_id'] = str(playlist['user_id'])
            # Convert any other ObjectIds that might be present
            if 'mood_entry_id' in playlist:
                playlist['mood_entry_id'] = str(playlist['mood_entry_id'])
            del playlist['_id']
        
        # Get total count
        total_count = db.playlists.count_documents({'user_id': ObjectId(user_id)})
        
        return jsonify({
            'playlists': playlists,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        print(f"Get playlists error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to get playlists: {str(e)}'}), 500

@music_bp.route('/playlist/<playlist_id>', methods=['GET'])
@jwt_required()
def get_playlist(playlist_id):
    """Get a specific playlist"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get playlist
        playlist = db.playlists.find_one({
            '_id': ObjectId(playlist_id),
            'user_id': ObjectId(user_id)
        })
        
        if not playlist:
            return jsonify({'error': 'Playlist not found'}), 404
        
        playlist['id'] = str(playlist['_id'])
        playlist['timestamp'] = playlist['timestamp'].isoformat()
        del playlist['_id']
        
        return jsonify({
            'playlist': playlist
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/search', methods=['GET'])
@jwt_required()
def search_tracks():
    """Search for tracks on Spotify"""
    try:
        query = request.args.get('q', '')
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Search tracks
        tracks = spotify_service.search_tracks(query, limit)
        
        return jsonify({
            'tracks': tracks
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/genres', methods=['GET'])
@jwt_required()
def get_available_genres():
    """Get available music genres"""
    try:
        genres = spotify_service.get_available_genres()
        
        return jsonify({
            'genres': genres
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_track_recommendations():
    """Get track recommendations based on seed tracks or genres"""
    try:
        seed_tracks = request.args.get('seed_tracks', '').split(',')
        seed_genres = request.args.get('seed_genres', '').split(',')
        limit = request.args.get('limit', 20, type=int)
        
        # Filter out empty strings
        seed_tracks = [track for track in seed_tracks if track]
        seed_genres = [genre for genre in seed_genres if genre]
        
        if not seed_tracks and not seed_genres:
            return jsonify({'error': 'Must provide seed tracks or genres'}), 400
        
        # Get recommendations
        recommendations = spotify_service.get_recommendations(
            seed_tracks=seed_tracks,
            seed_genres=seed_genres,
            limit=limit
        )
        
        return jsonify({
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    """Get user's favorite tracks"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get user's favorite tracks
        favorites = list(db.favorite_tracks.find({
            'user_id': ObjectId(user_id)
        }).sort('added_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for favorite in favorites:
            favorite['id'] = str(favorite['_id'])
            favorite['added_at'] = favorite['added_at'].isoformat()
            del favorite['_id']
        
        return jsonify({
            'favorites': favorites
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite_track():
    """Add a track to user's favorites"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('track_id'):
            return jsonify({'error': 'Track ID is required'}), 400
        
        track_id = data['track_id']
        track_name = data.get('track_name', '')
        artist_name = data.get('artist_name', '')
        
        db = get_db()
        
        # Check if already in favorites
        existing = db.favorite_tracks.find_one({
            'user_id': ObjectId(user_id),
            'track_id': track_id
        })
        
        if existing:
            return jsonify({'error': 'Track already in favorites'}), 400
        
        # Add to favorites
        favorite = {
            'user_id': ObjectId(user_id),
            'track_id': track_id,
            'track_name': track_name,
            'artist_name': artist_name,
            'added_at': datetime.utcnow()
        }
        
        result = db.favorite_tracks.insert_one(favorite)
        
        return jsonify({
            'message': 'Track added to favorites',
            'favorite': {
                'id': str(result.inserted_id),
                'track_id': track_id,
                'track_name': track_name,
                'artist_name': artist_name,
                'added_at': favorite['added_at'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/favorites/<track_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite_track(track_id):
    """Remove a track from user's favorites"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Remove from favorites
        result = db.favorite_tracks.delete_one({
            'user_id': ObjectId(user_id),
            'track_id': track_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Track not found in favorites'}), 404
        
        return jsonify({
            'message': 'Track removed from favorites'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@music_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_music_stats():
    """Get user's music listening statistics"""
    try:
        user_id = get_jwt_identity()
        db = get_db()
        
        # Get basic stats
        total_playlists = db.playlists.count_documents({'user_id': ObjectId(user_id)})
        total_favorites = db.favorite_tracks.count_documents({'user_id': ObjectId(user_id)})
        
        # Get mood distribution for playlists
        mood_pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {'$group': {'_id': '$mood', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        mood_distribution = list(db.playlists.aggregate(mood_pipeline))
        
        # Get most recent playlist
        recent_playlist = db.playlists.find_one(
            {'user_id': ObjectId(user_id)},
            sort=[('timestamp', -1)]
        )
        
        return jsonify({
            'total_playlists': total_playlists,
            'total_favorites': total_favorites,
            'mood_distribution': mood_distribution,
            'recent_playlist': {
                'mood': recent_playlist.get('mood') if recent_playlist else None,
                'timestamp': recent_playlist.get('timestamp', '').isoformat() if recent_playlist else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
