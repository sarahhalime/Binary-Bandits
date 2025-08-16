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
    {
      title: "Mood Tracker",
      description: "Track your daily emotions and see patterns over time",
      icon: Heart,
      path: "/",
      gradient: "from-pink-500 to-rose-500",
      iconColor: "text-pink-500"
    },
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
    {
      title: "Activities",
      description: "Find mindful activities to boost your mood",
      icon: Activity,
      path: "/activities",
      gradient: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-500"
    },
    {
      title: "Social",
      description: "Connect with friends and share your journey",
      icon: Users,
      path: "/social",
      gradient: "from-orange-500 to-amber-500",
      iconColor: "text-orange-500"
    },
    {
      title: "Profile",
      description: "View your progress and customize your experience",
      icon: User,
      path: "/profile",
      gradient: "from-slate-500 to-gray-500",
      iconColor: "text-slate-500"
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Features */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-display font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                Explore Features
              </h2>
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
            <XPLevelSystem />

            {/* Daily Challenge */}
            <DailyChallenge />

            {/* Stats Chart */}
            <StatsChart />

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Achievements
              </h3>
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

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;
