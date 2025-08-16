import React, { useState } from 'react';
import { Heart, AlertTriangle, Clock, ExternalLink } from 'lucide-react';

const AiReplyCard = ({ emotion, intensity, risk, reply, micro_action, crisis_resources = [] }) => {
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(micro_action?.duration_sec || 60);

  // Start micro-action timer
  const startMicroAction = () => {
    setShowTimer(true);
    setTimeLeft(micro_action?.duration_sec || 60);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Get emotion color
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-100 text-green-800',
      calm: 'bg-blue-100 text-blue-800',
      sad: 'bg-gray-100 text-gray-800',
      anxious: 'bg-yellow-100 text-yellow-800',
      angry: 'bg-red-100 text-red-800',
      stressed: 'bg-orange-100 text-orange-800',
      overwhelmed: 'bg-purple-100 text-purple-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    return colors[emotion?.toLowerCase()] || colors.neutral;
  };

  // Get risk color
  const getRiskColor = (risk) => {
    const colors = {
      none: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      elevated: 'bg-orange-100 text-orange-800',
      crisis: 'bg-red-100 text-red-800'
    };
    return colors[risk] || colors.none;
  };

  // Get intensity color
  const getIntensityColor = (intensity) => {
    if (intensity <= 2) return 'bg-green-500';
    if (intensity <= 3) return 'bg-yellow-500';
    if (intensity <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header with emotion and intensity */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(emotion)}`}>
            {emotion}
          </span>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= intensity ? getIntensityColor(intensity) : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Risk indicator */}
        {risk !== 'none' && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
            <AlertTriangle className="w-3 h-3" />
            {risk}
          </div>
        )}
      </div>

      {/* AI Reply */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{reply}</p>
      </div>

      {/* Crisis Resources (if risk is crisis) */}
      {risk === 'crisis' && crisis_resources.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Crisis Resources
          </h4>
          <div className="space-y-2">
            {crisis_resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-700 hover:text-red-800 text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                {resource.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Micro Action */}
      {micro_action && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">
                Suggested Action: {micro_action.type}
              </h4>
              <p className="text-sm text-gray-600">
                {micro_action.duration_sec} seconds
              </p>
            </div>
            
            {!showTimer ? (
              <button
                onClick={startMicroAction}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Start
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-lg font-mono text-primary-600">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <button
                  onClick={() => setShowTimer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
          
          {/* Action steps for breathing */}
          {showTimer && micro_action.type === 'breathing' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Inhale deeply...
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Hold...
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  Exhale slowly...
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiReplyCard;
