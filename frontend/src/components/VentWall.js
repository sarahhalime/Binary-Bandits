import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialAPI } from '../services/api';
import { 
  MessageCircle, 
  Send, 
  Heart,
  Plus,
  Filter,
  TrendingUp,
  Clock,
  Tag,
  X,
  MessageSquare,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const VentWall = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    mood: 'neutral',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [filter, setFilter] = useState({
    mood: '',
    tag: ''
  });
  
  // Comment states
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  
  // Delete states
  const [deletingPost, setDeletingPost] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({});
  const [deletingComment, setDeletingComment] = useState({});
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState({});

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-yellow-600' },
    { value: 'sad', label: 'Sad', emoji: '😢', color: 'text-blue-600' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'text-purple-600' },
    { value: 'stressed', label: 'Stressed', emoji: '😤', color: 'text-red-600' },
    { value: 'calm', label: 'Calm', emoji: '😌', color: 'text-green-600' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😠', color: 'text-orange-600' },
    { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'text-pink-600' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-600' }
  ];

  const reactions = [
    { type: 'heart', emoji: '❤️', label: 'Love' },
    { type: 'hug', emoji: '🤗', label: 'Hug' },
    { type: 'support', emoji: '💪', label: 'Support' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { type: 'strength', emoji: '⭐', label: 'Strength' }
  ];

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.mood) params.mood = filter.mood;
      if (filter.tag) params.tag = filter.tag;
      
      const response = await socialAPI.getVentPosts(params);
      const posts = response.posts || [];
      setPosts(posts);
      
      // Load comment counts for all posts
      const commentCounts = {};
      for (const post of posts) {
        try {
          const commentsResponse = await socialAPI.getComments(post.id);
          commentCounts[post.id] = commentsResponse.comments?.length || 0;
        } catch (error) {
          console.error(`Error loading comments for post ${post.id}:`, error);
          commentCounts[post.id] = 0;
        }
      }
      
      // Update posts with comment counts
      const postsWithCounts = posts.map(post => ({
        ...post,
        comment_count: commentCounts[post.id] || 0
      }));
      setPosts(postsWithCounts);
      
    } catch (error) {
      console.error('Error loading vent posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please write something to share');
      return;
    }

    if (newPost.content.length < 5) {
      toast.error('Your post must be at least 5 characters');
      return;
    }

    try {
      await socialAPI.createVentPost(newPost);
      toast.success('Your thoughts have been shared anonymously');
      setNewPost({ content: '', mood: 'neutral', tags: [] });
      setShowCreatePost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating vent post:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to share your thoughts. Please try again.';
      toast.error(errorMessage);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !newPost.tags.includes(currentTag.trim()) && newPost.tags.length < 5) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, currentTag.trim().toLowerCase()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const post = posts.find(p => p.id === postId);
      const hasReacted = post.user_reaction === reactionType;
      
      if (hasReacted) {
        await socialAPI.removeVentReaction(postId);
      } else {
        await socialAPI.reactToVentPost(postId, reactionType);
      }
      
      loadPosts(); // Refresh to show updated reactions
    } catch (error) {
      toast.error('Failed to react to post');
    }
  };

  const getMoodStyle = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj || moods.find(m => m.value === 'neutral');
  };

  const loadComments = async (postId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const response = await socialAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: response.comments || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    const isShowing = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
    
    if (!isShowing && !comments[postId]) {
      await loadComments(postId);
    }
  };

  const createComment = async (postId) => {
    const content = newComment[postId];
    if (!content || !content.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (content.length > 300) {
      toast.error('Comment must be less than 300 characters');
      return;
    }

    try {
      const response = await socialAPI.createComment(postId, content.trim());
      
      // Add the new comment to the comments list
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.comment]
      }));
      
      // Clear the comment input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Error creating comment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add comment';
      toast.error(errorMessage);
    }
  };

  const deletePost = async (postId) => {
    try {
      setDeletingPost(prev => ({ ...prev, [postId]: true }));
      await socialAPI.deleteVentPost(postId);
      
      // Remove the post from the posts list
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      // Clear related states
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[postId];
        return newComments;
      });
      setShowComments(prev => {
        const newShowComments = { ...prev };
        delete newShowComments[postId];
        return newShowComments;
      });
      setShowDeleteConfirm(prev => ({ ...prev, [postId]: false }));
      
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMessage);
    } finally {
      setDeletingPost(prev => ({ ...prev, [postId]: false }));
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      setDeletingComment(prev => ({ ...prev, [commentId]: true }));
      await socialAPI.deleteComment(commentId);
      
      // Remove the comment from the comments list
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
      }));
      
      // Update the post's comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comment_count: Math.max(0, (post.comment_count || 0) - 1) }
          : post
      ));
      
      setShowDeleteCommentConfirm(prev => ({ ...prev, [commentId]: false }));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete comment';
      toast.error(errorMessage);
    } finally {
      setDeletingComment(prev => ({ ...prev, [commentId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageCircle className="mr-2 text-primary-600" size={28} />
            Vent Wall
          </h2>
          <p className="text-gray-600 mt-1">
            Share your thoughts anonymously and find support from the community
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreatePost(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Share</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <select
            value={filter.mood}
            onChange={(e) => setFilter({ ...filter, mood: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Moods</option>
            {moods.map(mood => (
              <option key={mood.value} value={mood.value}>
                {mood.emoji} {mood.label}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Filter by tag..."
            value={filter.tag}
            onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          {(filter.mood || filter.tag) && (
            <button
              onClick={() => setFilter({ mood: '', tag: '' })}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Share Your Thoughts</h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind? (Anonymous)
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share what you're feeling... This will be posted anonymously."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {newPost.content.length}/500
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are you feeling?
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {moods.map(mood => (
                      <button
                        key={mood.value}
                        onClick={() => setNewPost({ ...newPost, mood: mood.value })}
                        className={`p-2 rounded-lg border text-center text-sm transition-colors ${
                          newPost.mood === mood.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-lg">{mood.emoji}</div>
                        <div className="text-xs">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add a tag..."
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      maxLength={20}
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={!newPost.content.trim()}
                    className={`flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 ${
                      !newPost.content.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Share Anonymously
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="vent-empty-state">
            <MessageCircle className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to share your thoughts on the vent wall
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary"
            >
              Share Your Thoughts
            </button>
          </div>
        ) : (
          posts.map((post, index) => {
            const moodStyle = getMoodStyle(post.mood);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="vent-post"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`vent-mood-indicator ${post.mood}`}>
                    <span className="text-lg">
                      {moodStyle.emoji}
                    </span>
                    <span className="text-sm font-medium">
                      {moodStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{post.relative_time}</span>
                    </div>
                    {post.can_delete && (
                      <button
                        onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [post.id]: true }))}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete post"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-800 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="vent-tag"
                      >
                        <Tag size={10} className="mr-1" />
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {reactions.map(reaction => {
                      const count = post.reactions[reaction.type] || 0;
                      const hasReacted = post.user_reaction === reaction.type;
                      
                      return (
                        <motion.button
                          key={reaction.type}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReaction(post.id, reaction.type)}
                          className={`vent-reaction-btn ${hasReacted ? 'active' : 'inactive'}`}
                          title={reaction.label}
                        >
                          <span>{reaction.emoji}</span>
                          {count > 0 && <span className="text-xs">{count}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  {post.reaction_count > 0 && (
                    <div className="text-sm text-gray-500">
                      {post.reaction_count} {post.reaction_count === 1 ? 'reaction' : 'reactions'}
                    </div>
                  )}
                  
                  {/* Comments button */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    <MessageSquare size={16} />
                                         <span>
                       {comments[post.id]?.length || post.comment_count || 0} Comments
                     </span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {showComments[post.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/30"
                    >
                      {/* Add Comment */}
                      <div className="mb-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add a supportive comment..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            onKeyPress={(e) => e.key === 'Enter' && createComment(post.id)}
                            className="vent-comment-input flex-1 px-3 py-2 text-sm"
                            maxLength={300}
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => createComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              newComment[post.id]?.trim()
                                ? 'bg-gradient-to-r from-pink-400 to-blue-400 text-white hover:from-pink-500 hover:to-blue-500'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Send size={16} />
                          </motion.button>
                        </div>
                        {newComment[post.id] && (
                          <div className="text-right text-xs text-gray-500 mt-1">
                            {newComment[post.id].length}/300
                          </div>
                        )}
                      </div>

                      {/* Comments List */}
                      {loadingComments[post.id] ? (
                        <div className="text-center py-4">
                          <div className="spinner mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Loading comments...</p>
                        </div>
                      ) : comments[post.id]?.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {comments[post.id].map((comment, commentIndex) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: commentIndex * 0.1 }}
                              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                            >
                              <p className="text-gray-800 text-sm mb-2">
                                {comment.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Anonymous • {comment.relative_time}
                                </span>
                                {comment.can_delete && (
                                  <button
                                    onClick={() => setShowDeleteCommentConfirm(prev => ({ ...prev, [comment.id]: true }))}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MessageSquare className="mx-auto mb-2 text-gray-300" size={24} />
                          <p className="text-sm text-gray-500">
                            No comments yet. Be the first to show support!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modals */}
      <AnimatePresence>
        {Object.keys(showDeleteConfirm).map(postId => 
          showDeleteConfirm[postId] && (
            <div key={postId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 w-full max-w-sm"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Delete Post
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete this post? This action cannot be undone and will also delete all comments.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [postId]: false }))}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deletePost(postId)}
                      disabled={deletingPost[postId]}
                      className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                        deletingPost[postId] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deletingPost[postId] ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )
                 )}
       </AnimatePresence>

       {/* Delete Comment Confirmation Modals */}
       <AnimatePresence>
         {Object.keys(showDeleteCommentConfirm).map(commentId => 
           showDeleteCommentConfirm[commentId] && (
             <div key={commentId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="bg-white rounded-lg p-6 w-full max-w-sm"
               >
                 <div className="text-center">
                   <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                     <MessageSquare className="w-6 h-6 text-red-600" />
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">
                     Delete Comment
                   </h3>
                   <p className="text-sm text-gray-500 mb-6">
                     Are you sure you want to delete this comment? This action cannot be undone.
                   </p>
                   <div className="flex space-x-3">
                     <button
                       onClick={() => setShowDeleteCommentConfirm(prev => ({ ...prev, [commentId]: false }))}
                       className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={() => {
                         // Find which post this comment belongs to
                         const postId = Object.keys(comments).find(pid => 
                           comments[pid]?.some(comment => comment.id === commentId)
                         );
                         if (postId) {
                           deleteComment(commentId, postId);
                         }
                       }}
                       disabled={deletingComment[commentId]}
                       className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                         deletingComment[commentId] ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                     >
                       {deletingComment[commentId] ? 'Deleting...' : 'Delete'}
                     </button>
                   </div>
                 </div>
               </motion.div>
             </div>
           )
         )}
       </AnimatePresence>
    </div>
  );
};

export default VentWall; 