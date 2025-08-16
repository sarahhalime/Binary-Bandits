import React, { useState } from 'react';
import MoodSelector from '../components/MoodSelector';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function MoodGate() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState(null);

  const handleSelect = (mood) => {
    setSelected(mood);
    setTimeout(() => {
      navigate('/'); // Go to home after mood selection
    }, 600); // brief delay for feedback
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{
      background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)'
    }}>
      {/* Subtle animated bubbles background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0}}>
          <circle cx="220" cy="180" r="110" fill="#c4b5fd" opacity="0.13">
            <animate attributeName="cy" values="180;220;180" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="1200" cy="320" r="80" fill="#a78bfa" opacity="0.10">
            <animate attributeName="cy" values="320;370;320" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="650" r="140" fill="#d8b4fe" opacity="0.09">
            <animate attributeName="cy" values="650;600;650" dur="9s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="720" r="70" fill="#f3e8ff" opacity="0.08">
            <animate attributeName="cy" values="720;680;720" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      {/* Animated bubbles background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',top:0,left:0}}>
          <circle cx="200" cy="200" r="80" fill="#e0c3fc" opacity="0.25">
            <animate attributeName="cy" values="200;300;200" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="1200" cy="300" r="60" fill="#f7e8ff" opacity="0.22">
            <animate attributeName="cy" values="300;400;300" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="600" r="100" fill="#e3f0ff" opacity="0.18">
            <animate attributeName="cy" values="600;500;600" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="700" r="50" fill="#c1e1ff" opacity="0.15">
            <animate attributeName="cy" values="700;650;700" dur="5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      {/* Top right profile and sign out button, matching Navbar */}
      <div className="absolute top-8 right-12 flex items-center space-x-4 z-50">
        {user?.profile_pic ? (
          <img 
            src={user.profile_pic} 
            alt={user.name}
            className="w-9 h-9 rounded-xl object-cover shadow-md"
          />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-medium text-sm font-body">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-slate-700 font-body">{user?.name}</span>
        <button
          onClick={logout}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>
      <MoodSelector onSelect={handleSelect} />
    </div>
  );
}
