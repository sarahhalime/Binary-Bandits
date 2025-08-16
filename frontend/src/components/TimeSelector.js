import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TimeSelector = ({ value, onChange, placeholder = "Select time" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  
  // Generate time options (12:00, 12:15, 12:30, 12:45, 1:00, etc.)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute of ['00', '15', '30', '45']) {
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };
  
  const timeOptions = generateTimeOptions();
  const periods = ['AM', 'PM'];
  
  // Parse the current value (24-hour format) to 12-hour format
  const parseTime = (timeStr) => {
    if (!timeStr) return { time: '', period: 'AM' };
    
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    let period = 'AM';
    
    if (hour === 0) {
      hour = 12;
    } else if (hour === 12) {
      period = 'PM';
    } else if (hour > 12) {
      hour = hour - 12;
      period = 'PM';
    }
    
    return {
      time: `${hour}:${minuteStr || '00'}`,
      period: period
    };
  };
  
  // Convert 12-hour format back to 24-hour format
  const formatTime = (time, period) => {
    if (!time || !period) return '';
    
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    
    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minuteStr}`;
  };
  
  const currentTime = parseTime(value);
  
  // Initialize selected values when dropdown opens
  React.useEffect(() => {
    if (isOpen && value) {
      const parsed = parseTime(value);
      setSelectedTime(parsed.time);
      setSelectedPeriod(parsed.period);
    } else if (isOpen && !value) {
      setSelectedTime('');
      setSelectedPeriod('AM');
    }
  }, [isOpen, value]);
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    // Auto-save when both time and period are selected
    if (time && selectedPeriod) {
      const formattedTime = formatTime(time, selectedPeriod);
      onChange(formattedTime);
    }
  };
  
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    // Auto-save when both time and period are selected
    if (selectedTime && period) {
      const formattedTime = formatTime(selectedTime, period);
      onChange(formattedTime);
    }
  };
  
  const displayTime = () => {
    if (!value) return placeholder;
    const { time, period } = currentTime;
    return `${time} ${period}`;
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-left flex justify-between items-center"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayTime()}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Time selector (combined hours:minutes) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Time</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
                  {timeOptions.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-red-50 transition-colors ${
                        selectedTime === time ? 'bg-red-100 text-red-700 font-medium' : ''
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* AM/PM selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Period</label>
                <div className="space-y-2">
                  {periods.map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handlePeriodSelect(period)}
                      className={`w-full px-3 py-2 text-sm text-center hover:bg-red-50 border border-gray-200 rounded transition-colors ${
                        selectedPeriod === period ? 'bg-red-100 text-red-700 border-red-300 font-medium' : ''
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
