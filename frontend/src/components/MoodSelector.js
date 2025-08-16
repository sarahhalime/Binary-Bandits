import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3a7e7 0%, #f7b2b7 100%)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Toaster position="bottom-right" />
      {/* Current Mood Card */}
      <div style={{
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '2rem',
        padding: '1.5rem 2rem',
        maxWidth: 400,
        margin: '0 auto 2rem auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 4 }}>Current Mood</div>
          <div style={{ color: '#555', fontSize: '1rem' }}>
            You're feeling {currentMood.name.toLowerCase()} (Intensity: {currentMood.intensity}/10)
          </div>
        </div>
        <span style={{ fontSize: '2rem', marginLeft: 'auto' }}>
          {moods.find(m => m.name === currentMood.name)?.emoji}
        </span>
      </div>
      {/* Carousel */}
      <div style={{
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '2rem',
        padding: '2rem',
        maxWidth: 700,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontWeight: 800, fontSize: '2.5rem', marginBottom: '2rem' }}>How are you feeling right now?</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <button
            onClick={goLeft}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 48,
              height: 48,
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            aria-label="Previous"
          >←</button>
          <div style={{
            background: '#fff',
            borderRadius: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: '2rem 2.5rem',
            minWidth: 180,
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {moods[carouselIndex].emoji}
            </span>
            <span style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
              {moods[carouselIndex].name}
            </span>
            {/* Intensity Selector */}
            <div style={{ margin: '1rem 0', width: '100%' }}>
              <label htmlFor="intensity" style={{ fontWeight: 500, fontSize: '1rem', marginBottom: 8, display: 'block' }}>Intensity:</label>
              <input
                id="intensity"
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ textAlign: 'center', marginTop: 4, fontWeight: 600 }}>{intensity}/10</div>
            </div>
            <button
              onClick={handleSelect}
              style={{
                background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Select
            </button>
          </div>
          <button
            onClick={goRight}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 48,
              height: 48,
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            aria-label="Next"
          >→</button>
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: 8 }}>
          {moods.map((_, i) => (
            <span
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: i === carouselIndex ? '#a78bfa' : '#e0e0e0',
                display: 'inline-block'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}