import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Users, Home, Star,
  Coffee, Wifi, Mountain, Heart, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './homestayListings.css';
import { Toast, useToast } from '../components/toast';

export default function HomestayListings() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [homestays, setHomestays]               = useState([]);
  const [filteredHomestays, setFilteredHomestays] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [priceRange, setPriceRange]             = useState('all');
  const [favorites, setFavorites]               = useState([]);

  /* ── auth guard ── */
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login', {
        state: {
          from: '/homestayListings',
          message: 'Please login or register to view homestay listings!'
        }
      });
      return;
    }
    fetchHomestays();
    fetchFavorites();
  }, [navigate]);

  const fetchHomestays = async () => {
    try {
      const res    = await fetch('http://localhost:5000/api/homestay/approved', { credentials: 'include' });
      const result = await res.json();
      if (result.success) {
        setHomestays(result.homestays);
        setFilteredHomestays(result.homestays);
      } else {
        toast.error('Failed to Load', 'Could not fetch homestays. Please try again.');
      }
    } catch {
      toast.error('Network Error', 'Failed to load homestays. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res    = await fetch('http://localhost:5000/api/user/favorites', { credentials: 'include' });
      const result = await res.json();
      if (result.success && Array.isArray(result.favorites))
        setFavorites(result.favorites.map(f => f._id));
    } catch {}
  };

  /* ── filters ── */
  useEffect(() => {
    let f = homestays;
    if (searchTerm)
      f = f.filter(h =>
        h.homestayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.municipality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (selectedProvince !== 'all') f = f.filter(h => h.province === selectedProvince);
    if (priceRange !== 'all')
      f = f.filter(h => {
        if (priceRange === 'budget')  return h.price < 2000;
        if (priceRange === 'mid')     return h.price >= 2000 && h.price < 5000;
        if (priceRange === 'luxury')  return h.price >= 5000;
        return true;
      });
    setFilteredHomestays(f);
  }, [searchTerm, selectedProvince, priceRange, homestays]);

  /* ── favorites ── */
  const toggleFavorite = async (id) => {
    const isFav = favorites.includes(id);
    const prev  = [...favorites];
    setFavorites(p => isFav ? p.filter(x => x !== id) : [...p, id]);
    try {
      const res    = await fetch(`http://localhost:5000/api/user/favorites/${id}`, {
        method: isFav ? 'DELETE' : 'POST', credentials: 'include'
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.favorites)) {
        setFavorites(result.favorites.map(f => f._id));
        toast.success(
          isFav ? 'Removed from Favorites' : 'Added to Favorites',
          isFav ? 'Removed from your favourites.' : 'Saved to your favourites!'
        );
        window.dispatchEvent(new Event('favoritesUpdated'));
      } else {
        setFavorites(prev);
        toast.error('Failed', 'Could not update favorites.');
      }
    } catch {
      setFavorites(prev);
      toast.error('Network Error', 'Could not update favorites.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Toast toasts={toasts} removeToast={removeToast} />
        {/* keep bg even on loading */}
        <div className="listings-page" style={{ minHeight: '100vh' }}>
          <div className="listings-page-bg" />
          <div className="listings-loading">
            <Mountain className="loading-icon" size={48} />
            <p>Loading mountain retreats…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="listings-page">

        {/* ── FULL-PAGE VILLAGE BACKGROUND ── */}
        <div className="listings-page-bg" />

        {/* ── HERO ── */}
        <div className="listings-hero">
          <div className="hero-content">

            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Nepal's Finest Homestays
            </div>

            <h1 className="hero-title">
              Discover <em>Authentic</em><br />Local Homestays
            </h1>

            <p className="hero-subtitle">
              From mist-draped Himalayan villages to sunlit Terai plains —
              every stay tells a story of Nepal's warmth and culture.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{homestays.length}+</span>
                <span className="hero-stat-label">Verified Stays</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">7</span>
                <span className="hero-stat-label">Provinces</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">100%</span>
                <span className="hero-stat-label">Authentic</span>
              </div>
            </div>
          </div>

          <div className="hero-pattern" />
        </div>

        {/* ── FLOATING SEARCH ── */}
        <div className="search-float-wrap">
          <div className="search-card">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, district, municipality…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="search-divider" />
            <SlidersHorizontal size={18} style={{ color: '#c17a47' }} />
          </div>
        </div>

        {/* ── FILTERS & COUNT ── */}
        <div className="listings-controls">
          <div className="filters">
            <div className="filter-group">
              <MapPin size={14} />
              <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
                <option value="all">All Provinces</option>
                <option value="Province 1">Province 1</option>
                <option value="Madhesh Pradesh">Madhesh Pradesh</option>
                <option value="Bagmati Pradesh">Bagmati Pradesh</option>
                <option value="Gandaki Pradesh">Gandaki Pradesh</option>
                <option value="Lumbini Pradesh">Lumbini Pradesh</option>
                <option value="Karnali Pradesh">Karnali Pradesh</option>
                <option value="Sudurpashchim Pradesh">Sudurpashchim Pradesh</option>
              </select>
              <ChevronDown size={13} />
            </div>

            <div className="filter-group">
              <span>NPR</span>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                <option value="all">All Prices</option>
                <option value="budget">Budget (&lt; 2,000)</option>
                <option value="mid">Mid-range (2,000–5,000)</option>
                <option value="luxury">Luxury (&gt; 5,000)</option>
              </select>
              <ChevronDown size={13} />
            </div>
          </div>

          <div className="results-count">
            <Mountain size={15} />
            <span className="results-pill">{filteredHomestays.length}</span>
            homestays found
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="listings-label">
          <div className="listings-label-line" />
          <span className="listings-label-text">All Available Stays</span>
          <div className="listings-label-line"
            style={{ background: 'linear-gradient(to left, rgba(244,200,122,0.4), transparent)' }} />
        </div>

        {/* ── GRID ── */}
        <div className="listings-container">
          {filteredHomestays.length === 0 ? (
            <div className="no-results">
              <Mountain size={64} />
              <h3>No homestays found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="homestays-grid">
              {filteredHomestays.map((homestay, index) => (
                <div
                  key={homestay._id}
                  className="homestay-card"
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  {/* Image */}
                  <div className="card-image-wrapper">
                    {homestay.homestayPhotos?.length > 0 ? (
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
                      className={`favorite-btn ${favorites.includes(homestay._id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(homestay._id)}
                    >
                      <Heart size={17} fill={favorites.includes(homestay._id) ? '#e74c3c' : 'none'} />
                    </button>

                    <div className="card-badge">
                      <Star size={11} fill="#fbbf24" stroke="#fbbf24" />
                      Verified
                    </div>

                    {homestay.district && (
                      <span className="card-province-tag">📍 {homestay.district}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="card-content">
                    <h3 className="card-title">{homestay.homestayName}</h3>

                    <div className="card-rating">
                      <Star size={13} fill={homestay.averageRating > 0 ? '#fbbf24' : 'none'} stroke="#fbbf24" />
                      <span className="rating-text">
                        {homestay.averageRating > 0
                          ? homestay.averageRating.toFixed(1)
                          : 'New'}
                        {homestay.reviewCount ? ` (${homestay.reviewCount} reviews)` : ''}
                      </span>
                    </div>

                    <div className="card-location">
                      <MapPin size={13} />
                      <span>{homestay.municipality}, {homestay.district}</span>
                    </div>

                    <p className="card-description">
                      {homestay.description?.substring(0, 95)}
                      {homestay.description?.length > 95 ? '…' : ''}
                    </p>

                    <div className="card-features">
                      <div className="feature">
                        <Home size={13} />
                        <span>{homestay.availableRooms ?? homestay.rooms} Rooms Available</span>
                      </div>
                      <div className="feature">
                        <Users size={13} />
                        <span>{homestay.guests || 2} Guests</span>
                      </div>
                    </div>

                    {homestay.facilities?.length > 0 && (
                      <div className="card-facilities">
                        {homestay.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} className="facility-tag">
                            {f === 'Free Wi-Fi' && <Wifi size={10} />}
                            {f === 'Local Food' && <Coffee size={10} />}
                            {f}
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
                        <span className="price-unit">per night</span>
                      </div>
                      <button
                        className="book-btn"
                        onClick={() => navigate(`/homestay/${homestay._id}`)}
                      >
                        View Details →
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
