import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { activitiesAPI } from '../services/api';
import { 
  Activity, 
  Clock, 
  Heart, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');

  const moods = [
    { name: 'happy', emoji: '😊', color: 'warm' },
    { name: 'sad', emoji: '😢', color: 'blue' },
    { name: 'anxious', emoji: '😰', color: 'yellow' },
    { name: 'calm', emoji: '😌', color: 'calm' },
    { name: 'energetic', emoji: '⚡', color: 'orange' },
    { name: 'angry', emoji: '😠', color: 'red' },
  ];

  useEffect(() => {
    if (selectedMood) {
      loadActivities();
    }
  }, [selectedMood]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await activitiesAPI.getRecommendations({
        mood: selectedMood,
        intensity: 5
      });
      setActivities([
        ...(response.ai_suggestions || []),
        ...(response.predefined_activities || [])
      ]);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activity) => {
    try {
      await activitiesAPI.logActivity({
        activity_name: activity.name,
        duration: parseInt(activity.duration) || 10,
        notes: `Completed: ${activity.description}`
      });
      toast.success('Activity logged successfully!');
    } catch (error) {
      toast.error('Failed to log activity. Please try again.');
    }
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
          <Activity className="mr-3 text-primary-600" size={40} />
          Mood-to-Activity
        </h1>
        <p className="text-lg text-gray-600">
          Discover activities tailored to your current mood
        </p>
      </motion.div>

      {/* Mood Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          How are you feeling today?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="font-medium text-gray-700 capitalize">
                {mood.name}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Activities */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-primary-600" size={24} />
            Recommended Activities for {selectedMood}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Finding perfect activities for you...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Heart className="text-white" size={24} />
                    </div>
                    <button
                      onClick={() => logActivity(activity)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {activity.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1" size={16} />
                      {activity.duration}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {activity.benefit}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Call to Action */}
      {!selectedMood && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <Activity className="mx-auto mb-4 text-gray-300" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Select your mood to get started
          </h3>
          <p className="text-gray-500">
            We'll recommend activities that can help improve your mental well-being
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Activities;
