import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { socialAPI, authAPI } from '../services/api';
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
  const [friends, setFriends] = useState([]);
  const [friendCode, setFriendCode] = useState('');
  const [newFriendCode, setNewFriendCode] = useState('');
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <Users className="mr-3 text-primary-600" size={40} />
          Social Support
        </h1>
        <p className="text-lg text-gray-600">
          Connect with friends and support each other's mental health journey
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Friend Code */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
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
        </motion.div>

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
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
        </motion.div>
      </div>

      {/* Nudges */}
      {nudges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MessageCircle className="mr-2 text-primary-600" size={24} />
            Supportive Nudges ({nudges.length})
          </h2>

          <div className="space-y-4">
            {nudges.map((nudge, index) => (
              <motion.div
                key={nudge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gradient-to-r from-calm-50 to-primary-50 rounded-lg border border-calm-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {nudge.sender?.profile_pic ? (
                      <img 
                        src={nudge.sender.profile_pic} 
                        alt={nudge.sender.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-calm-400 to-calm-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {nudge.sender?.name?.charAt(0) || 'F'}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-800">{nudge.sender?.name}</p>
                      <p className="text-gray-600">{nudge.message}</p>
                    </div>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(nudge.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Social;
