import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect to login for Spotify-related auth errors
      const isSpotifyEndpoint = error.config?.url?.includes('/music/spotify') || 
                                error.config?.url?.includes('/music/create-spotify-playlist');
      
      if (!isSpotifyEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (userData) => 
    api.post('/auth/register', userData).then(res => res.data),
  
  getProfile: () => 
    api.get('/auth/profile').then(res => res.data.user),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData).then(res => res.data.user),
  
  getFriendCode: () => 
    api.get('/auth/friend-code').then(res => res.data.friend_code),
  
  completeOnboarding: (profileData) => 
    api.post('/auth/onboarding', profileData).then(res => res.data),
  
  updateProfilePhoto: (photoData) => 
    api.post('/auth/profile/photo', { profilePhoto: photoData }).then(res => res.data),
};

// Mood API
export const moodAPI = {
  submitMood: (moodData) => 
    api.post('/mood/submit', moodData).then(res => res.data),
  
  getMoodHistory: (params = {}) => 
    api.get('/mood/history', { params }).then(res => res.data),
  
  getCurrentMood: () => 
    api.get('/mood/current').then(res => res.data),
  
  getMoodTrends: (params = {}) => 
    api.get('/mood/trends', { params }).then(res => res.data),
};

// Journal API
export const journalAPI = {
  createEntry: (entryData) => 
    api.post('/journal/entry', entryData).then(res => res.data),
  
  getEntries: (params = {}) => 
    api.get('/journal/entries', { params }).then(res => res.data),
  
  getEntry: (entryId) => 
    api.get(`/journal/entry/${entryId}`).then(res => res.data),
  
  updateEntry: (entryId, entryData) => 
    api.put(`/journal/entry/${entryId}`, entryData).then(res => res.data),
  
  deleteEntry: (entryId) => 
    api.delete(`/journal/entry/${entryId}`).then(res => res.data),
  
  getAIResponse: (content, mood = '') => 
    api.post('/journal/ai-response', { content, mood }).then(res => res.data),
  
  getStats: () => 
    api.get('/journal/stats').then(res => res.data),
};

// Activities API
export const activitiesAPI = {
  getRecommendations: (params = {}) => 
    api.get('/activities/recommend', { params }).then(res => res.data),
  
  logActivity: (activityData) => 
    api.post('/activities/log', activityData).then(res => res.data),
  
  getHistory: (params = {}) => 
    api.get('/activities/history', { params }).then(res => res.data),
  
  getStats: (params = {}) => 
    api.get('/activities/stats', { params }).then(res => res.data),
};

// Social API
export const socialAPI = {
  sendFriendRequest: (friendCode) => 
    api.post('/social/friend-request', { friend_code: friendCode }).then(res => res.data),
  
  getFriends: () => 
    api.get('/social/friends').then(res => res.data),
  
  sendNudge: (friendId, message) => 
    api.post('/social/nudge', { friend_id: friendId, message }).then(res => res.data),
  
  getNudges: (params = {}) => 
    api.get('/social/nudges', { params }).then(res => res.data),
  
  markNudgeAsRead: (nudgeId) => 
    api.put(`/social/nudge/${nudgeId}/read`).then(res => res.data),
  
  shareMood: (moodData) => 
    api.post('/social/mood-share', moodData).then(res => res.data),
  
  getSharedMoods: (params = {}) => 
    api.get('/social/shared-moods', { params }).then(res => res.data),
  
  removeFriend: (friendId) => 
    api.delete(`/social/friend/${friendId}/remove`).then(res => res.data),
  
  // Vent Wall API
  createVentPost: (postData) => 
    api.post('/social/vent', postData).then(res => res.data),
  
  getVentPosts: (params = {}) => 
    api.get('/social/vent', { params }).then(res => res.data),
  
  reactToVentPost: (postId, reaction) => 
    api.post(`/social/vent/${postId}/react`, { reaction }).then(res => res.data),
  
  removeVentReaction: (postId) => 
    api.delete(`/social/vent/${postId}/react`).then(res => res.data),
  
  deleteVentPost: (postId) => 
    api.delete(`/social/vent/${postId}`).then(res => res.data),
  
  getVentStats: () => 
    api.get('/social/vent/stats').then(res => res.data),
  
  // Comment API
  createComment: (postId, content) => 
    api.post(`/social/vent/${postId}/comments`, { content }).then(res => res.data),
  
  getComments: (postId, params = {}) => 
    api.get(`/social/vent/${postId}/comments`, { params }).then(res => res.data),
  
  deleteComment: (commentId) => 
    api.delete(`/social/vent/comments/${commentId}`).then(res => res.data),
  
  // Mood Heatmap API
  getMoodHeatmap: () => 
    api.get('/social/mood-heatmap').then(res => res.data),
};

// Music API
export const musicAPI = {
  generatePlaylist: (moodData) => 
    api.post('/music/generate', moodData).then(res => res.data),
  
  createSpotifyPlaylist: (moodData) => 
    api.post('/music/create-spotify-playlist', moodData).then(res => res.data),
  
  getSpotifyAuth: () => 
    api.get('/music/spotify/auth').then(res => res.data),
  
  getPlaylists: (params = {}) => 
    api.get('/music/playlists', { params }).then(res => res.data),
  
  getPlaylist: (playlistId) => 
    api.get(`/music/playlist/${playlistId}`).then(res => res.data),
  
  searchTracks: (query, params = {}) => 
    api.get('/music/search', { params: { q: query, ...params } }).then(res => res.data),
  
  getGenres: () => 
    api.get('/music/genres').then(res => res.data),
  
  getRecommendations: (params = {}) => 
    api.get('/music/recommendations', { params }).then(res => res.data),
  
  getFavorites: () => 
    api.get('/music/favorites').then(res => res.data),
  
  addFavorite: (trackData) => 
    api.post('/music/favorites', trackData).then(res => res.data),
  
  removeFavorite: (trackId) => 
    api.delete(`/music/favorites/${trackId}`).then(res => res.data),
  
  getStats: () => 
    api.get('/music/stats').then(res => res.data),
};

// Profile API
export const profileAPI = {
  updateProfile: (profileData) => 
    api.put('/profile/update', profileData).then(res => res.data),
  
  logBiometrics: (biometricData) => 
    api.post('/profile/biometrics', biometricData).then(res => res.data),
  
  getBiometrics: (params = {}) => 
    api.get('/profile/biometrics', { params }).then(res => res.data),
  
  getStats: (params = {}) => 
    api.get('/profile/stats', { params }).then(res => res.data),
  
  getInsights: () => 
    api.get('/profile/insights').then(res => res.data),
};

export default api;
