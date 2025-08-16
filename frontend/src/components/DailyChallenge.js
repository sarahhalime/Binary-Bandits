import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, Clock, Star, Sparkles } from 'lucide-react';

const DailyChallenge = () => {
  const [completed, setCompleted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const challenge = {
    title: "Mindful Breathing",
    description: "Take 5 deep breaths and focus on the present moment",
    duration: "2 minutes",
    reward: 50,
    category: "Mindfulness",
    steps: [
      "Find a comfortable position",
      "Close your eyes gently",
      "Take a deep breath in for 4 counts",
      "Hold for 4 counts",
      "Exhale slowly for 6 counts",
      "Repeat 5 times"
    ]
  };

  const handleComplete = () => {
    setCompleted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg"
          >
            <Target className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800">Daily Challenge</h2>
            <p className="text-slate-600 font-body">Complete today's mindfulness task</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-slate-800">{challenge.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{challenge.duration}</span>
          </div>
        </div>
        
        <p className="text-slate-700 mb-4 font-body">{challenge.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 font-body">Reward:</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-slate-800">+{challenge.reward} XP</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            disabled={completed}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
              completed
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            {completed ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Completed!</span>
              </div>
            ) : (
              <span>Start Challenge</span>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
          >
            <h4 className="font-semibold text-slate-800 mb-4 font-display">How to complete:</h4>
            <div className="space-y-3">
              {challenge.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-slate-700 font-body">{step}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100"
            >
              <p className="text-sm text-green-800 font-medium font-body">
                💡 Tip: Find a quiet space and set a timer for the best experience
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyChallenge;
