import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialAPI, authAPI } from '../services/api';
import VentWall from '../components/VentWall';
import { 
  Users, 
  UserPlus, 
  Heart, 
  MessageCircle,
  Send,
  Copy,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Social = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendCode, setFriendCode] = useState('');
  const [newFriendCode, setNewFriendCode] = useState('');
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab === 'friends') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [friendsRes, nudgesRes, codeRes] = await Promise.all([
        socialAPI.getFriends(),
        socialAPI.getNudges(),
        authAPI.getFriendCode()
      ]);

      setFriends(friendsRes.friends || []);
      setNudges(nudgesRes.nudges || []);
      setFriendCode(codeRes);
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  };

  const addFriend = async () => {
    if (!newFriendCode.trim()) {
      toast.error('Please enter a friend code');
      return;
    }

    setLoading(true);
    try {
      await socialAPI.sendFriendRequest(newFriendCode);
      toast.success('Friend request sent successfully!');
      setNewFriendCode('');
      loadData();
    } catch (error) {
      toast.error('Failed to send friend request. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const sendNudge = async (friendId) => {
    try {
      await socialAPI.sendNudge(friendId, 'Thinking of you! 💙');
      toast.success('Supportive nudge sent!');
    } catch (error) {
      toast.error('Failed to send nudge. Please try again.');
    }
  };

  const copyFriendCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    toast.success('Friend code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'happy': '😊',
      'sad': '😢',
      'anxious': '😰',
      'calm': '😌',
      'energetic': '⚡',
      'angry': '😠',
      'unknown': '🤔'
    };
    return moodEmojis[mood] || '🤔';
  };

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'vent', label: 'Vent Wall', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Users className="text-white" size={32} />
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Social Support
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect with friends and support each other's mental health journey
          </p>
        </motion.div>

        {/* Modern Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/70 backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-white/40">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <Icon size={22} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Friend Code */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <UserPlus className="mr-2 text-primary-600" size={24} />
                  Your Friend Code
                </h2>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Share this code with friends:</span>
                    <button
                      onClick={copyFriendCode}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      <span className="text-sm font-medium">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <code className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                      {friendCode}
                    </code>
                  </div>
                </div>

                {/* Add Friend */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a Friend</h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newFriendCode}
                      onChange={(e) => setNewFriendCode(e.target.value.toUpperCase())}
                      placeholder="Enter friend code"
                      className="input-field flex-1"
                      maxLength={8}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addFriend}
                      disabled={loading || !newFriendCode.trim()}
                      className={`btn-primary ${
                        loading || !newFriendCode.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Adding...' : 'Add Friend'}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Friends List */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="mr-2 text-primary-600" size={24} />
                  Your Friends ({friends.length})
                </h2>

                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto mb-4 text-gray-300" size={48} />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No friends yet
                    </h3>
                    <p className="text-gray-500">
                      Share your friend code to connect with others
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {friend.profile_pic ? (
                            <img 
                              src={friend.profile_pic} 
                              alt={friend.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-calm-400 to-calm-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {friend.name?.charAt(0) || 'F'}
                              </span>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-medium text-gray-800">{friend.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{getMoodEmoji(friend.current_mood)}</span>
                              <span className="capitalize">{friend.current_mood}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => sendNudge(friend.id)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Send supportive nudge"
                        >
                          <Heart size={20} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Nudges Section */}
            {nudges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 mt-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Supportive Nudges ({nudges.length})</h2>
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {nudges.map((nudge, index) => (
                    <motion.div
                      key={nudge.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-6 bg-gradient-to-r from-pink-50/80 to-purple-50/80 rounded-2xl border border-pink-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {nudge.sender?.profile_pic ? (
                            <img 
                              src={nudge.sender.profile_pic} 
                              alt={nudge.sender.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {nudge.sender?.name?.charAt(0) || 'F'}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 text-lg mb-1">{nudge.sender?.name}</p>
                            <p className="text-slate-600 leading-relaxed">{nudge.message}</p>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <span className="text-sm text-slate-500 font-medium">
                            {new Date(nudge.timestamp).toLocaleDateString()}
                          </span>
                          <div className="text-2xl mt-1">💙</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'vent' && (
          <motion.div
            key="vent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VentWall />
          </motion.div>
        )}

      </AnimatePresence>
      </div>
    </div>
  );
};

export default Social;
