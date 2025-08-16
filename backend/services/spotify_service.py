import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
import os
import random
from datetime import datetime

class SpotifyService:
    def __init__(self):
        """Initialize Spotify service with client credentials"""
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8888/callback')
        
        # Debug: Print what we're getting from environment
        print(f"Debug - Loaded Client ID: {self.client_id[:10] + '...' if self.client_id else 'None'}")
        print(f"Debug - Loaded Client Secret: {self.client_secret[:10] + '...' if self.client_secret else 'None'}")
        print(f"Debug - Redirect URI: {self.redirect_uri}")
        
        # Initialize Spotify client if credentials are available
        if self.client_id and self.client_secret:
            try:
                # Client credentials for public data (search, recommendations)
                self.sp = spotipy.Spotify(
                    client_credentials_manager=SpotifyClientCredentials(
                        client_id=self.client_id,
                        client_secret=self.client_secret
                    )
                )
                self.spotify_available = True
                print("✅ Spotify service initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize Spotify service: {e}")
                self.sp = None
                self.spotify_available = False
        else:
            print("❌ Warning: Spotify credentials not found. Music features will be limited.")
            print(f"Client ID present: {bool(self.client_id)}")
            print(f"Client Secret present: {bool(self.client_secret)}")
            self.sp = None
            self.spotify_available = False
        
        # Mood to genre/audio feature mappings
        self.mood_mappings = {
            'happy': {
                'genres': ['pop', 'dance', 'happy', 'summer'],
                'audio_features': {
                    'valence': (0.7, 1.0),
                    'energy': (0.6, 1.0),
                    'tempo': (120, 160)
                }
            },
            'sad': {
                'genres': ['sad', 'melancholy', 'indie', 'acoustic'],
                'audio_features': {
                    'valence': (0.0, 0.4),
                    'energy': (0.0, 0.5),
                    'tempo': (60, 100)
                }
            },
            'anxious': {
                'genres': ['ambient', 'chill', 'meditation', 'nature'],
                'audio_features': {
                    'valence': (0.3, 0.7),
                    'energy': (0.0, 0.4),
                    'tempo': (60, 90)
                }
            },
            'angry': {
                'genres': ['rock', 'metal', 'punk', 'electronic'],
                'audio_features': {
                    'valence': (0.0, 0.5),
                    'energy': (0.7, 1.0),
                    'tempo': (140, 200)
                }
            },
            'calm': {
                'genres': ['ambient', 'chill', 'jazz', 'classical'],
                'audio_features': {
                    'valence': (0.4, 0.8),
                    'energy': (0.0, 0.3),
                    'tempo': (60, 100)
                }
            },
            'energetic': {
                'genres': ['dance', 'electronic', 'pop', 'rock'],
                'audio_features': {
                    'valence': (0.6, 1.0),
                    'energy': (0.8, 1.0),
                    'tempo': (130, 180)
                }
            },
            'romantic': {
                'genres': ['r-n-b', 'soul', 'jazz', 'acoustic'],
                'audio_features': {
                    'valence': (0.5, 0.9),
                    'energy': (0.2, 0.6),
                    'tempo': (70, 120)
                }
            }
        }
    
    def generate_mood_playlist(self, mood, intensity=5, limit=20):
        """Generate a playlist based on mood and intensity"""
        if not self.spotify_available:
            return self._get_fallback_playlist(mood, intensity, limit)
            
        try:
            # Get mood mapping
            mood_config = self.mood_mappings.get(mood.lower(), self.mood_mappings['calm'])
            
            # Adjust audio features based on intensity
            audio_features = self._adjust_features_for_intensity(mood_config['audio_features'], intensity)
            
            # Get seed genres
            seed_genres = self._get_seed_genres(mood_config['genres'])
            
            # Get recommendations
            recommendations = self.sp.recommendations(
                seed_genres=seed_genres[:5],  # Spotify allows max 5 seed genres
                target_valence=audio_features['valence'][0],
                target_energy=audio_features['energy'][0],
                target_tempo=audio_features['tempo'][0],
                limit=limit
            )
            
            # Format tracks
            tracks = []
            for track in recommendations['tracks']:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None
                }
                tracks.append(track_info)
            
            return {
                'mood': mood,
                'intensity': intensity,
                'tracks': tracks,
                'total_tracks': len(tracks)
            }
            
        except Exception as e:
            # Fallback to predefined playlists
            return self._get_fallback_playlist(mood, limit)
    
    def search_tracks(self, query, limit=10):
        """Search for tracks"""
        try:
            results = self.sp.search(q=query, type='track', limit=limit)
            
            tracks = []
            for track in results['tracks']['items']:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None
                }
                tracks.append(track_info)
            
            return tracks
            
        except Exception as e:
            return []
    
    def get_available_genres(self):
        """Get available genres"""
        if not self.spotify_available:
            return ['pop', 'rock', 'electronic', 'jazz', 'classical', 'ambient', 'chill']
            
        try:
            genres = self.sp.recommendation_genres()
            return genres['genres']
        except Exception as e:
            return ['pop', 'rock', 'electronic', 'jazz', 'classical', 'ambient', 'chill']
    
    def get_recommendations(self, seed_tracks=None, seed_genres=None, limit=20):
        """Get track recommendations"""
        if not self.spotify_available:
            return []
            
        try:
            recommendations = self.sp.recommendations(
                seed_tracks=seed_tracks[:5] if seed_tracks else None,
                seed_genres=seed_genres[:5] if seed_genres else None,
                limit=limit
            )
            
            tracks = []
            for track in recommendations['tracks']:
                track_info = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'album': track['album']['name'],
                    'duration_ms': track['duration_ms'],
                    'popularity': track['popularity'],
                    'preview_url': track['preview_url'],
                    'external_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None
                }
                tracks.append(track_info)
            
            return tracks
            
        except Exception as e:
            return []
    
    def _adjust_features_for_intensity(self, features, intensity):
        """Adjust audio features based on intensity level"""
        adjusted_features = {}
        
        for feature, (min_val, max_val) in features.items():
            # Intensity affects the range - higher intensity = more extreme values
            range_size = max_val - min_val
            intensity_factor = intensity / 10.0
            
            if feature == 'valence':
                # Higher intensity for sad/angry = lower valence
                adjusted_features[feature] = (min_val, min_val + range_size * intensity_factor)
            elif feature == 'energy':
                # Higher intensity = higher energy
                adjusted_features[feature] = (min_val + range_size * (1 - intensity_factor), max_val)
            elif feature == 'tempo':
                # Higher intensity = higher tempo
                adjusted_features[feature] = (min_val + range_size * (1 - intensity_factor), max_val)
        
        return adjusted_features
    
    def _get_seed_genres(self, target_genres):
        """Get available seed genres that match target genres"""
        if not self.spotify_available:
            return ['pop', 'rock', 'electronic', 'jazz', 'classical']
            
        try:
            available_genres = self.sp.recommendation_genres()['genres']
            
            # Find matching genres
            matching_genres = []
            for target in target_genres:
                for available in available_genres:
                    if target in available or available in target:
                        matching_genres.append(available)
            
            # If no matches found, return some default genres
            if not matching_genres:
                matching_genres = ['pop', 'rock', 'electronic', 'jazz', 'classical']
            
            return matching_genres[:5]  # Spotify allows max 5 seed genres
            
        except Exception as e:
            return ['pop', 'rock', 'electronic', 'jazz', 'classical']
    
    def _get_fallback_playlist(self, mood, intensity=5, limit=20):
        """Get fallback playlist when API fails"""
        # Predefined tracks for different moods
        fallback_tracks = {
            'happy': [
                {'name': 'Happy', 'artist': 'Pharrell Williams'},
                {'name': 'Good Life', 'artist': 'OneRepublic'},
                {'name': 'Walking on Sunshine', 'artist': 'Katrina & The Waves'}
            ],
            'sad': [
                {'name': 'Mad World', 'artist': 'Gary Jules'},
                {'name': 'Hallelujah', 'artist': 'Jeff Buckley'},
                {'name': 'The Scientist', 'artist': 'Coldplay'}
            ],
            'calm': [
                {'name': 'Claire de Lune', 'artist': 'Debussy'},
                {'name': 'Weightless', 'artist': 'Marconi Union'},
                {'name': 'River Flows in You', 'artist': 'Yiruma'}
            ],
            'energetic': [
                {'name': 'Eye of the Tiger', 'artist': 'Survivor'},
                {'name': 'We Will Rock You', 'artist': 'Queen'},
                {'name': 'Don\'t Stop Believin\'', 'artist': 'Journey'}
            ]
        }
        
        tracks = fallback_tracks.get(mood.lower(), fallback_tracks['calm'])
        
        # Format tracks to match API response
        formatted_tracks = []
        for i, track in enumerate(tracks[:limit]):
            formatted_tracks.append({
                'id': f'fallback_{i}',
                'name': track['name'],
                'artist': track['artist'],
                'album': 'Fallback Playlist',
                'duration_ms': 180000,  # 3 minutes
                'popularity': 50,
                'preview_url': None,
                'external_url': None,
                'album_art': None
            })
        
        return {
            'mood': mood,
            'intensity': 5,
            'tracks': formatted_tracks,
            'total_tracks': len(formatted_tracks),
            'fallback': True
        }
    
    def get_oauth_url(self, state=None):
        """Get Spotify OAuth authorization URL"""
        if not self.client_id or not self.client_secret:
            print("Missing Spotify credentials for OAuth")
            return None
            
        try:
            oauth = SpotifyOAuth(
                client_id=self.client_id,
                client_secret=self.client_secret,
                redirect_uri=self.redirect_uri,
                scope="playlist-modify-public playlist-modify-private",
                state=state
            )
            
            auth_url = oauth.get_authorize_url()
            print(f"Generated OAuth URL: {auth_url}")
            return auth_url
        except Exception as e:
            print(f"Error generating OAuth URL: {e}")
            return None
    
    def handle_oauth_callback(self, code, state=None):
        """Handle OAuth callback and get access token"""
        if not self.client_id or not self.client_secret:
            return None
            
        oauth = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope="playlist-modify-public playlist-modify-private",
            state=state
        )
        
        try:
            token_info = oauth.get_access_token(code)
            return token_info
        except Exception as e:
            print(f"Error getting access token: {e}")
            return None
    
    def create_spotify_playlist(self, access_token, mood, intensity, tracks):
        """Create a playlist in the user's Spotify account"""
        try:
            # Create authenticated Spotify client
            sp_user = spotipy.Spotify(auth=access_token)
            
            # Get user's Spotify ID
            user_info = sp_user.me()
            user_id = user_info['id']
            
            # Create playlist name with timestamp
            date_str = datetime.now().strftime("%Y-%m-%d")
            playlist_name = f"My {mood.title()} Mood Playlist - {date_str}"
            playlist_description = f"Generated based on {mood} mood with intensity {intensity}/10 from Mindful Harmony"
            
            # Create the playlist
            playlist = sp_user.user_playlist_create(
                user=user_id,
                name=playlist_name,
                public=False,  # Private by default
                description=playlist_description
            )
            
            # Add tracks to playlist if we have any
            if tracks:
                track_uris = []
                for track in tracks:
                    if track.get('id') and not track['id'].startswith('fallback_'):
                        track_uris.append(f"spotify:track:{track['id']}")
                
                if track_uris:
                    # Add tracks in batches of 100 (Spotify limit)
                    for i in range(0, len(track_uris), 100):
                        batch = track_uris[i:i+100]
                        sp_user.playlist_add_items(playlist['id'], batch)
            
            return {
                'success': True,
                'playlist_id': playlist['id'],
                'playlist_url': playlist['external_urls']['spotify'],
                'playlist_name': playlist_name,
                'tracks_added': len(track_uris) if tracks else 0
            }
            
        except Exception as e:
            print(f"Error creating Spotify playlist: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def refresh_token(self, refresh_token):
        """Refresh an expired access token"""
        try:
            oauth = SpotifyOAuth(
                client_id=self.client_id,
                client_secret=self.client_secret,
                redirect_uri=self.redirect_uri,
                scope="playlist-modify-public playlist-modify-private"
            )
            
            token_info = oauth.refresh_access_token(refresh_token)
            return token_info
        except Exception as e:
            print(f"Error refreshing token: {e}")
            return None
