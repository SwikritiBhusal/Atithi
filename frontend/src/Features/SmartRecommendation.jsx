import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Check
} from 'lucide-react';
import './SmartRecommendation.css';

export default function SmartRecommendation({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    travelPurpose: '',
    budget: '',
    mustHaves: [],
    duration: '',
    groupSize: 1
  });

  const travelPurposes = [
    { id: 'adventure', label: 'Adventure & Trekking', icon: '🏔️', description: 'Mountain trails and outdoor activities' },
    { id: 'wellness', label: 'Wellness & Relaxation', icon: '🧘', description: 'Peace, yoga, and rejuvenation' },
    { id: 'culture', label: 'Culture & Heritage', icon: '🏛️', description: 'Traditional experiences' },
    { id: 'family', label: 'Family Vacation', icon: '👨‍👩‍👧', description: 'Kid-friendly and spacious' },
    // { id: 'romantic', label: 'Romantic Getaway', icon: '💑', description: 'Privacy and scenic beauty' },
    { id: 'photography', label: 'Photography & Nature', icon: '📸', description: 'Stunning views' }
  ];

  const budgetOptions = [
    { id: 'budget', label: 'Budget-Friendly', range: '< NPR 2000/night', icon: '💰' },
    { id: 'moderate', label: 'Moderate', range: 'NPR 2000-4000/night', icon: '💵' },
    { id: 'premium', label: 'Premium', range: '> NPR 4000/night', icon: '💎' }
  ];

  const mustHaveOptions = [
    { id: 'mountain_view', label: 'Mountain View', icon: '🏔️' },
    { id: 'trekking_trails', label: 'Near Trekking Trails', icon: '🥾' },
    { id: 'traditional_food', label: 'Traditional Food', icon: '🍜' },
    { id: 'wifi', label: 'Wifi & Workspace', icon: '💻' },
    { id: 'family_friendly', label: 'Family-Friendly', icon: '👨‍👩‍👧' },
    { id: 'cultural_activities', label: 'Cultural Activities', icon: '🎭' },
    { id: 'peaceful', label: 'Peaceful & Quiet', icon: '🕊️' },
    { id: 'hot_water', label: 'Hot Water', icon: '🚿' }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      getRecommendations();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleMustHave = (id) => {
    setPreferences(prev => ({
      ...prev,
      mustHaves: prev.mustHaves.includes(id)
        ? prev.mustHaves.filter(item => item !== id)
        : [...prev.mustHaves, id]
    }));
  };

  const getRecommendations = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/recommendations/smart-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preferences)
      });

      const result = await response.json();

      if (result.success) {
        navigate('/recommendations/results', {
          state: {
            recommendations: result.recommendations,
            preferences: preferences
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-recommendation-overlay">
      <div className="sr-modal">
        <button className="sr-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="sr-header">
          <Sparkles className="sr-sparkle" size={32} />
          <h2>Find Your Perfect Homestay</h2>
          <p>Answer a few questions for personalized recommendations</p>
        </div>

        <div className="sr-progress-container">
          <div className="sr-progress-bar">
            <div className="sr-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <span className="sr-progress-text">Step {step} of 4</span>
        </div>

        <div className="sr-content">
          {step === 1 && (
            <div className="sr-step">
              <h3>What brings you to Nepal?</h3>
              <p className="sr-step-subtitle">Choose your primary travel purpose</p>
              
              <div className="sr-options-grid">
                {travelPurposes.map(purpose => (
                  <div
                    key={purpose.id}
                    className={`sr-option-card ${preferences.travelPurpose === purpose.id ? 'selected' : ''}`}
                    onClick={() => setPreferences({ ...preferences, travelPurpose: purpose.id })}
                  >
                    <span className="sr-option-icon">{purpose.icon}</span>
                    <h4>{purpose.label}</h4>
                    <p>{purpose.description}</p>
                    {preferences.travelPurpose === purpose.id && (
                      <div className="sr-check-badge"><Check size={16} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="sr-step">
              <h3>What's your budget?</h3>
              <p className="sr-step-subtitle">Select your price range per night</p>
              
              <div className="sr-budget-options">
                {budgetOptions.map(budget => (
                  <div
                    key={budget.id}
                    className={`sr-budget-card ${preferences.budget === budget.id ? 'selected' : ''}`}
                    onClick={() => setPreferences({ ...preferences, budget: budget.id })}
                  >
                    <span className="sr-budget-icon">{budget.icon}</span>
                    <h4>{budget.label}</h4>
                    <p>{budget.range}</p>
                    {preferences.budget === budget.id && (
                      <div className="sr-check-badge"><Check size={16} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="sr-step">
              <h3>What's important to you?</h3>
              <p className="sr-step-subtitle">Select amenities you need (optional)</p>
              
              <div className="sr-musthaves-grid">
                {mustHaveOptions.map(option => (
                  <div
                    key={option.id}
                    className={`sr-musthave-chip ${preferences.mustHaves.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => toggleMustHave(option.id)}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {preferences.mustHaves.includes(option.id) && (
                      <Check size={14} className="chip-check" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="sr-step">
              <h3>Final details</h3>
              <p className="sr-step-subtitle">Help us find the perfect match</p>
              
              <div className="sr-final-details">
                <div className="sr-detail-group">
                  <label>How long are you staying?</label>
                  <select 
                    value={preferences.duration}
                    onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
                  >
                    <option value="">Select duration</option>
                    <option value="1-2">1-2 nights</option>
                    <option value="3-5">3-5 nights</option>
                    <option value="6-10">6-10 nights</option>
                    <option value="10+">More than 10 nights</option>
                  </select>
                </div>

                <div className="sr-detail-group">
                  <label>How many people?</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={preferences.groupSize}
                    onChange={(e) => setPreferences({ ...preferences, groupSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sr-navigation">
          {step > 1 && (
            <button className="sr-btn-back" onClick={handleBack}>
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          
          <button 
            className="sr-btn-next" 
            onClick={handleNext}
            disabled={
              (step === 1 && !preferences.travelPurpose) ||
              (step === 2 && !preferences.budget) ||
              (step === 4 && !preferences.duration) ||
              loading
            }
          >
            {loading ? 'Finding matches...' : step === 4 ? 'Get Recommendations' : 'Next'}
            {!loading && step !== 4 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}