import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Upload, Check, User, Brain, Heart, Music, Calendar, Target } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PhotoUploadModal from './PhotoUploadModal';
import TimeSelector from './TimeSelector';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    // Basic Info
    name: user?.name || '',
    nickname: '',
    age: '',
    profilePhoto: null,
    bio: '',
    
    // Mental Health Profile
    primaryConcerns: [],
    therapyExperience: '',
    preferredCommunicationStyle: '',
    copingStrategies: [],
    supportSystem: '',
    
    // Lifestyle & Demographics
    occupation: '',
    stressLevel: 5,
    sleepSchedule: {
      bedtime: '',
      wakeTime: '',
      sleepQuality: 5
    },
    
    // Preferences
    musicGenres: [],
    activityPreferences: [],
    contentLength: '',
    motivationalStyle: '',
    
    // Goals & Notifications
    goals: [],
    notificationPreferences: {
      dailyCheckIn: true,
      moodReminders: true,
      activitySuggestions: true
    },
    preferredNotificationTimes: []
  });

  const totalSteps = 6;

  const updateProfileData = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const toggleArrayValue = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const toggleSingleValue = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field] === value ? '' : value
    }));
  };

  const handleOpenPhotoModal = () => {
    setIsPhotoModalOpen(true);
  };

  const handleClosePhotoModal = () => {
    setIsPhotoModalOpen(false);
  };

  const handlePhotoSave = (photoData) => {
    updateProfileData('profilePhoto', photoData);
  };

  // Validation for Mental Health Profile step
  const validateMentalHealthStep = () => {
    const errors = [];
    
    // Check if at least one primary concern is selected
    if (profileData.primaryConcerns.length === 0) {
      errors.push('Please select at least one primary concern');
    }
    
    // Check if therapy experience is selected
    if (!profileData.therapyExperience) {
      errors.push('Please select your previous therapy experience');
    }
    
    // Check if communication style is selected
    if (!profileData.preferredCommunicationStyle) {
      errors.push('Please select your preferred communication style');
    }
    
    return errors;
  };

  // Validation for Lifestyle step
  const validateLifestyleStep = () => {
    const errors = [];
    
    // Check if occupation is selected
    if (!profileData.occupation) {
      errors.push('Please select your occupation');
    }
    
    // Check if bedtime is set
    if (!profileData.sleepSchedule.bedtime) {
      errors.push('Please set your usual bedtime');
    }
    
    // Check if wake time is set
    if (!profileData.sleepSchedule.wakeTime) {
      errors.push('Please set your usual wake time');
    }
    
    return errors;
  };

  // Validation for Preferences step
  const validatePreferencesStep = () => {
    const errors = [];
    
    // Check if at least one music genre is selected
    if (profileData.musicGenres.length === 0) {
      errors.push('Please select at least one music genre you enjoy');
    }
    
    // Check if at least one activity preference is selected
    if (profileData.activityPreferences.length === 0) {
      errors.push('Please select at least one preferred activity for mental wellness');
    }
    
    // Check if content length is selected
    if (!profileData.contentLength) {
      errors.push('Please select your preferred content length');
    }
    
    return errors;
  };

  // Validation for Goals step
  const validateGoalsStep = () => {
    const errors = [];
    
    // Check if at least one mental health goal is selected
    if (profileData.goals.length === 0) {
      errors.push('Please select at least one mental health goal you hope to achieve');
    }
    
    return errors;
  };

  const nextStep = () => {
    // Validate Mental Health Profile step (Step 2) before proceeding
    if (currentStep === 2) {
      const errors = validateMentalHealthStep();
      if (errors.length > 0) {
        // Show error messages
        errors.forEach(error => toast.error(error));
        return; // Don't proceed to next step
      }
    }
    
    // Validate Lifestyle step (Step 3) before proceeding
    if (currentStep === 3) {
      const errors = validateLifestyleStep();
      if (errors.length > 0) {
        // Show error messages
        errors.forEach(error => toast.error(error));
        return; // Don't proceed to next step
      }
    }
    
    // Validate Preferences step (Step 4) before proceeding
    if (currentStep === 4) {
      const errors = validatePreferencesStep();
      if (errors.length > 0) {
        // Show error messages
        errors.forEach(error => toast.error(error));
        return; // Don't proceed to next step
      }
    }
    
    // Validate Goals step (Step 5) before proceeding
    if (currentStep === 5) {
      const errors = validateGoalsStep();
      if (errors.length > 0) {
        // Show error messages
        errors.forEach(error => toast.error(error));
        return; // Don't proceed to next step
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await authAPI.completeOnboarding(profileData);
      
      if (response.user) {
        toast.success('Welcome! Your profile has been created successfully.');
        navigate('/'); // Redirect to main app
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      const errorMessage = error.response?.data?.error || 'Failed to complete onboarding. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  );

  const StepIndicator = () => (
    <div className="flex justify-center mb-6">
      <span className="text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );

  // Step 1: Basic Information
  const BasicInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="mx-auto mb-4 text-blue-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's get to know you</h2>
        <p className="text-gray-600">This helps us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center space-x-4">
            {profileData.profilePhoto ? (
              <img 
                src={profileData.profilePhoto} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="text-gray-400" size={24} />
              </div>
            )}
            <button
              type="button"
              onClick={handleOpenPhotoModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload size={16} className="inline mr-2" />
              Upload Photo
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed">
            {profileData.name || 'Your registered name'}
          </div>
          <p className="text-xs text-gray-500 mt-1">This matches your registered username</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nickname (Display Name)</label>
          <input
            key="nickname-input"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What should others call you?"
            defaultValue={profileData.nickname || ''}
            onChange={(e) => updateProfileData('nickname', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">This is how other users will see your name</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
              value={profileData.age}
              onChange={(e) => updateProfileData('age', e.target.value)}
            >
              <option value="">Select your age</option>
              {Array.from({ length: 78 }, (_, i) => i + 18).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about yourself</label>
          <div className="relative">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="A brief description about yourself..."
              value={profileData.bio || ''}
              maxLength={200}
              onChange={(e) => updateProfileData('bio', e.target.value)}
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${
                (profileData.bio || '').length > 180 ? 'text-red-500' : 
                (profileData.bio || '').length > 150 ? 'text-yellow-500' : 
                'text-gray-500'
              }`}>
                {(profileData.bio || '').length}/200 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Mental Health Profile
  const MentalHealthStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Brain className="mx-auto mb-4 text-green-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mental Health Profile</h2>
        <p className="text-gray-600">Help us understand how to support you best</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">What are your primary concerns? (Select all that apply)</label>
          <div className="grid grid-cols-2 gap-3">
            {['Anxiety', 'Depression', 'Stress', 'Sleep Issues', 'Relationships', 'Work/School', 'Self-Esteem', 'Trauma'].map(concern => (
              <button
                key={concern}
                onClick={() => toggleArrayValue('primaryConcerns', concern)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  profileData.primaryConcerns.includes(concern)
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 hover:border-green-500'
                }`}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Previous therapy experience</label>
          <div className="space-y-2">
            {['None', 'Some (less than 6 months)', 'Moderate (6 months - 2 years)', 'Extensive (2+ years)'].map(option => (
              <button
                key={option}
                onClick={() => toggleSingleValue('therapyExperience', option)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  profileData.therapyExperience === option
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 hover:border-green-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred communication style</label>
          <div className="space-y-2">
            {['Gentle and supportive', 'Direct and straightforward', 'Motivational and encouraging', 'Clinical and informative'].map(style => (
              <button
                key={style}
                onClick={() => toggleSingleValue('preferredCommunicationStyle', style)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  profileData.preferredCommunicationStyle === style
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 hover:border-green-500'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Lifestyle & Demographics
  const LifestyleStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Lifestyle</h2>
        <p className="text-gray-600">Understanding your daily life helps us provide better recommendations</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation/Role</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={profileData.occupation}
            onChange={(e) => updateProfileData('occupation', e.target.value)}
          >
            <option value="">Select your occupation</option>
            <option value="student">Student</option>
            <option value="working-professional">Working Professional</option>
            <option value="freelancer">Freelancer</option>
            <option value="homemaker">Homemaker</option>
            <option value="retired">Retired</option>
            <option value="unemployed">Between Jobs</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current stress level: <span className={`font-bold ${
              profileData.stressLevel <= 3 ? 'text-green-600' :
              profileData.stressLevel <= 6 ? 'text-yellow-600' :
              profileData.stressLevel <= 8 ? 'text-orange-600' :
              'text-red-600'
            }`}>{profileData.stressLevel}/10</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 via-orange-200 to-red-200 rounded-lg appearance-none cursor-pointer stress-slider"
              value={profileData.stressLevel}
              onChange={(e) => updateProfileData('stressLevel', parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, 
                  #dcfce7 0%, #dcfce7 30%, 
                  #fef3c7 30%, #fef3c7 60%, 
                  #fed7aa 60%, #fed7aa 80%, 
                  #fecaca 80%, #fecaca 100%)`
              }}
            />

          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-green-600 font-medium">😌 Low stress</span>
            <span className="text-red-600 font-medium">😰 High stress</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usual bedtime</label>
            <TimeSelector
              value={profileData.sleepSchedule.bedtime}
              onChange={(time) => updateProfileData('sleepSchedule.bedtime', time)}
              placeholder="Select bedtime"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usual wake time</label>
            <TimeSelector
              value={profileData.sleepSchedule.wakeTime}
              onChange={(time) => updateProfileData('sleepSchedule.wakeTime', time)}
              placeholder="Select wake time"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sleep quality: <span className={`font-bold ${
              profileData.sleepSchedule.sleepQuality <= 3 ? 'text-red-600' :
              profileData.sleepSchedule.sleepQuality <= 6 ? 'text-orange-600' :
              profileData.sleepSchedule.sleepQuality <= 8 ? 'text-yellow-600' :
              'text-green-600'
            }`}>{profileData.sleepSchedule.sleepQuality}/10</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full h-3 bg-gradient-to-r from-red-200 via-orange-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer sleep-slider"
              value={profileData.sleepSchedule.sleepQuality}
              onChange={(e) => updateProfileData('sleepSchedule.sleepQuality', parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, 
                  #fecaca 0%, #fecaca 30%, 
                  #fed7aa 30%, #fed7aa 60%, 
                  #fef3c7 60%, #fef3c7 80%, 
                  #dcfce7 80%, #dcfce7 100%)`
              }}
            />

          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-red-600 font-medium">😴 Poor sleep</span>
            <span className="text-green-600 font-medium">😊 Excellent sleep</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Preferences
  const PreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Music className="mx-auto mb-4 text-purple-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Preferences</h2>
        <p className="text-gray-600">What activities and content do you enjoy?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Music genres you enjoy (Select all that apply)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Pop', 'Rock', 'Classical', 'Jazz', 'Electronic', 'Hip-Hop', 'Folk', 'Ambient', 'R&B', 'Country', 'World', 'Instrumental'].map(genre => (
              <button
                key={genre}
                onClick={() => toggleArrayValue('musicGenres', genre)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  profileData.musicGenres.includes(genre)
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 hover:border-purple-500'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred activities for mental wellness</label>
          <div className="grid grid-cols-2 gap-3">
            {['Meditation', 'Exercise', 'Journaling', 'Music Listening', 'Reading', 'Nature Walks', 'Breathing Exercises', 'Art/Creativity', 'Talking to Friends', 'Yoga', 'Dancing', 'Cooking'].map(activity => (
              <button
                key={activity}
                onClick={() => toggleArrayValue('activityPreferences', activity)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  profileData.activityPreferences.includes(activity)
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 hover:border-purple-500'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred content length</label>
          <div className="space-y-2">
            {['Short (1-5 minutes)', 'Medium (5-15 minutes)', 'Long (15+ minutes)', 'Flexible'].map(option => (
              <button
                key={option}
                onClick={() => updateProfileData('contentLength', option)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  profileData.contentLength === option
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 hover:border-purple-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Goals & Motivation
  const GoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="mx-auto mb-4 text-orange-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Goals</h2>
        <p className="text-gray-600">What do you hope to achieve with this app?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Mental health goals (Select all that apply)</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              'Reduce anxiety and stress',
              'Improve mood and emotional well-being',
              'Develop better coping strategies',
              'Build healthier daily habits',
              'Improve sleep quality',
              'Increase self-awareness',
              'Better manage emotions',
              'Build resilience',
              'Improve relationships',
              'Increase motivation and energy'
            ].map(goal => (
              <button
                key={goal}
                onClick={() => toggleArrayValue('goals', goal)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  profileData.goals.includes(goal)
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'bg-white border-gray-300 hover:border-orange-500'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Motivational style that works best for you</label>
          <div className="space-y-2">
            {[
              'Encouraging and positive reinforcement',
              'Gentle reminders and support',
              'Challenge-based motivation',
              'Progress tracking and achievement',
              'Community support and sharing',
              'Personal reflection and insights'
            ].map(style => (
              <button
                key={style}
                onClick={() => toggleSingleValue('motivationalStyle', style)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  profileData.motivationalStyle === style
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'bg-white border-gray-300 hover:border-orange-500'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 6: Notifications & Final Setup
  const NotificationsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Calendar className="mx-auto mb-4 text-indigo-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">How would you like us to support your journey?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Notification types</label>
          <div className="space-y-3">
            {[
              { key: 'dailyCheckIn', label: 'Daily mood check-in reminders' },
              { key: 'moodReminders', label: 'Gentle mood tracking reminders' },
              { key: 'activitySuggestions', label: 'Personalized activity suggestions' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={profileData.notificationPreferences[key]}
                  onChange={(e) => updateProfileData(`notificationPreferences.${key}`, e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Preferred notification times</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Morning (8-10 AM)', 'Midday (12-2 PM)', 'Afternoon (3-5 PM)', 'Evening (6-8 PM)'].map(time => (
              <button
                key={time}
                onClick={() => toggleArrayValue('preferredNotificationTimes', time)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  profileData.preferredNotificationTimes.includes(time)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-300 hover:border-indigo-500'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🎉 You're almost done!</h3>
          <p className="text-blue-700 text-sm">
            Your personalized mental health journey is about to begin. We'll use this information to provide you with tailored recommendations, AI support, and activities that match your preferences and goals.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <BasicInfoStep />;
      case 2: return <MentalHealthStep />;
      case 3: return <LifestyleStep />;
      case 4: return <PreferencesStep />;
      case 5: return <GoalsStep />;
      case 6: return <NotificationsStep />;
      default: return <BasicInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <StepIndicator />
            <ProgressBar />
            
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-2 rounded-lg transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </button>
              
              {currentStep === totalSteps ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-2 rounded-lg transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check size={20} className="mr-2" />
                      Complete Setup
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  Next
                  <ChevronRight size={20} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={handleClosePhotoModal}
        currentPhoto={profileData.profilePhoto}
        onSave={handlePhotoSave}
      />
    </div>
  );
};

export default OnboardingFlow;
