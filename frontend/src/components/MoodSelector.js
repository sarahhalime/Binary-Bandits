import React from 'react';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '⚡', label: 'Energetic' },
  { emoji: '💕', label: 'Romantic' },
];

export default function MoodSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
  background: '#f3e8ff'
    }}>
      <div className="w-full max-w-6xl mx-auto p-16 rounded-3xl shadow-2xl animate-gradient-move" style={{
        background: 'linear-gradient(135deg, #cb7de1ff 0%, #e3e0ff 50%, #cfa5e5ff 100%)',
        boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.12), 0 1.5px 6px 0 rgba(255, 255, 255, 0.08)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 6s ease-in-out infinite',
      }}>
        <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-900" style={{letterSpacing: '-1px'}}>How are you feeling right now?</h2>
  <div className="flex justify-center gap-6 w-full">
          {moods.map((mood) => (
            <button
              key={mood.label}
              className="flex flex-col items-center rounded-2xl px-12 py-10 transition hover:scale-105 focus:outline-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, #ffffffff 100%)',
                boxShadow: '0 4px 16px 0 rgba(255, 255, 255, 0.1)',
                border: '2px solid #d9a2dfff',
                minWidth: '150px',
                minHeight: '180px',
                maxWidth: '170px',
                maxHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
              }}
              onClick={() => onSelect(mood.label)}
            >
              <span className="mb-2" style={{fontSize: '4.2rem', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '4.2rem'}}>{mood.emoji}</span>
              <span className="text-2xl font-semibold text-gray-800" style={{letterSpacing: '-1px'}}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
