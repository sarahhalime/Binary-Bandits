import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Home, 
  Music, 
  BookOpen, 
  Activity, 
  Users, 
  User, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/activities', icon: Activity, label: 'Activities' },
    { path: '/social', icon: Users, label: 'Social' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-display font-bold text-gradient">Mindful Harmony</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50 shadow-md' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={18} />
                    <span className="font-body">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-medium text-sm font-body">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 font-body">{user?.name}</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
              title="Logout"
            >
              <LogOut size={18} />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/40 shadow-lg"
        >
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50 shadow-md' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-body">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex items-center space-x-3 px-4 py-3">
                {user?.profile_pic ? (
                  <img 
                    src={user.profile_pic} 
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-medium text-sm font-body">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 font-body">{user?.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
              >
                <LogOut size={20} />
                <span className="font-body">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
