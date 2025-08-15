import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { 
  User, 
  Heart, 
  Activity, 
  BookOpen, 
  Music, 
  Users,
  TrendingUp,
  Clock,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [biometrics, setBiometrics] = useState({
    heart_rate: '',
    sleep_hours: '',
    exercise_minutes: ''
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await profileAPI.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBiometricSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await profileAPI.logBiometrics(biometrics);
      toast.success('Biometrics logged successfully!');
      setBiometrics({ heart_rate: '', sleep_hours: '', exercise_minutes: '' });
      loadStats();
    } catch (error) {
      toast.error('Failed to log biometrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBiometrics(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const statCards = [
    {
      title: 'Mood Entries',
      value: stats?.mood_stats?.total_entries || 0,
      icon: Heart,
      color: 'primary',
      description: 'Total mood records'
    },
    {
      title: 'Journal Entries',
      value: stats?.journal_stats?.total_entries || 0,
      icon: BookOpen,
      color: 'secondary',
      description: 'Written reflections'
    },
    {
      title: 'Activities',
      value: stats?.activity_stats?.total_activities || 0,
      icon: Activity,
      color: 'calm',
      description: 'Completed activities'
    },
    {
      title: 'Playlists',
      value: stats?.music_stats?.total_playlists || 0,
      icon: Music,
      color: 'warm',
      description: 'Generated playlists'
    },
    {
      title: 'Friends',
      value: stats?.social_stats?.total_friends || 0,
      icon: Users,
      color: 'secondary',
      description: 'Social connections'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <User className="mr-3 text-primary-600" size={40} />
          Your Profile
        </h1>
        <p className="text-lg text-gray-600">
          Track your mental health journey and personal insights
        </p>
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Edit size={16} />
            <span className="text-sm font-medium">
              {editing ? 'Cancel' : 'Edit'}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-6">
          {user?.profile_pic ? (
            <img 
              src={user.profile_pic} 
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-calm-400 to-calm-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{user?.name}</h3>
            <p className="text-gray-600 mb-2">@{user?.username}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="card text-center"
            >
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Biometrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Heart className="mr-2 text-primary-600" size={24} />
            Log Biometrics
          </h2>

          <form onSubmit={handleBiometricSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                name="heart_rate"
                value={biometrics.heart_rate}
                onChange={handleInputChange}
                placeholder="e.g., 72"
                className="input-field"
                min="40"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Hours
              </label>
              <input
                type="number"
                name="sleep_hours"
                value={biometrics.sleep_hours}
                onChange={handleInputChange}
                placeholder="e.g., 7.5"
                className="input-field"
                min="0"
                max="24"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Minutes
              </label>
              <input
                type="number"
                name="exercise_minutes"
                value={biometrics.exercise_minutes}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                className="input-field"
                min="0"
                max="300"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || (!biometrics.heart_rate && !biometrics.sleep_hours && !biometrics.exercise_minutes)}
              className={`w-full btn-primary ${
                loading || (!biometrics.heart_rate && !biometrics.sleep_hours && !biometrics.exercise_minutes)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {loading ? 'Logging...' : 'Log Biometrics'}
            </motion.button>
          </form>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-primary-600" size={24} />
            Recent Activity
          </h2>

          <div className="space-y-4">
            {stats?.mood_stats?.most_common_mood && (
              <div className="p-4 bg-gradient-to-r from-calm-50 to-primary-50 rounded-lg border border-calm-200">
                <h3 className="font-medium text-gray-800 mb-1">Most Common Mood</h3>
                <p className="text-gray-600 capitalize">{stats.mood_stats.most_common_mood}</p>
              </div>
            )}

            {stats?.journal_stats?.total_words > 0 && (
              <div className="p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg border border-secondary-200">
                <h3 className="font-medium text-gray-800 mb-1">Total Words Written</h3>
                <p className="text-gray-600">{stats.journal_stats.total_words.toLocaleString()} words</p>
              </div>
            )}

            {stats?.activity_stats?.total_duration_minutes > 0 && (
              <div className="p-4 bg-gradient-to-r from-warm-50 to-primary-50 rounded-lg border border-warm-200">
                <h3 className="font-medium text-gray-800 mb-1">Total Activity Time</h3>
                <p className="text-gray-600">{Math.round(stats.activity_stats.total_duration_minutes)} minutes</p>
              </div>
            )}

            {stats?.music_stats?.total_tracks > 0 && (
              <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                <h3 className="font-medium text-gray-800 mb-1">Total Tracks</h3>
                <p className="text-gray-600">{stats.music_stats.total_tracks} tracks in playlists</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
