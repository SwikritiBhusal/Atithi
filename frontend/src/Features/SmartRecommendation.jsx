import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, X, Check, Search } from 'lucide-react';
import './SmartRecommendation.css';

export default function SmartRecommendation({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mustHaveOptions, setMustHaveOptions] = useState([]);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [preferences, setPreferences] = useState({
    travelPurpose: '',
    budget: '',
    mustHaves: [],
    duration: '',
    groupSize: 1
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/homestay/unique-facilities');
        const result = await response.json();
        if (result.success) setMustHaveOptions(result.facilities);
      } catch (error) {
        console.error('Failed to fetch facilities:', error);
      }
    };
    fetchFacilities();
  }, []);

  const travelPurposes = [
    { id: 'adventure', label: 'Adventure & Trekking', icon: '🏔️', description: 'Mountain trails and outdoor activities' },
    { id: 'wellness', label: 'Wellness & Relaxation', icon: '🧘', description: 'Peace, yoga, and rejuvenation' },
    { id: 'culture', label: 'Culture & Heritage', icon: '🏛️', description: 'Traditional experiences' },
    { id: 'family', label: 'Family Vacation', icon: '👨‍👩‍👧', description: 'Kid-friendly and spacious' },
    { id: 'photography', label: 'Photography & Nature', icon: '📸', description: 'Stunning views' }
  ];

  const budgetOptions = [
    { id: 'budget', label: 'Budget-Friendly', range: '< NPR 2,000/night', icon: '💰', color: '#10b981' },
    { id: 'moderate', label: 'Moderate', range: 'NPR 2,000–4,000/night', icon: '💵', color: '#3b82f6' },
    { id: 'premium', label: 'Premium', range: '> NPR 4,000/night', icon: '💎', color: '#8b5cf6' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else getRecommendations();
  };

  const toggleMustHave = (id) => {
    setPreferences(prev => ({
      ...prev,
      mustHaves: prev.mustHaves.includes(id)
        ? prev.mustHaves.filter(item => item !== id)
        : [...prev.mustHaves, id]
    }));
  };

  const filteredSuggestions = mustHaveOptions.filter(f =>
    f.toLowerCase().includes(facilitySearch.toLowerCase()) &&
    !preferences.mustHaves.includes(f)
  );

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
          state: { recommendations: result.recommendations, preferences, historyId: result.historyId }
        });
      } else {
        alert(result.message || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Travel Purpose', 'Budget', 'Preferences', 'Final Details'];

  return (
    <div className="sr-overlay">
      <div className="sr-modal">
        {/* Close */}
        <button className="sr-close" onClick={onClose}><X size={20} /></button>

        {/* Header */}
        <div className="sr-header">
          <div className="sr-header-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h2>Find Your Perfect Homestay</h2>
            <p>Personalized AI recommendations just for you</p>
          </div>
        </div>

        {/* Progress */}
        <div className="sr-progress-wrap">
          {stepTitles.map((title, i) => (
            <div key={i} className={`sr-step-dot ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}>
              <div className="sr-dot-circle">
                {i + 1 < step ? <Check size={12} /> : <span>{i + 1}</span>}
              </div>
              <span className="sr-dot-label">{title}</span>
            </div>
          ))}
          <div className="sr-progress-line">
            <div className="sr-progress-fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="sr-content">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="sr-step">
              <div className="sr-step-header">
                <h3>What brings you to Nepal?</h3>
                <p>Choose your primary travel purpose</p>
              </div>
              <div className="sr-purpose-grid">
                {travelPurposes.map(purpose => (
                  <div
                    key={purpose.id}
                    className={`sr-purpose-card ${preferences.travelPurpose === purpose.id ? 'selected' : ''}`}
                    onClick={() => setPreferences({ ...preferences, travelPurpose: purpose.id })}
                  >
                    <span className="sr-purpose-icon">{purpose.icon}</span>
                    <h4>{purpose.label}</h4>
                    <p>{purpose.description}</p>
                    {preferences.travelPurpose === purpose.id && (
                      <div className="sr-selected-badge"><Check size={14} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="sr-step">
              <div className="sr-step-header">
                <h3>What's your budget?</h3>
                <p>Select your comfortable price range per night</p>
              </div>
              <div className="sr-budget-grid">
                {budgetOptions.map(budget => (
                  <div
                    key={budget.id}
                    className={`sr-budget-card ${preferences.budget === budget.id ? 'selected' : ''}`}
                    onClick={() => setPreferences({ ...preferences, budget: budget.id })}
                    style={{ '--accent': budget.color }}
                  >
                    <div className="sr-budget-icon-wrap">
                      <span>{budget.icon}</span>
                    </div>
                    <h4>{budget.label}</h4>
                    <p>{budget.range}</p>
                    {preferences.budget === budget.id && (
                      <div className="sr-selected-badge"><Check size={14} /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="sr-step">
              <div className="sr-step-header">
                <h3>What's important to you?</h3>
                <p>Search or select facilities you need <span className="sr-optional">(optional)</span></p>
              </div>

              {/* Search box */}
              <div className="sr-search-wrap" ref={searchRef}>
                <div className="sr-search-box">
                  <Search size={16} className="sr-search-icon" />
                  <input
                    type="text"
                    placeholder="Search facilities or type your own..."
                    value={facilitySearch}
                    onChange={(e) => {
                      setFacilitySearch(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => facilitySearch.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {facilitySearch && (
                    <button className="sr-search-clear" onClick={() => { setFacilitySearch(''); setShowSuggestions(false); }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                  <div className="sr-suggestions">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map(facility => (
                        <div
                          key={facility}
                          className="sr-suggestion-item"
                          onMouseDown={() => {
                            toggleMustHave(facility);
                            setFacilitySearch('');
                            setShowSuggestions(false);
                          }}
                        >
                          <Search size={13} />
                          <span>{facility}</span>
                        </div>
                      ))
                    ) : null}

                    {/* Custom add */}
                    {facilitySearch.trim() && !mustHaveOptions.find(f => f.toLowerCase() === facilitySearch.toLowerCase()) && (
                      <div
                        className="sr-suggestion-add"
                        onMouseDown={() => {
                          toggleMustHave(facilitySearch.trim());
                          setFacilitySearch('');
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="sr-add-icon">+</span>
                        <span>Add "<strong>{facilitySearch}</strong>"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected tags */}
              {preferences.mustHaves.length > 0 && (
                <div className="sr-selected-tags">
                  <span className="sr-tags-label">Selected:</span>
                  {preferences.mustHaves.map(item => (
                    <span key={item} className="sr-tag" onClick={() => toggleMustHave(item)}>
                      {item} <X size={11} />
                    </span>
                  ))}
                </div>
              )}

              {/* Chips grid */}
              {mustHaveOptions.length === 0 ? (
                <div className="sr-empty-msg">Loading options...</div>
              ) : (
                <div className="sr-chips-grid">
                  {mustHaveOptions
                    .filter(f => facilitySearch === '' || f.toLowerCase().includes(facilitySearch.toLowerCase()))
                    .map(facility => (
                      <div
                        key={facility}
                        className={`sr-chip ${preferences.mustHaves.includes(facility) ? 'selected' : ''}`}
                        onClick={() => toggleMustHave(facility)}
                      >
                        {preferences.mustHaves.includes(facility) && <Check size={12} />}
                        <span>{facility}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="sr-step">
              <div className="sr-step-header">
                <h3>Final details</h3>
                <p>Help us find the perfect match for you</p>
              </div>
              <div className="sr-final-grid">
                <div className="sr-final-card">
                  <label>How long are you staying?</label>
                  <select
                    value={preferences.duration}
                    onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
                  >
                    <option value="">Select duration</option>
                    <option value="1-2">1–2 nights</option>
                    <option value="3-5">3–5 nights</option>
                    <option value="6-10">6–10 nights</option>
                    <option value="10+">More than 10 nights</option>
                  </select>
                </div>
                <div className="sr-final-card">
                  <label>How many people?</label>
                  <div className="sr-counter">
                    <button
                      type="button"
                      onClick={() => setPreferences(p => ({ ...p, groupSize: Math.max(1, p.groupSize - 1) }))}
                    >−</button>
                    <span>{preferences.groupSize}</span>
                    <button
                      type="button"
                      onClick={() => setPreferences(p => ({ ...p, groupSize: Math.min(10, p.groupSize + 1) }))}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="sr-summary">
                <h4>Your Preferences</h4>
                <div className="sr-summary-tags">
                  {preferences.travelPurpose && <span>{travelPurposes.find(t => t.id === preferences.travelPurpose)?.icon} {travelPurposes.find(t => t.id === preferences.travelPurpose)?.label}</span>}
                  {preferences.budget && <span>{budgetOptions.find(b => b.id === preferences.budget)?.label}</span>}
                  {preferences.mustHaves.slice(0, 3).map(m => <span key={m}>{m}</span>)}
                  {preferences.mustHaves.length > 3 && <span>+{preferences.mustHaves.length - 3} more</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="sr-nav">
          {step > 1 && (
            <button className="sr-btn-back" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} /> Back
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
            {loading ? (
              <span className="sr-loading-dots">
                <span />Finding<span />matches<span />...
              </span>
            ) : step === 4 ? (
              <><Sparkles size={16} /> Get Recommendations</>
            ) : (
              <>Next <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}