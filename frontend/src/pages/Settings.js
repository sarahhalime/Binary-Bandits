import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Save,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState({
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    dailyReminders: true,
    weeklyReports: false,
    
    // Privacy settings
    profileVisibility: 'friends', // 'public', 'friends', 'private'
    shareProgress: true,
    allowFriendRequests: true,
    
    // Appearance
    theme: 'light', // 'light', 'dark', 'system'
    language: 'en',
    
    // Account settings
    displayName: user?.name || '',
    email: user?.email || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (user?.profile_data?.preferences) {
      setSettings(prev => ({
        ...prev,
        ...user.profile_data.preferences
      }));
    }
  }, [user]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // You can implement this when you add preferences to your backend
      // await updateProfile({ preferences: settings });
      
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const SettingSection = ({ icon: Icon, title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/40"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-indigo-500' : 'bg-slate-300'
        }`}
      >
        <motion.div
          initial={false}
          animate={{
            x: checked ? 24 : 2,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </motion.button>
    </div>
  );

  const SelectOption = ({ label, value, options, onChange }) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-slate-800 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Profile</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
              <p className="text-slate-600 mt-1">Manage your account preferences and privacy settings</p>
            </div>
            
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <SettingSection icon={Bell} title="Notifications">
            <div className="space-y-1">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive updates and reminders via email"
                checked={settings.emailNotifications}
                onChange={(value) => handleSettingChange('emailNotifications', value)}
              />
              <ToggleSwitch
                label="Push Notifications"
                description="Get notifications on your device"
                checked={settings.pushNotifications}
                onChange={(value) => handleSettingChange('pushNotifications', value)}
              />
              <ToggleSwitch
                label="Daily Check-in Reminders"
                description="Gentle reminders to log your mood"
                checked={settings.dailyReminders}
                onChange={(value) => handleSettingChange('dailyReminders', value)}
              />
              <ToggleSwitch
                label="Weekly Progress Reports"
                description="Summary of your wellness journey"
                checked={settings.weeklyReports}
                onChange={(value) => handleSettingChange('weeklyReports', value)}
              />
            </div>
          </SettingSection>

          {/* Privacy & Security */}
          <SettingSection icon={Shield} title="Privacy & Security">
            <div className="space-y-3">
              <SelectOption
                label="Profile Visibility"
                value={settings.profileVisibility}
                options={[
                  { value: 'public', label: 'Public - Anyone can see' },
                  { value: 'friends', label: 'Friends Only' },
                  { value: 'private', label: 'Private - Just Me' }
                ]}
                onChange={(value) => handleSettingChange('profileVisibility', value)}
              />
              
              <ToggleSwitch
                label="Share Progress with Friends"
                description="Let friends see your wellness milestones"
                checked={settings.shareProgress}
                onChange={(value) => handleSettingChange('shareProgress', value)}
              />
              <ToggleSwitch
                label="Allow Friend Requests"
                description="Others can send you friend requests"
                checked={settings.allowFriendRequests}
                onChange={(value) => handleSettingChange('allowFriendRequests', value)}
              />
            </div>
          </SettingSection>

          {/* Appearance */}
          <SettingSection icon={Sun} title="Appearance">
            <div className="space-y-3">
              <SelectOption
                label="Theme"
                value={settings.theme}
                options={[
                  { value: 'light', label: 'Light Mode' },
                  { value: 'dark', label: 'Dark Mode' },
                  { value: 'system', label: 'System Default' }
                ]}
                onChange={(value) => handleSettingChange('theme', value)}
              />
              
              <SelectOption
                label="Language"
                value={settings.language}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' }
                ]}
                onChange={(value) => handleSettingChange('language', value)}
              />
            </div>
          </SettingSection>

          {/* Account */}
          <SettingSection icon={User} title="Account Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => handleSettingChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Your display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div className="pt-2">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Change Password
                </button>
              </div>
            </div>
          </SettingSection>
        </div>

        {/* Save Banner for Mobile */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 right-6 lg:hidden z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">You have unsaved changes</p>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
