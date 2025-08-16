import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Coffee, Heart, Target, TrendingUp, Sparkles } from 'lucide-react';

const WelcomeHeader = () => {
  const { user } = useAuth();
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Rise & Shine' : currentHour < 17 ? 'Afternoon Vibes' : 'Evening Flow';
  const greetingIcon = currentHour < 12 ? Sun : currentHour < 17 ? Coffee : Moon;

  const motivationalQuotes = [
    "Small steps, big impact ✨",
    "You've got this! 💪",
    "Today is your day 🌟",
    "Breathe, believe, achieve 🫁",
    "Progress over perfection 🎯"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const stats = [
    { label: 'Day Streak', value: '7', icon: Target, color: 'text-orange-500', subtitle: 'Keep it up!' },
    { label: 'Mood Score', value: '8.5', icon: Heart, color: 'text-pink-500', subtitle: 'Feeling good' },
    { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-emerald-500', subtitle: 'This week' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto px-6 py-8"
    >
      <div className="bg-gradient-to-br from-white/85 to-slate-50/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Welcome Section */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="p-4 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-2xl shadow-xl"
              >
                <greetingIcon className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-display font-bold text-gradient-alt mb-2">
                  {greeting}, {user?.name?.split(' ')[0] || 'Friend'}!
                </h1>
                <p className="text-lg font-body text-slate-600">{randomQuote}</p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-indigo-100"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <p className="text-indigo-800 font-medium font-body">
                  Today's focus: Embrace the present moment and find joy in the little things
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-4 shadow-md`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl font-display font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-sm font-body text-slate-600 font-medium">{stat.label}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.subtitle}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;
