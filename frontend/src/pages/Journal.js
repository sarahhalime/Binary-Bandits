import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { journalAPI } from '../services/api';
import { 
  BookOpen, 
  Plus, 
  Send, 
  MessageCircle,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');

  const moods = [
    { name: 'happy', emoji: '😊' },
    { name: 'sad', emoji: '😢' },
    { name: 'anxious', emoji: '😰' },
    { name: 'calm', emoji: '😌' },
    { name: 'angry', emoji: '😠' },
    { name: 'excited', emoji: '🤩' },
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await journalAPI.getEntries();
      setEntries(response.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntry.trim()) return;

    setLoading(true);
    try {
      await journalAPI.createEntry({
        content: currentEntry,
        mood: selectedMood,
        title: `Journal Entry - ${new Date().toLocaleDateString()}`
      });

      setCurrentEntry('');
      setSelectedMood('');
      toast.success('Journal entry saved successfully!');
      loadEntries();
    } catch (error) {
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAIResponse = async () => {
    if (!currentEntry.trim()) {
      toast.error('Please write something first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await journalAPI.getAIResponse(currentEntry, selectedMood);
      setAiResponse(response.ai_response);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setAiLoading(false);
    }
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
          <BookOpen className="mr-3 text-primary-600" size={40} />
          Journal & AI Therapy
        </h1>
        <p className="text-lg text-gray-600">
          Write your thoughts and get empathetic AI responses
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Write Entry */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Plus className="mr-2 text-primary-600" size={24} />
            Write New Entry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling? (Optional)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    type="button"
                    onClick={() => setSelectedMood(mood.name)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                      selectedMood === mood.name
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl">{mood.emoji}</div>
                    <div className="text-xs font-medium text-gray-700 capitalize mt-1">
                      {mood.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder="Write about your day, feelings, thoughts, or anything you'd like to share..."
                className="input-field min-h-[200px] resize-none"
                rows={8}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || !currentEntry.trim()}
                className={`btn-primary flex-1 ${
                  loading || !currentEntry.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={getAIResponse}
                disabled={aiLoading || !currentEntry.trim()}
                className={`btn-secondary ${
                  aiLoading || !currentEntry.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <MessageCircle className="mr-2" size={16} />
                {aiLoading ? 'Getting Response...' : 'AI Response'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* AI Response */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MessageCircle className="mr-2 text-primary-600" size={24} />
            AI Therapy Response
          </h2>

          {aiResponse ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-r from-calm-50 to-primary-50 rounded-lg border border-calm-200"
            >
              <p className="text-gray-800 leading-relaxed">{aiResponse}</p>
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Click "AI Response" to get empathetic feedback on your entry</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="mr-2 text-primary-600" size={24} />
            Recent Entries
          </h2>

          <div className="space-y-4">
            {entries.slice(0, 5).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {entry.mood && (
                      <span className="text-xl">
                        {moods.find(m => m.name === entry.mood)?.emoji || '📝'}
                      </span>
                    )}
                    <h3 className="font-medium text-gray-800">
                      {entry.title || 'Journal Entry'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">
                  {entry.content}
                </p>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{entry.word_count} words</span>
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Journal;
