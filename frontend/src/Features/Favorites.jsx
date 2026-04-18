import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Home, Star, Coffee, Wifi, Mountain, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAppToast } from '../components/toast';
import './homestayListings.css';

export default function Favorites() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.warning('Login Required', 'Please login to view your favorite homestays.');
      navigate('/login', { state: { from: '/favorites' } });
      return;
    }

    fetchFavorites();
  }, [navigate, toast]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/user/favorites', {
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        setFavorites(result.favorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to fetch favorites', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (homestayId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/favorites/${homestayId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        setFavorites(result.favorites);
        window.dispatchEvent(new Event('favoritesUpdated'));
      }
    } catch (error) {
      console.error('Error removing favorite', error);
    }
  };

  const goToDetail = (id) => {
    navigate(`/homestay/${id}`);
  };

  return (
    <>
      <Navbar />

      <div className="listings-page">
        <div className="listings-hero">
          <div className="hero-content">
            <h1 className="hero-title">My Favorite Homestays</h1>
            <p className="hero-subtitle">Save interesting stays and come back anytime.</p>
          </div>
          <div className="hero-pattern"></div>
        </div>

        <div className="listings-container">
          {loading ? (
            <div className="listings-loading">
              <Mountain className="loading-icon" size={48} />
              <p>Loading your favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="no-results">
              <Mountain size={64} />
              <h3>No favorites yet</h3>
              <p>Tap the heart icon on homestay cards to save them for later.</p>
            </div>
          ) : (
            <div className="homestays-grid">
              {favorites.map((homestay, index) => (
                <div
                  key={homestay._id}
                  className="homestay-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-image-wrapper">
                    {homestay.homestayPhotos && homestay.homestayPhotos.length > 0 ? (
                      <img
                        src={homestay.homestayPhotos[0].url}
                        alt={homestay.homestayName}
                        className="card-image"
                      />
                    ) : (
                      <div className="card-image-placeholder">
                        <Home size={48} />
                      </div>
                    )}
                    <button
                      className={`favorite-btn active`}
                      onClick={() => handleRemove(homestay._id)}
                    >
                      <Heart size={20} fill="#e74c3c" />
                    </button>
                    <div className="card-badge">
                      <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                      <span>Verified</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">{homestay.homestayName}</h3>
                    <div className="card-rating">
                      <Star size={14} fill={homestay.averageRating > 0 ? '#fbbf24' : 'none'} stroke="#fbbf24" />
                      <span className="rating-text">
                        {homestay.averageRating > 0 ? homestay.averageRating.toFixed(1) : 'New'}
                        {homestay.reviewCount ? ` (${homestay.reviewCount})` : ''}
                      </span>
                    </div>
                    <div className="card-location">
                      <MapPin size={14} />
                      <span>{homestay.municipality}, {homestay.district}</span>
                    </div>

                    <p className="card-description">
                      {homestay.description?.substring(0, 100)}
                      {homestay.description?.length > 100 ? '...' : ''}
                    </p>

                    <div className="card-features">
                      <div className="feature">
                        <Home size={14} />
                        <span>{homestay.rooms} Rooms</span>
                      </div>
                      <div className="feature">
                        <Users size={14} />
                        <span>{homestay.guests || 2} Guests</span>
                      </div>
                    </div>

                    {homestay.facilities && homestay.facilities.length > 0 && (
                      <div className="card-facilities">
                        {homestay.facilities.slice(0, 3).map((facility, i) => (
                          <span key={i} className="facility-tag">
                            {facility === 'Free Wi-Fi' && <Wifi size={10} />}
                            {facility === 'Local Food' && <Coffee size={10} />}
                            {facility}
                          </span>
                        ))}
                        {homestay.facilities.length > 3 && (
                          <span className="facility-tag more">+{homestay.facilities.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="price-section">
                        <span className="price">NPR {homestay.price?.toLocaleString()}</span>
                        <span className="price-unit">/ night</span>
                      </div>
                      <button
                        className="book-btn"
                        onClick={() => goToDetail(homestay._id)}
                      >
                        View Details
                      </button>
                    </div>
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
