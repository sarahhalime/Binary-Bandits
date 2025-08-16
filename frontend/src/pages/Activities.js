import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  Brain, 
  MessageSquare, 
  ArrowLeft, 
  Play, 
  Pause, 
  RefreshCw,
  Clock, 
  Sparkles,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Activities = () => {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showGenie, setShowGenie] = useState(true);
  const [genieMessage, setGenieMessage] = useState(`Welcome back, ${user?.name || 'friend'}! I'm your wellness genie, here to guide you through healing activities. Choose what speaks to your soul today.`);
  const [isGenieAnimating, setIsGenieAnimating] = useState(false);

  const activities = [
    {
      id: 'breathing',
      title: 'Guided Breathing',
      description: 'Find your calm with immersive breathing exercises',
      icon: Wind,
      color: 'from-blue-400 to-cyan-500',
      available: true,
      duration: '2-10 minutes'
    },
    {
      id: 'meditation',
      title: 'Mindfulness Meditation',
      description: 'Ground yourself in the present moment',
      icon: Brain,
      color: 'from-purple-400 to-indigo-500',
      available: true,
      duration: '3-7 minutes'
    },
    {
      id: 'reframing',
      title: 'Cognitive Reframing',
      description: 'Transform negative thoughts into balanced perspectives',
      icon: MessageSquare,
      color: 'from-green-400 to-emerald-500',
      available: true,
      duration: '5-15 minutes'
    }
  ];

  // Genie's enticing messages
  const genieQuotes = [
    "✨ Your inner peace awaits, dear seeker! Which magical journey calls to your spirit today?",
    "🌟 I sense great potential within you! Let my ancient wisdom guide you to tranquility...",
    "🧞‍♂️ Ah, a soul yearning for balance! Choose your path and I shall weave wellness into your being!",
    "💫 The cosmos whispers of your need for calm... Allow me to grant your wish for serenity!",
    "🌙 Three magical doors await you, each leading to inner harmony. Which shall we unlock together?",
    "⭐ Your stress shall vanish like smoke from my lamp! Pick an activity and witness the magic unfold!",
    "🔮 I see restlessness in your aura... Let's transform it into pure, radiant peace! Choose wisely!",
    "🌺 Like a lotus blooming in still water, your mind can find perfect calm. Shall we begin the enchantment?",
    "🕯️ The flames of tranquility dance before you! Which sacred practice will ignite your inner light?",
    "🎭 Behind the mask of daily stress lies your true, peaceful self. Let's reveal it together!",
    "🌈 Rainbow bridges to wellness stretch before us! Which colorful path shall your spirit walk today?",
    "🦋 Like a butterfly emerging from its cocoon, your inner calm awaits transformation!"
  ];

  const handleGenieClick = () => {
    if (isGenieAnimating) return; // Prevent multiple clicks during animation
    
    setIsGenieAnimating(true);
    const randomQuote = genieQuotes[Math.floor(Math.random() * genieQuotes.length)];
    setGenieMessage(randomQuote);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsGenieAnimating(false);
    }, 1000);
  };

  const GenieCharacter = ({ message, isTyping = false }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Magical Aura Background */}
      <div className="absolute inset-0 -m-32">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full bg-gradient-to-r from-purple-400/40 via-blue-500/40 to-cyan-400/40 rounded-full blur-3xl"
        />
      </div>

      {/* Secondary Glow Layer */}
      <div className="absolute inset-0 -m-24">
        <motion.div
          animate={{
            scale: [1.1, 1.3, 1.1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="w-full h-full bg-gradient-to-r from-yellow-300/30 via-orange-400/30 to-red-400/30 rounded-full blur-2xl"
        />
      </div>

      {/* Floating Genie Image */}
      <div className="relative w-80 h-80 mx-auto mb-8">
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 3, -3, 0],
            scale: isGenieAnimating ? [1, 1.15, 1] : [1, 1.02, 1]
          }}
          transition={{ 
            duration: isGenieAnimating ? 1 : 6, 
            repeat: isGenieAnimating ? 1 : Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
          onClick={handleGenieClick}
          className="relative w-full h-full cursor-pointer"
        >
          {/* Main Genie Image */}
          <motion.img
            src="/images/genie.webp"
            alt="Wellness Genie"
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={{
              filter: isGenieAnimating ? [
                "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))",
                "drop-shadow(0 0 60px rgba(255, 215, 0, 0.9))",
                "drop-shadow(0 0 40px rgba(255, 105, 180, 0.7))",
                "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))"
              ] : [
                "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))",
                "drop-shadow(0 0 40px rgba(59, 130, 246, 0.7))",
                "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))"
              ]
            }}
            transition={{
              duration: isGenieAnimating ? 1 : 4,
              repeat: isGenieAnimating ? 1 : Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Magical Glow Ring */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 border-2 border-purple-400/40 rounded-full"
            style={{ borderStyle: 'dashed' }}
          />

          {/* Counter-rotating Ring */}
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.05, 1.15, 1.05]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 border border-blue-400/30 rounded-full m-8"
            style={{ borderStyle: 'dotted' }}
          />
        </motion.div>
        
        {/* Enhanced Floating sparkles and magic */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: i % 3 === 0 
                ? 'linear-gradient(45deg, #FFD700, #FFA500)' 
                : i % 3 === 1
                ? 'linear-gradient(45deg, #00BFFF, #1E90FF)'
                : 'linear-gradient(45deg, #8B5CF6, #A855F7)',
              left: `${50}%`,
              top: `${50}%`
            }}
            animate={{
              x: isGenieAnimating ? 
                [0, 120 * Math.cos((i * 30) * Math.PI / 180), 0] :
                [0, 60 * Math.cos((i * 30) * Math.PI / 180), -60 * Math.cos((i * 30) * Math.PI / 180), 0],
              y: isGenieAnimating ?
                [0, -120 * Math.sin((i * 30) * Math.PI / 180), 0] :
                [0, -60 * Math.sin((i * 30) * Math.PI / 180), 60 * Math.sin((i * 30) * Math.PI / 180), 0],
              opacity: isGenieAnimating ? [0, 1, 0] : [0, 1, 0],
              scale: isGenieAnimating ? [0.3, 2, 0.3] : [0.3, 1.2, 0.3]
            }}
            transition={{
              duration: isGenieAnimating ? 1 : 5,
              repeat: isGenieAnimating ? 1 : Infinity,
              delay: i * (isGenieAnimating ? 0.05 : 0.3),
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Click Burst Effect */}
        {isGenieAnimating && [...Array(8)].map((_, i) => (
          <motion.div
            key={`burst-${i}`}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            style={{
              left: `${50}%`,
              top: `${50}%`
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              x: [0, 150 * Math.cos((i * 45) * Math.PI / 180)],
              y: [0, 150 * Math.sin((i * 45) * Math.PI / 180)],
              opacity: [1, 0.8, 0]
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Mystical Energy Trails */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`trail-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-transparent rounded-full"
            style={{
              left: `${50}%`,
              top: `${50}%`
            }}
            animate={{
              x: [0, 100 * Math.cos((i * 60) * Math.PI / 180)],
              y: [0, 100 * Math.sin((i * 60) * Math.PI / 180)],
              opacity: [0.8, 0],
              scale: [1, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Floating Magical Orbs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-6 h-6 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full opacity-70"
            animate={{
              x: [0, 80, 0, -80, 0],
              y: [0, -40, -80, -40, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
            style={{
              left: `${30 + i * 15}%`,
              top: `${40 + (i % 2) * 20}%`
            }}
          />
        ))}
      </div>

      {/* Enhanced Message Bubble */}
      <motion.div
        key={message} // Re-animate when message changes
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: isGenieAnimating ? [0.8, 1.05, 1] : 1,
          boxShadow: isGenieAnimating ? [
            "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            "0 25px 50px -12px rgba(139, 92, 246, 0.4)",
            "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          ] : "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        transition={{ 
          delay: 0.5, 
          duration: isGenieAnimating ? 1 : 0.6,
          ease: "easeOut"
        }}
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-purple-200/50 max-w-lg mx-auto"
      >
        {/* Message Bubble Tail */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/95 border-l-2 border-t-2 border-purple-200/50 rotate-45" />
        
        <motion.p 
          key={message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-slate-800 text-center leading-relaxed text-lg font-medium"
        >
          {message}
          {isGenieAnimating && <motion.span 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-purple-600"
          > ✨</motion.span>}
        </motion.p>

        {/* Magical sparkles around bubble */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"
            animate={{
              y: isGenieAnimating ? [0, -25, 0] : [0, -15, 0],
              opacity: [0.7, 1, 0.7],
              scale: isGenieAnimating ? [0.8, 2, 0.8] : [0.8, 1.4, 0.8]
            }}
            transition={{
              duration: isGenieAnimating ? 1 : 2.5,
              repeat: isGenieAnimating ? 1 : Infinity,
              delay: i * 0.4
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${-5 + (i % 2) * 110}%`
            }}
          />
        ))}

        {/* Extra magical effects when clicked */}
        {isGenieAnimating && [...Array(4)].map((_, i) => (
          <motion.div
            key={`bubble-magic-${i}`}
            className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [1, 0.6, 0],
              x: [0, (i % 2 ? 40 : -40)],
              y: [0, (i < 2 ? -30 : 30)]
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
              delay: i * 0.1
            }}
            style={{
              left: '50%',
              top: '50%'
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );

  const ActivityCard = ({ activity, onClick }) => {
    const Icon = activity.icon;

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => activity.available && onClick(activity)}
        className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
          activity.available 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl border border-white/40' 
            : 'bg-gray-100/80 backdrop-blur-xl border border-gray-200 opacity-60 cursor-not-allowed'
        }`}
      >
        {!activity.available && (
          <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Coming Soon
          </div>
        )}
        
        <div className="flex items-start space-x-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{activity.title}</h3>
            <p className="text-slate-600 text-sm mb-3">{activity.description}</p>
            <div className="flex items-center text-slate-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{activity.duration}</span>
            </div>
              </div>
        </div>
      </motion.div>
    );
  };

  const renderActivity = () => {
    switch (selectedActivity?.id) {
      case 'breathing':
        return <BreathingExercise onBack={() => setSelectedActivity(null)} />;
      case 'meditation':
        return <MindfulnessMeditation onBack={() => setSelectedActivity(null)} />;
      case 'reframing':
        return <CognitiveReframing onBack={() => setSelectedActivity(null)} />;
      default:
        return null;
    }
  };

  if (selectedActivity) {
    return renderActivity();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Genie Introduction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <GenieCharacter 
            message={genieMessage}
            isTyping={isGenieAnimating}
          />
      </motion.div>

                {/* Activities Grid - Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
        >
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2 }}
              className="flex justify-center h-full"
            >
              <div className="w-full max-w-sm h-full">
                <ActivityCard 
                  activity={activity} 
                  onClick={setSelectedActivity}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 text-lg">
            ✨ Each activity is designed to help you find peace and balance
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Breathing Exercise Component
const BreathingExercise = ({ onBack }) => {
  const [duration, setDuration] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // 'inhale', 'hold', 'exhale'
  const [cycleCount, setCycleCount] = useState(0);

  const durations = [
    { value: 120, label: '2 minutes', cycles: 16 },
    { value: 300, label: '5 minutes', cycles: 40 },
    { value: 600, label: '10 minutes', cycles: 80 }
  ];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      const phaseInterval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          if (prev === 'exhale') {
            setCycleCount(count => count + 1);
            return 'inhale';
          }
        });
      }, 4000); // 4 seconds per phase

      return () => clearInterval(phaseInterval);
    }
  }, [isActive]);

  const startExercise = (selectedDuration) => {
    setDuration(selectedDuration);
    setTimeLeft(selectedDuration.value);
    setIsActive(true);
    setCycleCount(0);
    setBreathingPhase('inhale');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!duration) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Activities</span>
          </motion.button>

          <div className="text-center mb-12">
      <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Wind className="w-12 h-12 text-white" />
      </motion.div>

            <h1 className="text-3xl font-bold text-slate-800 mb-4">Guided Breathing</h1>
            <p className="text-slate-600 text-lg">
              Choose your session duration to begin this calming breathing exercise
            </p>
          </div>

          <div className="space-y-4">
            {durations.map((dur, index) => (
              <motion.button
                key={dur.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => startExercise(dur)}
                className="w-full p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl border border-white/40 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {dur.label}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {dur.cycles} breathing cycles
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
      <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 0.4
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Control Panel */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit</span>
        </button>
        
        <div className="text-white/80 text-lg font-medium">
          {formatTime(timeLeft)}
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isActive ? 'Pause' : 'Resume'}</span>
        </button>
      </div>

      {/* Main Breathing Circle */}
      <div className="text-center">
        <motion.div
          animate={{
            scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'exhale' ? 0.8 : 1.2,
            backgroundColor: breathingPhase === 'inhale' ? '#3B82F6' : breathingPhase === 'exhale' ? '#10B981' : '#8B5CF6'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-64 h-64 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-8"
        >
          <div className="text-white text-center">
            <div className="text-2xl font-light mb-2">
              {breathingPhase === 'inhale' && 'Breathe In'}
              {breathingPhase === 'hold' && 'Hold'}
              {breathingPhase === 'exhale' && 'Breathe Out'}
            </div>
            <div className="text-4xl font-bold">
              {breathingPhase === 'inhale' && '4'}
              {breathingPhase === 'hold' && '4'}
              {breathingPhase === 'exhale' && '4'}
            </div>
          </div>
        </motion.div>

        <div className="text-white/80 text-lg">
          Cycle {cycleCount} of {duration.cycles}
        </div>
      </div>
    </div>
  );
};

// Mindfulness Meditation Component
const MindfulnessMeditation = ({ onBack }) => {
  const [duration, setDuration] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const durations = [
    { value: 180, label: '3 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 420, label: '7 minutes' }
  ];

  const prompts = [
    "Notice your breathing... Feel each breath naturally flowing in and out",
    "Observe any thoughts that arise... Let them pass like clouds in the sky",
    "Feel your body relaxing... Release any tension you're holding",
    "Be present in this moment... There's nowhere else you need to be",
    "Notice sounds around you... Accept them without judgment",
    "Return to your breath... Your anchor in this peaceful moment"
  ];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      const promptInterval = setInterval(() => {
        setCurrentPrompt(prev => (prev + 1) % prompts.length);
      }, 30000); // Change prompt every 30 seconds

      return () => clearInterval(promptInterval);
    }
  }, [isActive, prompts.length]);

  const startMeditation = (selectedDuration) => {
    setDuration(selectedDuration);
    setTimeLeft(selectedDuration.value);
    setIsActive(true);
    setCurrentPrompt(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!duration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Activities</span>
          </motion.button>

          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Mindfulness Meditation</h1>
            <p className="text-slate-600 text-lg">
              Ground yourself in the present moment with guided meditation
            </p>
          </div>

          <div className="space-y-4">
            {durations.map((dur, index) => (
              <motion.button
                key={dur.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => startMeditation(dur)}
                className="w-full p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl border border-white/40 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                      {dur.label}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Guided mindfulness session
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Play className="w-6 h-6 text-purple-600 ml-1" />
                  </div>
              </div>
            </motion.button>
          ))}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {/* Morphing Background Patterns */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${50 + i * 30}px`,
              height: `${50 + i * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? 'linear-gradient(45deg, #8B5CF6, #A855F7)' : 
                         i % 3 === 1 ? 'linear-gradient(45deg, #3B82F6, #6366F1)' : 
                         'linear-gradient(45deg, #06B6D4, #0EA5E9)'
            }}
            animate={{
              scale: [1, 1.5, 0.8, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Control Panel */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit</span>
        </button>
        
        <div className="text-white/80 text-lg font-medium">
          {formatTime(timeLeft)}
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isActive ? 'Pause' : 'Resume'}</span>
        </button>
      </div>

      {/* Central Focus Point */}
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-12 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-white/30"
          />
      </motion.div>

        <motion.div
          key={currentPrompt}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl mx-auto px-8"
        >
          <p className="text-white text-xl font-light leading-relaxed text-center">
            {prompts[currentPrompt]}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Cognitive Reframing Component
const CognitiveReframing = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [thought, setThought] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const reframingQuestions = [
    "Is this thought absolutely true?",
    "What evidence supports or contradicts this thought?",
    "How might someone else view this situation?",
    "What would you tell a friend in this situation?",
    "What's a more balanced way to think about this?"
  ];

  const handleReframe = () => {
    if (!thought.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const positiveFrames = [
        `Instead of "${thought}", consider: "This is a challenge I can learn from."`,
        `Rather than "${thought}", try: "This difficulty is temporary and I have tools to handle it."`,
        `Transform "${thought}" into: "I've overcome challenges before and I can do it again."`,
        `Reframe "${thought}" as: "This situation offers an opportunity for growth."`,
        `Change "${thought}" to: "I have the strength to navigate this step by step."`
      ];
      
      const randomFrame = positiveFrames[Math.floor(Math.random() * positiveFrames.length)];
      setReframedThought(randomFrame);
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  const resetExercise = () => {
    setStep(1);
    setThought('');
    setReframedThought('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Activities</span>
        </motion.button>

        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <MessageSquare className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Cognitive Reframing</h1>
          <p className="text-slate-600 text-lg">
            Transform negative thoughts into balanced perspectives
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= num ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 transition-colors ${
                    step > num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/40">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
                  What's weighing on your mind?
                </h2>
                
                <div className="relative mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -left-4 w-8 h-8 bg-red-400/30 rounded-full"
                  />
                  
                  <textarea
                    value={thought}
                    onChange={(e) => setThought(e.target.value)}
                    placeholder="Express your worry, negative thought, or concern here..."
                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none resize-none text-slate-700 placeholder-slate-400"
                    maxLength={500}
                  />
                  
                  <div className="text-right text-sm text-slate-400 mt-2">
                    {thought.length}/500
                  </div>
                </div>

                <button
                  onClick={() => thought.trim() && setStep(2)}
                  disabled={!thought.trim()}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Reflection
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/40 mb-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
                  Let's examine this thought together
          </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                  <p className="text-slate-700 italic">"{thought}"</p>
            </div>

                <div className="space-y-6">
                  <p className="text-slate-600 text-center mb-8">
                    Consider these questions to gain a new perspective:
                  </p>
                  
                  {reframingQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 font-medium">{question}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReframe}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Generate Reframe'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/40">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                    Your Transformed Perspective
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <h3 className="font-semibold text-red-800 mb-2">Original Thought:</h3>
                    <p className="text-red-700 italic">"{thought}"</p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-green-50 rounded-lg border-l-4 border-green-400"
                  >
                    <h3 className="font-semibold text-green-800 mb-2">Reframed Thought:</h3>
                    <p className="text-green-700 font-medium">{reframedThought}</p>
                  </motion.div>
                    </div>

                <div className="text-center mt-8">
                  <p className="text-slate-600 mb-6">
                    Practice this new perspective and notice how it feels different
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={resetExercise}
                      className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-600 transition-all duration-300"
                    >
                      Try Another Thought
                    </button>
                    <button
                      onClick={onBack}
                      className="flex-1 bg-gray-200 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back to Activities
                    </button>
                  </div>
                    </div>
                  </div>
                </motion.div>
          )}
        </AnimatePresence>

        {/* Floating thought bubbles animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
        <motion.div
              key={i}
              className="absolute w-16 h-16 bg-white/20 rounded-full"
              animate={{
                y: [100, -100],
                x: [0, Math.sin(i) * 100],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 1.5
              }}
              style={{
                left: `${10 + i * 20}%`,
                bottom: '-100px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;