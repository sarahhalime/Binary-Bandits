import React from 'react';

const MoodChips = ({ onSelect, selectedMood }) => {
  const moods = [
    { id: 'calm', label: 'Calm', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { id: 'anxious', label: 'Anxious', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { id: 'stressed', label: 'Stressed', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
    { id: 'restless', label: 'Restless', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-red-100 text-red-800 hover:bg-red-200' }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">How are you feeling?</h3>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${mood.color}
              ${selectedMood === mood.id 
                ? 'ring-2 ring-primary-500 ring-offset-2 scale-105' 
                : 'hover:scale-105'
              }
            `}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodChips;
