import React from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  BookOpen, 
  Activity, 
  Users, 
  User, 
  Heart,
  Brain,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import WelcomeHeader from '../components/WelcomeHeader';
import FeatureCard from '../components/FeatureCard';
import XPLevelSystem from '../components/XPLevelSystem';
import DailyChallenge from '../components/DailyChallenge';
import StatsChart from '../components/StatsChart';
import AchievementBadge from '../components/AchievementBadge';
import FloatingActionButton from '../components/FloatingActionButton';

const Dashboard = () => {
  const featureCards = [
  // Removed Mood Tracker card from Dashboard
    {
      title: "Journal",
      description: "Write your thoughts and get AI-powered insights",
      icon: BookOpen,
      path: "/journal",
      gradient: "from-blue-500 to-indigo-500",
      iconColor: "text-blue-500"
    },
    {
      title: "Music Therapy",
      description: "Discover mood-lifting playlists and calming sounds",
      icon: Music,
      path: "/music",
      gradient: "from-purple-500 to-violet-500",
      iconColor: "text-purple-500"
    },
  // Removed Activities card from Dashboard
  // Removed Social card from Dashboard
  // Removed Profile card from Dashboard
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first mood entry",
      icon: Target,
      unlocked: true,
      rarity: "common"
    },
    {
      title: "Week Warrior",
      description: "Track your mood for 7 days straight",
      icon: Zap,
      unlocked: true,
      rarity: "rare"
    },
    {
      title: "Mindful Master",
      description: "Complete 10 journal entries",
      icon: Brain,
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      rarity: "epic"
    },
    {
      title: "Zen Explorer",
      description: "Try 5 different activities",
      icon: Sparkles,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      rarity: "legendary"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"
        />
        
        {/* Mesh Pattern */}
        <div className="absolute inset-0 bg-mesh opacity-30" />
        
        {/* Radial Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-pattern" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Welcome Header */}
<<<<<<< HEAD
// ...existing code...
        <WelcomeHeader />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// ...existing code...
            <WelcomeHeader />
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
              {/* Mood selector and current mood card only on Home.js */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// ...existing code...
=======
            <WelcomeHeader />
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
              {/* Removed 'How are you feeling today?' text and empty text box */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
>>>>>>> 56713678596f2da350c421a604f492dbf3bf5c6e
            {/* Left Column - Features */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="relative">
                  <h2 className="text-3xl font-display font-bold text-gradient mb-6 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    Explore Features
                  </h2>
                  <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featureCards.map((card, index) => (
                    <FeatureCard
                      key={card.title}
                      {...card}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats & Progress */}
            <div className="space-y-8">
              {/* XP Level System */}
              <div className="relative">
                <XPLevelSystem />
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl" />
              </div>

              {/* Daily Challenge */}
              <div className="relative">
                <DailyChallenge />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
              </div>

              {/* Stats Chart */}
              <div className="relative">
                <StatsChart />
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl" />
              </div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="relative">
                  <h3 className="text-2xl font-display font-bold text-gradient-gold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    Achievements
                  </h3>
                  <div className="absolute -top-1 -left-1 w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <AchievementBadge
                      key={achievement.title}
                      {...achievement}
                      delay={0.5 + index * 0.1}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
