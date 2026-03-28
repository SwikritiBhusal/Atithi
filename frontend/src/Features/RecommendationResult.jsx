import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Heart,
  ChevronRight,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './RecommendationResult.css';

export default function RecommendationResults() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { recommendations, preferences } = location.state || {};

  if (!recommendations) {
    navigate('/');
    return null;
  }

  const handleViewHomestay = (homestayId) => {
    navigate(`/homestay/${homestayId}`);
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      adventure: 'Adventure & Trekking',
      wellness: 'Wellness & Relaxation',
      culture: 'Culture & Heritage',
      family: 'Family Vacation',
      romantic: 'Romantic Getaway',
      photography: 'Photography & Nature'
    };
    return labels[purpose] || purpose;
  };

  return (
    <>
      <Navbar />
      <div className="recommendation-results">
        <div className="results-container">
          {/* Header */}
          <div className="results-header">
            <Sparkles className="results-sparkle" size={40} />
            <h1>Your Perfect Matches</h1>
            <p>Based on your preferences, we found {recommendations.length} amazing homestays for you</p>
          </div>

          {/* User Preferences Summary */}
          <div className="preferences-summary">
            <h3>Your Preferences</h3>
            <div className="pref-tags">
              <span className="pref-tag">
                {getPurposeLabel(preferences.travelPurpose)}
              </span>
              <span className="pref-tag">
                {preferences.budget === 'budget' && '< NPR 2000/night'}
                {preferences.budget === 'moderate' && 'NPR 2000-4000/night'}
                {preferences.budget === 'premium' && '> NPR 4000/night'}
              </span>
              <span className="pref-tag">
                {preferences.groupSize} {preferences.groupSize === 1 ? 'person' : 'people'}
              </span>
              <span className="pref-tag">
                {preferences.duration} nights
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.homestay._id} 
                className="recommendation-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Match Badge */}
                <div className="match-badge">
                  {rec.matchScore}% Match
                </div>

                <div className="rec-card-content">
                  {/* Homestay Image */}
                  <div className="rec-image-container">
                    <img 
                      src={rec.homestay.homestayPhotos?.[0]?.url || rec.homestay.images?.[0] || '/placeholder.jpg'} 
                      alt={rec.homestay.homestayName || rec.homestay.name}
                      className="rec-image"
                    />
                    <button className="rec-favorite">
                      <Heart size={20} />
                    </button>
                  </div>

                  {/* Homestay Info */}
                  <div className="rec-info">
                    <div className="rec-header-info">
                      <h2>{rec.homestay.homestayName || rec.homestay.name}</h2>
                      <div className="rec-location">
                        <MapPin size={16} />
                        <span>{rec.homestay.location || `${rec.homestay.district}, ${rec.homestay.province}`}</span>
                      </div>
                    </div>

                    <div className="rec-rating">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{rec.homestay.rating || rec.homestay.averageRating || 4.5}</span>
                      <span className="rec-reviews">
                        ({rec.homestay.reviewCount || rec.homestay.reviews?.length || 0} reviews)
                      </span>
                    </div>

                    <div className="rec-price">
                      <span className="price-amount">
                        NPR {(rec.homestay.price || rec.homestay.pricePerNight)?.toLocaleString()}
                      </span>
                      <span className="price-label">per night</span>
                    </div>

                    {/* AI Explanation */}
                    <div className="ai-explanation">
                      <div className="ai-header">
                        <Sparkles size={16} />
                        <span>Why we recommend this</span>
                      </div>
                      <ul className="ai-reasons">
                        {rec.reasons.map((reason, idx) => (
                          <li key={idx}>
                            <Check size={14} />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* View Button */}
                    <button 
                      className="rec-view-btn"
                      onClick={() => handleViewHomestay(rec.homestay._id)}
                    >
                      View Details
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse All CTA */}
          <div className="browse-all-cta">
            <p>Can't find what you're looking for?</p>
            <button onClick={() => navigate('/homestayListings')}>
              Browse All Homestays
            </button>
          </div>
        </div>
      </div>
    </>
  );
}