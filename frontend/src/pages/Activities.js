import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import MoodChips from '../components/MoodChips';
import { 
  Activity, 
  Clock, 
  Heart, 
  CheckCircle,
  TrendingUp,
  Play,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [energy, setEnergy] = useState('med');
  const [timeMin, setTimeMin] = useState(10);
  const [context, setContext] = useState('any');
  const [activeActivity, setActiveActivity] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (selectedMood) {
      loadActivities();
    }
  }, [selectedMood, energy, timeMin, context]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await api.activities.getRecommendations({
        mood: selectedMood,
        energy: energy,
        time_min: timeMin,
        context: context
      });
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const startActivity = (activity) => {
    setActiveActivity(activity);
    setTimeLeft(activity.duration_min * 60); // Convert to seconds
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeActivity(activity);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeActivity = async (activity) => {
    try {
      await api.activities.complete(activity.id);
      setActiveActivity(null);
      toast.success('Activity completed! Great job!');
    } catch (error) {
      toast.error('Failed to log activity completion. Please try again.');
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
        <MoodChips onSelect={setSelectedMood} selectedMood={selectedMood} />
        
        {/* Additional Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {/* Time Available */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Available (minutes)</label>
            <input
              type="range"
              min="2"
              max="20"
              value={timeMin}
              onChange={(e) => setTimeMin(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-1">{timeMin} minutes</div>
          </div>
          
          {/* Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="home">Home</option>
              <option value="outside">Outside</option>
              <option value="class">Class/Work</option>
            </select>
          </div>
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
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Activity className="text-white" size={24} />
                    </div>
                    <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      Score: {Math.round(activity.score * 100)}%
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {activity.title}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="mr-1" size={16} />
                      {activity.duration_min} minutes
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      Energy: {activity.energy} • Context: {activity.context.join(', ')}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Steps:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activity.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2">
                          <span className="text-primary-500 text-xs mt-1">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      XP: {activity.xp_reward}
                    </div>
                    
                    {activeActivity?.id === activity.id ? (
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-mono text-primary-600">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startActivity(activity)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
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
