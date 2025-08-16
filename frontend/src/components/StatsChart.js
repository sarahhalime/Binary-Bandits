import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';

const StatsChart = () => {
  const moodData = [
    { day: 'Mon', mood: 8, color: 'bg-green-400' },
    { day: 'Tue', mood: 6, color: 'bg-yellow-400' },
    { day: 'Wed', mood: 9, color: 'bg-green-400' },
    { day: 'Thu', mood: 7, color: 'bg-blue-400' },
    { day: 'Fri', mood: 8, color: 'bg-green-400' },
    { day: 'Sat', mood: 9, color: 'bg-green-400' },
    { day: 'Sun', mood: 8, color: 'bg-green-400' },
  ];

  const stats = [
    { label: 'Weekly Average', value: '7.9', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Entries This Week', value: '7', icon: Calendar, color: 'text-blue-500' },
    { label: 'Best Day', value: 'Wednesday', icon: BarChart3, color: 'text-purple-500' },
    { label: 'Streak', value: '7 days', icon: Activity, color: 'text-orange-500' },
  ];

  const maxMood = 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-green-50/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Your Mood Stats</h2>
          <p className="text-slate-600 font-body">Track your emotional journey</p>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 font-display">This Week's Mood</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {moodData.map((data, index) => (
            <motion.div
              key={data.day}
              initial={{ height: 0 }}
              animate={{ height: `${(data.mood / maxMood) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="relative w-full bg-gray-200 rounded-t-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                  className={`h-full ${data.color} relative`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
                </motion.div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-slate-800">{data.mood}</div>
                <div className="text-xs text-slate-500">{data.day}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 * index }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gray-100`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-600 font-body">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 font-body">Mood Consistency</span>
            <span className="text-sm font-bold text-slate-800">85%</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 font-body">Goal Progress</span>
            <span className="text-sm font-bold text-slate-800">70%</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-100"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 font-body">
            Great progress! Your mood has improved by 15% this week compared to last week.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsChart;
