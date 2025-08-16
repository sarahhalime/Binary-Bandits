import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { socialAPI } from '../services/api';
import { Map, Users, Activity, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import MapHeatmap from './MapHeatmap';

const MoodHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeView, setActiveView] = useState('map'); // 'map' or 'stats'

  useEffect(() => {
    loadHeatmapData();
    
    // Update every 30 seconds for "real-time" effect
    const interval = setInterval(loadHeatmapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHeatmapData = async () => {
    try {
      const response = await socialAPI.getMoodHeatmap();
      setHeatmapData(response);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      toast.error('Failed to load mood map');
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const moodColors = {
      'happy': '#10B981',     // Green
      'calm': '#6EE7B7',      // Light green
      'neutral': '#9CA3AF',   // Gray
      'anxious': '#F59E0B',   // Orange
      'stressed': '#EF4444',  // Red
      'sad': '#8B5CF6',       // Purple
      'energetic': '#06B6D4'  // Cyan
    };
    return moodColors[mood] || '#9CA3AF';
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'happy': '😊',
      'calm': '😌',
      'neutral': '😐',
      'anxious': '😰',
      'stressed': '😤',
      'sad': '😢',
      'energetic': '⚡'
    };
    return moodEmojis[mood] || '🤔';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading mood map...</p>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No mood data available</p>
        <p className="text-xs text-gray-400 mt-2">Check console for errors</p>
        <button 
          onClick={loadHeatmapData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center mb-2">
          <Map className="mr-2 text-primary-600" size={28} />
          Live Mood Map
        </h2>
        <p className="text-gray-600 mb-4">
          Real-time anonymous mood data from your community
        </p>
        
        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-1 border border-white/30">
            <button
              onClick={() => setActiveView('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'map'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Map className="inline mr-2" size={16} />
              Map View
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'stats'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="inline mr-2" size={16} />
              Stats View
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      {activeView === 'map' && heatmapData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <MapHeatmap moodData={heatmapData} />
        </motion.div>
      )}

      {/* Stats View */}
      {activeView === 'stats' && (
        <>
          {/* Stats Summary */}
          {heatmapData?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-primary-600 mr-1" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {heatmapData.summary.total_users}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="text-secondary-600 mr-1" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {heatmapData.summary.total_points}
              </div>
              <div className="text-sm text-gray-600">Mood Points</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Map className="text-green-600 mr-1" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {heatmapData.summary.coverage_area}
              </div>
              <div className="text-sm text-gray-600">Coverage</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-blue-600 mr-1" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {lastUpdated ? formatTimestamp(lastUpdated) : 'Now'}
              </div>
              <div className="text-sm text-gray-600">Last Update</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Breakdown */}
      {heatmapData?.summary?.mood_breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Mood Right Now</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(heatmapData.summary.mood_breakdown).map(([mood, count]) => (
              <div
                key={mood}
                className="flex items-center justify-between p-3 rounded-lg border border-white/30"
                style={{
                  background: `linear-gradient(135deg, ${getMoodColor(mood)}20, ${getMoodColor(mood)}10)`
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMoodEmoji(mood)}</span>
                  <span className="font-medium text-gray-800 capitalize">{mood}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: getMoodColor(mood) }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Simple Mood Points Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Hotspots</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {heatmapData?.mood_points?.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getMoodColor(point.mood) }}
                ></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getMoodEmoji(point.mood)}</span>
                    <span className="font-medium capitalize">{point.mood}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{point.count} users</div>
                <div className="text-xs text-gray-500">
                  {Math.round(point.intensity * 100)}% intensity
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

        </>
      )}
    </div>
  );
};

export default MoodHeatmap; 