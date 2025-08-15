import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
import random

class SpotifyService:
    def __init__(self):
        """Initialize Spotify service with client credentials"""
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Spotify credentials not found in environment variables")
        
        # Initialize Spotify client
        self.sp = spotipy.Spotify(
            client_credentials_manager=SpotifyClientCredentials(
                client_id=self.client_id,
                client_secret=self.client_secret
            )
        )
        
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
        try:
            genres = self.sp.recommendation_genres()
            return genres['genres']
        except Exception as e:
            return []
    
    def get_recommendations(self, seed_tracks=None, seed_genres=None, limit=20):
        """Get track recommendations"""
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
    
    def _get_fallback_playlist(self, mood, limit):
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
