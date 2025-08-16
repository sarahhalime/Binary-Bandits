import React, { useState } from 'react';
import { X, Upload, Trash2, Save, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const PhotoUploadModal = ({ isOpen, onClose, currentPhoto, onSave }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhoto || null);
  const [previewPhoto, setPreviewPhoto] = useState(currentPhoto || null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to current photo when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPhoto(currentPhoto || null);
      setPreviewPhoto(currentPhoto || null);
    }
  }, [isOpen, currentPhoto]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload only JPG, PNG, or WebP image files.');
      e.target.value = '';
      return;
    }

    // File size validation (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setSelectedPhoto(base64Data);
      setPreviewPhoto(base64Data);
      toast.success('Photo loaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Error reading the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleTrash = () => {
    setSelectedPhoto(null);
    setPreviewPhoto(null);
    toast.success('Photo removed');
  };

  const handleSave = async () => {
    if (!selectedPhoto) {
      toast.error('No photo to save');
      return;
    }

    setIsSaving(true);
    try {
      // Save to database immediately
      const response = await authAPI.updateProfilePhoto(selectedPhoto);
      
      // Update local state
      onSave(selectedPhoto);
      
      toast.success('Photo saved to database successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error(error.response?.data?.error || 'Failed to save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original photo if user cancels
    setSelectedPhoto(currentPhoto);
    setPreviewPhoto(currentPhoto);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Camera className="mr-2 text-blue-500" size={24} />
              Profile Photo
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Photo Preview Area */}
          <div className="p-6">
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-gray-200">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-gray-500 text-sm">No photo selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <label className="block">
                <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600 font-medium">Click to upload photo</p>
                  <p className="text-gray-500 text-sm">JPG, PNG, or WebP (max 2MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {previewPhoto && (
                  <button
                    onClick={handleTrash}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedPhoto}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoUploadModal;
