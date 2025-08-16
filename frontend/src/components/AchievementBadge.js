import React from 'react';
import { motion } from 'framer-motion';

const AchievementBadge = ({
  title,
  description,
  icon: Icon,
  unlocked,
  progress = 0,
  maxProgress = 1,
  rarity = 'common',
  delay = 0
}) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-500',
    epic: 'from-purple-400 to-purple-500',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityGlow = {
    common: 'shadow-gray-400/20',
    rare: 'shadow-blue-400/30',
    epic: 'shadow-purple-400/40',
    legendary: 'shadow-yellow-400/50'
  };

  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className={`relative group ${
        unlocked ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className={`relative bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30 transition-all duration-500 ${
        unlocked ? 'hover:shadow-3xl' : ''
      }`}>
        {/* Badge Icon */}
        <div className="flex justify-center mb-4">
          <motion.div
            whileHover={unlocked ? { rotate: 360, scale: 1.1 } : {}}
            transition={{ duration: 0.6 }}
            className={`relative p-4 rounded-2xl shadow-lg ${
              unlocked 
                ? `bg-gradient-to-br ${rarityColors[rarity]} ${rarityGlow[rarity]}`
                : 'bg-gradient-to-br from-gray-300 to-gray-400'
            }`}
          >
            <Icon className={`w-8 h-8 ${
              unlocked ? 'text-white' : 'text-gray-500'
            }`} />
            
            {/* Rarity Indicator */}
            {unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${rarityColors[rarity]}`} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className={`text-lg font-bold mb-2 font-display ${
            unlocked ? 'text-slate-800' : 'text-slate-500'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mb-4 font-body ${
            unlocked ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {description}
          </p>

          {/* Progress Bar */}
          {!unlocked && maxProgress > 1 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{progress} / {maxProgress}</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            unlocked 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {unlocked ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                Unlocked
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                Locked
              </>
            )}
          </div>
        </div>

        {/* Rarity Label */}
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute top-3 right-3"
          >
            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white uppercase tracking-wide`}>
              {rarity}
            </span>
          </motion.div>
        )}

        {/* Hover Effects */}
        {unlocked && (
          <>
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}

        {/* Floating Particles */}
        {unlocked && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <motion.div
              animate={{ 
                x: [0, 20, 0],
                y: [0, -20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: delay * 0.5
              }}
              className="absolute top-2 right-2 w-1 h-1 bg-white/40 rounded-full"
            />
            <motion.div
              animate={{ 
                x: [0, -15, 0],
                y: [0, 15, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                delay: delay * 0.3
              }}
              className="absolute bottom-4 left-4 w-1 h-1 bg-white/30 rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;
