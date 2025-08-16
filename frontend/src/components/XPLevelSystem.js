import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Zap, Target } from 'lucide-react';

const XPLevelSystem = () => {
  const currentXP = 1250;
  const xpForNextLevel = 2000;
  const currentLevel = 5;
  const progress = (currentXP / xpForNextLevel) * 100;

  const achievements = [
    { name: 'First Entry', icon: Star, completed: true, xp: 50 },
    { name: '7 Day Streak', icon: Zap, completed: true, xp: 100 },
    { name: 'Mood Master', icon: Target, completed: false, xp: 200 },
    { name: 'Journal Pro', icon: Trophy, completed: false, xp: 150 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Level {currentLevel}</h2>
          <p className="text-slate-600 font-body">Keep going! You're doing great!</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-600 font-body">Progress to Level {currentLevel + 1}</span>
          <span className="text-sm font-bold text-slate-800">{currentXP} / {xpForNextLevel} XP</span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Level {currentLevel}</span>
          <span>Level {currentLevel + 1}</span>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 font-display">Recent Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                achievement.completed 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                achievement.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <achievement.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  achievement.completed ? 'text-green-800' : 'text-gray-600'
                } font-body`}>
                  {achievement.name}
                </p>
                <p className="text-xs text-gray-500">+{achievement.xp} XP</p>
              </div>
              {achievement.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 * index }}
                  className="text-green-500"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 font-body">
            Next Milestone: Complete 10 journal entries (+100 XP)
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default XPLevelSystem;
