import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Trash2, Bookmark, Search, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import './myRecommendation.css';

export default function MyRecommendations() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, saved
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please login to view your recommendations');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/recommendations/history', {
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (historyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recommendations/history/${historyId}/toggle-save`, {
        method: 'PUT',
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        fetchHistory(); // Refresh
      }
    } catch (error) {
      console.error('Toggle save error:', error);
    }
  };

  const handleDelete = async (historyId) => {
    if (!window.confirm('Delete this recommendation search?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/recommendations/history/${historyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        fetchHistory(); // Refresh
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleViewRecommendation = (item) => {
    // Navigate to results page with this recommendation
    const recommendations = item.recommendations.map(rec => ({
      homestay: rec.homestayId,
      matchScore: rec.matchScore,
      reasons: rec.reasons
    }));

    navigate('/recommendations/results', {
      state: {
        recommendations: recommendations,
        preferences: item.preferences
      }
    });
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'saved') return item.isSaved;
    return true;
  });

  const stats = {
    total: history.length,
    saved: history.filter(h => h.isSaved).length
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mr-loading">Loading your recommendations...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-recommendations-page">
        <div className="mr-container">
          {/* Header */}
          <div className="mr-header">
            <Sparkles className="mr-header-icon" size={40} />
            <h1>My AI Recommendations</h1>
            <p>Your personalized homestay search history</p>
          </div>

          {/* Stats */}
          <div className="mr-stats">
            <div className="mr-stat-card">
              <Search size={24} />
              <div>
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Searches</span>
              </div>
            </div>
            <div className="mr-stat-card">
              <Bookmark size={24} />
              <div>
                <span className="stat-value">{stats.saved}</span>
                <span className="stat-label">Saved Collections</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mr-filters">
            <button
              className={`mr-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              className={`mr-filter-btn ${filter === 'saved' ? 'active' : ''}`}
              onClick={() => setFilter('saved')}
            >
              <Bookmark size={16} />
              Saved ({stats.saved})
            </button>
          </div>

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <div className="mr-empty">
              <Sparkles size={64} />
              <h3>No recommendations yet</h3>
              <p>Use our AI recommendation system to find perfect homestays</p>
              <button className="mr-browse-btn" onClick={() => navigate('/')}>
                <Sparkles size={20} />
                Get Recommendations
              </button>
            </div>
          ) : (
            <div className="mr-history-list">
              {filteredHistory.map((item, index) => (
                <div key={item._id} className="mr-history-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="mr-card-header">
                    <div className="mr-card-title">
                      <Sparkles size={20} />
                      <span>{item.searchTitle}</span>
                    </div>
                    <div className="mr-card-actions">
                      <button
                        className={`mr-save-btn ${item.isSaved ? 'saved' : ''}`}
                        onClick={() => handleToggleSave(item._id)}
                        title={item.isSaved ? 'Remove from saved' : 'Save to collection'}
                      >
                        <Bookmark size={18} fill={item.isSaved ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="mr-delete-btn"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mr-card-body">
                    {/* Preferences Summary */}
                    <div className="mr-preferences">
                      <span className="pref-tag">{item.preferences.travelPurpose}</span>
                      <span className="pref-tag">{item.preferences.budget}</span>
                      {item.preferences.groupSize && (
                        <span className="pref-tag">{item.preferences.groupSize} people</span>
                      )}
                      {item.preferences.mustHaves && item.preferences.mustHaves.length > 0 && (
                        <span className="pref-tag">+{item.preferences.mustHaves.length} must-haves</span>
                      )}
                    </div>

                    {/* Recommendations Preview */}
                    <div className="mr-results-preview">
                      <p className="preview-label">Found {item.recommendations.length} matches:</p>
                      <div className="preview-homestays">
                        {item.recommendations.map((rec, idx) => (
                          <div key={idx} className="preview-homestay">
                            {rec.homestayId?.homestayPhotos?.[0]?.url ? (
                              <img src={rec.homestayId.homestayPhotos[0].url} alt="" />
                            ) : (
                              <div className="preview-placeholder">🏠</div>
                            )}
                            <div className="preview-info">
                              <span className="preview-name">
                                {rec.homestayId?.homestayName || 'Homestay'}
                              </span>
                              <span className="preview-score">{rec.matchScore}% match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mr-card-date">
                      <Calendar size={14} />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mr-card-footer">
                    <button
                      className="mr-view-btn"
                      onClick={() => handleViewRecommendation(item)}
                    >
                      View Recommendations
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}