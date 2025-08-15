import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { musicAPI } from '../services/api';
import { 
  Music, 
  Play, 
  Heart, 
  Search, 
  Filter,
  ExternalLink,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Music = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(5);

  const moods = [
    { name: 'happy', emoji: '😊', color: 'warm' },
    { name: 'sad', emoji: '😢', color: 'blue' },
    { name: 'anxious', emoji: '😰', color: 'yellow' },
    { name: 'calm', emoji: '😌', color: 'calm' },
    { name: 'energetic', emoji: '⚡', color: 'orange' },
    { name: 'romantic', emoji: '💕', color: 'pink' },
  ];

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const response = await musicAPI.getPlaylists();
      setPlaylists(response.playlists || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const generatePlaylist = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood first');
      return;
    }

    setLoading(true);
    try {
      const response = await musicAPI.generatePlaylist({
        mood: selectedMood,
        intensity: intensity,
        limit: 20
      });

      setCurrentPlaylist(response.playlist);
      toast.success('Playlist generated successfully!');
      
      // Reload playlists
      loadPlaylists();
    } catch (error) {
      toast.error('Failed to generate playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await musicAPI.searchTracks(searchQuery);
      // Handle search results
      console.log('Search results:', response);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Music className="mr-3 text-primary-600" size={40} />
          Mood-to-Music
        </h1>
        <p className="text-lg text-gray-600">
          Generate personalized playlists based on your mood
        </p>
      </motion.div>

      {/* Playlist Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Generate New Playlist
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.name)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                    selectedMood === mood.name
                      ? `border-${mood.color}-500 bg-${mood.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-700 capitalize">
                    {mood.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood Intensity: {intensity}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="intensity-slider w-full mb-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generatePlaylist}
          disabled={loading || !selectedMood}
          className={`mt-6 w-full btn-primary py-3 text-lg font-medium ${
            loading || !selectedMood ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={20} />
              Generating playlist...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Play className="mr-2" size={20} />
              Generate Playlist
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Current Playlist */}
      {currentPlaylist && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Your {currentPlaylist.mood} Playlist
            </h2>
            <div className="text-sm text-gray-600">
              {currentPlaylist.tracks?.length || 0} tracks
            </div>
          </div>

          <div className="space-y-3">
            {currentPlaylist.tracks?.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Play className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{track.name}</h3>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {formatDuration(track.duration_ms)}
                  </span>
                  <a
                    href={track.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Search className="mr-2 text-primary-600" size={24} />
          Search Tracks
        </h2>

        <div className="flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            className="input-field flex-1"
            onKeyPress={(e) => e.key === 'Enter' && searchTracks()}
          />
          <button
            onClick={searchTracks}
            disabled={loading || !searchQuery.trim()}
            className="btn-primary px-6"
          >
            <Search size={20} />
          </button>
        </div>
      </motion.div>

      {/* Recent Playlists */}
      {playlists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Music className="mr-2 text-primary-600" size={24} />
            Recent Playlists
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.slice(0, 6).map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setCurrentPlaylist(playlist.playlist)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">
                    {moods.find(m => m.name === playlist.mood)?.emoji || '🎵'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {playlist.tracks_count} tracks
                  </span>
                </div>
                <h3 className="font-medium text-gray-800 capitalize mb-1">
                  {playlist.mood} Playlist
                </h3>
                <p className="text-sm text-gray-600">
                  Intensity: {playlist.intensity}/10
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(playlist.timestamp).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Music;
