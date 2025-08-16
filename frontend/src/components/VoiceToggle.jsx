import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceToggle = ({ onChangeDraft, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Call parent callback with current transcript
        if (onChangeDraft) {
          onChangeDraft(finalTranscript || interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onChangeDraft]);

  const toggleListening = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start voice input');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <MicOff className="w-4 h-4" />
        <span>Voice input not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`
          p-2 rounded-full transition-all duration-200
          ${isListening 
            ? 'bg-red-500 text-white shadow-lg scale-110' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Listening...</span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceToggle;
