import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  path,
  gradient,
  iconColor,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ 
        scale: 1.03,
        y: -6,
        transition: { duration: 0.3 }
      }}
      className="group relative"
    >
      <Link to={path} className="block">
        <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/60 transition-all duration-500 hover:shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pattern opacity-10" />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className={`relative z-10 inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 mb-6 group-hover:shadow-xl transition-all duration-300 shadow-lg`}
          >
            <Icon className={`w-9 h-9 ${iconColor} transition-all duration-300 group-hover:scale-110`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 font-body">
              {description}
            </p>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/40 transition-all duration-500" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <motion.div
              animate={{ 
                x: [0, 15, 0],
                y: [0, -15, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                delay: delay * 0.3
              }}
              className="absolute top-4 right-4 w-1.5 h-1.5 bg-slate-300/40 rounded-full"
            />
            <motion.div
              animate={{ 
                x: [0, -12, 0],
                y: [0, 12, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                delay: delay * 0.2
              }}
              className="absolute bottom-6 left-6 w-1 h-1 bg-slate-400/50 rounded-full"
            />
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Mesh Pattern Overlay */}
          <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        </div>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
