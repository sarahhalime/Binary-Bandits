import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const moods = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Romantic', emoji: '💕' },
];

export default function MoodPage() {
  const [currentMood, setCurrentMood] = useState({ name: 'Happy', intensity: 5 });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [intensity, setIntensity] = useState(5);
  const navigate = useNavigate();

  const handleSelect = () => {
    setCurrentMood({ name: moods[carouselIndex].name, intensity });
    toast.success('Mood recorded successfully!');
  navigate('/');
  };

  const goLeft = () => setCarouselIndex(i => (i === 0 ? moods.length - 1 : i - 1));
  const goRight = () => setCarouselIndex(i => (i === moods.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="bottom-right" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">How are you feeling?</h1>
          <p className="text-gray-600 text-lg">Track your mood and build emotional awareness</p>
        </motion.div>

        {/* Current Mood Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card mb-8 flex items-center gap-4 max-w-md mx-auto"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Current Mood</h3>
            <p className="text-gray-600">
              You're feeling {currentMood.name.toLowerCase()} (Intensity: {currentMood.intensity}/10)
            </p>
          </div>
          <span className="text-4xl">
            {moods.find(m => m.name === currentMood.name)?.emoji}
          </span>
        </motion.div>
        {/* Mood Selector Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Select your current mood</h2>
          
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* Left Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goLeft}
              className="w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-2xl text-gray-600 hover:text-gray-800 transition-all duration-200"
              aria-label="Previous mood"
            >
              ←
            </motion.button>

            {/* Mood Card */}
            <motion.div
              key={carouselIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 min-w-[280px] min-h-[320px] flex flex-col items-center justify-center border border-white/50"
            >
              <motion.span 
                className="text-8xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {moods[carouselIndex].emoji}
              </motion.span>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {moods[carouselIndex].name}
              </h3>

              {/* Intensity Selector */}
              <div className="w-full mb-6">
                <label htmlFor="intensity" className="block text-sm font-semibold text-gray-700 mb-3">
                  Intensity Level
                </label>
                <input
                  id="intensity"
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center mt-2 text-lg font-bold text-purple-600">
                  {intensity}/10
                </div>
              </div>

              {/* Select Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelect}
                className="btn-primary w-full py-3 px-6 text-lg font-semibold"
              >
                Select This Mood
              </motion.button>
            </motion.div>

            {/* Right Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goRight}
              className="w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-2xl text-gray-600 hover:text-gray-800 transition-all duration-200"
              aria-label="Next mood"
            >
              →
            </motion.button>
          </div>

          {/* Mood Dots Indicator */}
          <div className="flex justify-center gap-3">
            {moods.map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCarouselIndex(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === carouselIndex 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
