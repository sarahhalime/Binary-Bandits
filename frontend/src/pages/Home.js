import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { moodAPI, profileAPI } from '../services/api';
import { 
  Heart, 
  Music, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Calendar,
  Smile,
  Frown,
  Meh,
  Zap,
  Coffee,
  Heart as HeartIcon,
  User,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingMood, setSubmittingMood] = useState(false);

  const moods = [
    { name: 'happy', icon: Smile, color: 'warm', emoji: '😊' },
    { name: 'sad', icon: Frown, color: 'blue', emoji: '😢' },
    { name: 'anxious', icon: Zap, color: 'yellow', emoji: '😰' },
    { name: 'calm', icon: Heart, color: 'calm', emoji: '😌' },
    { name: 'energetic', icon: Coffee, color: 'orange', emoji: '⚡' },
    { name: 'romantic', icon: HeartIcon, color: 'pink', emoji: '💕' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [moodRes, insightsRes] = await Promise.all([
        moodAPI.getCurrentMood(),
        profileAPI.getInsights()
      ]);

      if (moodRes.current_mood) {
        setCurrentMood(moodRes.current_mood);
      }

      if (insightsRes.insights) {
        setInsights(insightsRes.insights);
      }

      // Load recent mood history
      const historyRes = await moodAPI.getMoodHistory({ days: 7, limit: 5 });
      setMoodHistory(historyRes.entries || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (mood, intensity = 5) => {
    setSubmittingMood(true);
    try {
      const response = await moodAPI.submitMood({
        mood,
        intensity,
        notes: `Feeling ${mood} with intensity ${intensity}/10`
      });

      setCurrentMood(response.mood_entry);
      toast.success('Mood recorded successfully!');
      
      // Reload dashboard data
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to record mood. Please try again.');
    } finally {
      setSubmittingMood(false);
    }
  };

  const quickActions = [
    {
      title: 'Complete Profile Setup',
      description: 'Personalize your experience',
      icon: User,
      color: 'purple',
      path: '/onboarding',
      isNew: true
    },
    {
      title: 'Generate Playlist',
      description: 'Get music based on your mood',
      icon: Music,
      color: 'primary',
      path: '/music'
    },
    {
      title: 'Write Journal',
      description: 'Express your thoughts',
      icon: BookOpen,
      color: 'secondary',
      path: '/journal'
    },
    {
      title: 'Find Activities',
      description: 'Discover mood-lifting activities',
      icon: Activity,
      color: 'calm',
      path: '/activities'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          How are you feeling today?
        </p>
      </motion.div>

      {/* Current Mood Display */}
      {currentMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Current Mood
              </h3>
              <p className="text-gray-600">
                You're feeling {currentMood.mood} (Intensity: {currentMood.intensity}/10)
              </p>
            </div>
            <div className="text-4xl">
              {moods.find(m => m.name === currentMood.mood)?.emoji || '😊'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          How are you feeling right now?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {moods.map((mood, index) => (
            <motion.button
              key={mood.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSubmit(mood.name)}
              disabled={submittingMood}
              className={`mood-card ${mood.color} p-4 text-center transition-all duration-300 ${
                submittingMood ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="font-medium text-gray-700 capitalize">
                {mood.name}
              </div>
            </motion.button>
          ))}
        </div>

        {submittingMood && (
          <div className="text-center mt-4">
            <div className="spinner inline-block"></div>
            <p className="text-gray-600 mt-2">Recording your mood...</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`card cursor-pointer group relative ${
                action.isNew ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50' : ''
              }`}
              onClick={() => window.location.href = action.path}
            >
              {action.isNew && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </div>
              )}
              <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${action.color}-200 transition-colors`}>
                <Icon className={`text-${action.color}-600`} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600">
                {action.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-primary-600" size={24} />
            Personalized Insights
          </h2>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 bg-gradient-to-r from-calm-50 to-primary-50 rounded-lg border border-calm-200"
              >
                <p className="text-gray-800 mb-2">{insight.message}</p>
                <p className="text-sm text-gray-600">{insight.suggestion}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Mood History */}
      {moodHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="mr-2 text-primary-600" size={24} />
            Recent Mood History
          </h2>
          
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {moods.find(m => m.name === entry.mood)?.emoji || '😊'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">
                      {entry.mood}
                    </p>
                    <p className="text-sm text-gray-600">
                      Intensity: {entry.intensity}/10
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
