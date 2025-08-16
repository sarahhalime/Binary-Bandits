import React from 'react';
import { motion } from 'framer-motion';
import MoodHeatmap from '../components/MoodHeatmap';
import { Map, TrendingUp, Users, Heart } from 'lucide-react';

const MoodMap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Map className="text-white" size={32} />
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Mood Map
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore the collective emotional landscape of your community in real-time
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Real-Time Data</h3>
            <p className="text-slate-600 text-sm">Live updates every 30 seconds showing current mood trends</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Community Insights</h3>
            <p className="text-slate-600 text-sm">Anonymous data from your social network and beyond</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Empathy Building</h3>
            <p className="text-slate-600 text-sm">Understand how others feel and offer support where needed</p>
          </div>
        </motion.div>

        {/* Main Mood Heatmap Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40"
        >
          <MoodHeatmap />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-8 border border-emerald-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">How it Works</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">🌍 Geographic Visualization</h3>
                <p className="text-slate-600 text-sm">
                  See mood patterns across different locations, helping you understand regional emotional trends and identify areas that might need more support.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">📊 Anonymous & Safe</h3>
                <p className="text-slate-600 text-sm">
                  All data is completely anonymous and aggregated to protect privacy while still providing valuable insights into community wellbeing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MoodMap;
