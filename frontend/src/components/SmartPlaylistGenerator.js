import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { musicAPI } from '../services/api';
import { 
  Zap, 
  Loader2, 
  Meh, 
  Sparkles,
  Clock,
  TrendingUp,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SmartPlaylistGenerator = ({ currentMood, onPlaylistGenerated }) => {
  const [autoLoading, setAutoLoading] = useState(false);
  
  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'happy': '😊',
      'sad': '😢', 
      'anxious': '😰',
      'calm': '😌',
      'energetic': '⚡',
      'romantic': '💕',
      'angry': '😤',
      'excited': '🤩',
      'peaceful': '🕊️',
      'motivated': '💪'
    };
    return moodEmojis[mood] || '🎵';
  };

  const getMoodColor = (mood) => {
    const moodColors = {
      'happy': 'from-yellow-400 to-orange-400',
      'sad': 'from-blue-400 to-indigo-400',
      'anxious': 'from-yellow-500 to-red-400',
      'calm': 'from-green-400 to-blue-400',
      'energetic': 'from-red-400 to-pink-400',
      'romantic': 'from-pink-400 to-purple-400',
      'angry': 'from-red-500 to-orange-500',
      'excited': 'from-purple-400 to-pink-400',
      'peaceful': 'from-blue-300 to-green-300',
      'motivated': 'from-orange-400 to-red-400'
    };
    return moodColors[mood] || 'from-primary-400 to-secondary-400';
  };

  const generateFromCurrentMood = async () => {
    setAutoLoading(true);
    try {
      const response = await musicAPI.generatePlaylistFromCurrentMood();
      
      // Call the callback to update the parent component
      if (onPlaylistGenerated) {
        onPlaylistGenerated(response.playlist);
      }
      
      toast.success(
        `🎵 Generated ${response.current_mood.mood} playlist with ${response.playlist.tracks.length} tracks!`
      );
    } catch (error) {
      console.error('Error generating smart playlist:', error);
      if (error.response?.status === 404) {
        toast.error('Please log your mood first to generate a smart playlist');
      } else {
        toast.error('Failed to generate smart playlist. Please try again.');
      }
    } finally {
      setAutoLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-8"
    >
      <div className="flex items-center mb-6">
        <Sparkles className="mr-3 text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">
          Smart Playlist Generator
        </h2>
      </div>
      
      {currentMood ? (
        <div className={`bg-gradient-to-r ${getMoodColor(currentMood.mood)} p-6 rounded-lg text-white shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">
                {getMoodEmoji(currentMood.mood)}
              </div>
              <div>
                <h3 className="text-xl font-bold capitalize">
                  {currentMood.mood} Mood
                </h3>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={16} />
                    <span>Intensity: {currentMood.intensity}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{formatTimeAgo(currentMood.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 mb-6">
            Based on your current mood, we'll create a personalized playlist that matches your vibe perfectly.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateFromCurrentMood}
            disabled={autoLoading}
            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-lg font-medium transition-all hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {autoLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={20} />
                Creating your perfect playlist...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Zap className="mr-2" size={20} />
                Generate Smart Playlist
              </div>
            )}
          </motion.button>
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <Meh className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Current Mood Detected
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            To enable smart playlist generation, please log your current mood first. 
            This helps us create the perfect musical experience for you.
          </p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center"
          >
            <Heart className="mr-2" size={18} />
            Log Your Mood
          </Link>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
          <Sparkles className="mr-2" size={16} />
          How Smart Playlists Work
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Uses your most recent mood entry</li>
          <li>• Considers mood intensity for song selection</li>
          <li>• Matches genres and audio features to your feeling</li>
          <li>• Creates 20 personalized track recommendations</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SmartPlaylistGenerator; 