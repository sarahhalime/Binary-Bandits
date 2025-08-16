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
  Sparkles,
  Settings,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/activities', icon: Activity, label: 'Activities' },
    { path: '/social', icon: Users, label: 'Social' },
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

          {/* User Profile Dropdown */}
          <div className="hidden md:flex items-center relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-300"
            >
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
              <ChevronDown 
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </motion.button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                
                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 py-2 z-20"
                >
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      {user?.profile_pic ? (
                        <img 
                          src={user.profile_pic} 
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-medium text-lg font-body">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate font-body">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-body">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium font-body">View Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-medium font-body">Settings</span>
                    </Link>

                    {user?.profile_data?.onboarding_completed === false && (
                      <Link
                        to="/onboarding"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium font-body">Complete Setup</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-200/50 pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium font-body">Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
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
