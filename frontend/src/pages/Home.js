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

  const starRef = React.useRef(null);
  const [showDust, setShowDust] = React.useState(false);
  const [showStar, setShowStar] = React.useState(true);

  React.useEffect(() => {
    // Hide the shooting star after animation duration (e.g., 5.2s)
    const timer = setTimeout(() => setShowStar(false), 5200);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (starRef.current) {
      starRef.current.style.animation = 'none';
      void starRef.current.offsetWidth;
      starRef.current.style.animation = '';
      setTimeout(() => setShowDust(true), 2200); // Show dust near end of animation
      setTimeout(() => setShowDust(false), 2600); // Hide dust after animation
      setTimeout(() => setShowStar(false), 2600); // Hide star after animation
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top left, #5a2ea6 0%, #8e44ad 40%, #d76d77 70%, #ffaf7b 100%)' }}>

      
      {/* Galaxy nebula glows (lighter and smoother) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(186,85,211,0.35) 0%, rgba(186,85,211,0) 70%)',
          filter: 'blur(48px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(135,206,250,0.28) 0%, rgba(135,206,250,0) 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(32px)',
        }} />
        {/* Animated stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              borderRadius: '50%',
              background: 'white',
              opacity: Math.random() * 0.6 + 0.2,
              filter: 'blur(0.7px)',
              zIndex: 0,
              animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`,
            }}
          />
        ))}
      </div>
      {/* Galaxy nebula glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(186,85,211,0.5) 0%, rgba(186,85,211,0) 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(135,206,250,0.4) 0%, rgba(135,206,250,0) 70%)',
          filter: 'blur(32px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(24px)',
        }} />
        {/* Animated stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              borderRadius: '50%',
              background: 'white',
              opacity: Math.random() * 0.7 + 0.2,
              filter: 'blur(0.5px)',
              zIndex: 0,
              animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes twinkle {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
      `}</style>
      {/* Shooting Star Animation Above Welcome */}
      {/* Shooting star flies fully across, tail visible and fading, sprinkle dust at far right edge */}
      {/** Only render the SVG while the animation is running */}
      {showStar && (
        <div style={{ position: 'absolute', left: 0, top: '90px', width: '100vw', height: '80px', pointerEvents: 'none', zIndex: 30 }}>
          <svg style={{ width: '100vw', height: '80px', overflow: 'visible', position: 'absolute', left: 0, top: 0 }}>
            <g id="shootingStarGroup">
              {/* Tail - visible, trailing, fading out (shorter tail) */}
              <path id="tail" d="M 0 60 Q 400 20, 1200 40" stroke="url(#tailGradient)" strokeWidth="12" fill="none" opacity="0.7" filter="url(#tailBlur)" />
              {/* Star Head - glowing circle with starburst */}
              <g id="starHead">
                <circle cx="1200" cy="40" r="24" fill="url(#starGlow)" filter="url(#glow)" />
                {/* Starburst */}
                <g>
                  <line x1="1200" y1="22" x2="1200" y2="58" stroke="#fff8b0" strokeWidth="3" opacity="0.7" />
                  <line x1="1182" y1="40" x2="1218" y2="40" stroke="#fff8b0" strokeWidth="3" opacity="0.7" />
                  <line x1="1190" y1="28" x2="1210" y2="52" stroke="#fff8b0" strokeWidth="2" opacity="0.5" />
                  <line x1="1210" y1="28" x2="1190" y2="52" stroke="#fff8b0" strokeWidth="2" opacity="0.5" />
                </g>
                {/* Sparkle */}
                <circle cx="1200" cy="40" r="5" fill="#fff" opacity="0.9" />
              </g>
            </g>
            <defs>
              <linearGradient id="tailGradient" x1="0" y1="60" x2="1200" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff8b0" />
                <stop offset="0.3" stopColor="#FFD700" />
                <stop offset="0.7" stopColor="#FFA500" />
                <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <radialGradient id="starGlow" cx="1200" cy="40" r="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fff8b0" stopOpacity="1" />
                <stop offset="60%" stopColor="#FFD700" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="tailBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
          </svg>
          <style>{`
            @keyframes moveStarGroup {
              0% {
                transform: translateX(-1200px) scale(1) rotate(-8deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              80% {
                transform: translateX(0px) scale(1) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateX(0px) scale(1) rotate(0deg);
                opacity: 0;
              }
            }
            #shootingStarGroup {
              transform-box: fill-box;
              transform-origin: 0px 60px;
              animation: moveStarGroup 5.2s cubic-bezier(0.4,0,0.2,1) 1;
            }
          `}</style>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#111', position: 'relative', zIndex: 20 }}>
          Welcome back, {user?.name}! <span role="img" aria-label="wave">👋</span>
        </h1>
        <p className="text-lg text-gray-600">
        </p>
      </motion.div>
      <style>{`
        .flying-star {
          animation: flyStar 5.2s cubic-bezier(0.4,0,0.2,1) 1;
        }
        @keyframes flyStar {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.7);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          80% {
            opacity: 1;
            transform: translate(calc(100vw - 60px), calc(-70vh - 80px)) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(calc(100vw + 0px), calc(-80vh - 120px)) scale(0.8);
          }
        }
        @keyframes fallDust {
          0% { opacity: 0; transform: translateY(0); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translateY(30px); }
        }
      `}</style>

      {/* Quick Actions Centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 justify-items-center w-full max-w-4xl"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}

              className={`card cursor-pointer group relative w-full flex items-center px-10 py-12 feature-box ${
                action.isNew ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50' : ''
              }`}
              onClick={() => window.location.href = action.path}
            >
              {action.isNew && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </div>
              )}
              <div className="flex items-center w-full">
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mr-6 group-hover:bg-${action.color}-200 transition-colors`}>
                  <Icon className={`text-${action.color}-600`} size={28} />
                </div>
                <div className="flex flex-col items-start w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
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
