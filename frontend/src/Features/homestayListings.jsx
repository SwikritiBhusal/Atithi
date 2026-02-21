import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, Home, Star, Coffee, Wifi, Mountain, Heart, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import './homestayListings.css';

export default function HomestayListings() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState([]);
  const [filteredHomestays, setFilteredHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Check if user is logged in
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('🔒 Please login to view homestay listings!');
      navigate('/login', { state: { from: '/homestays' } });
      return;
    }
    fetchHomestays();
  }, [navigate]);

  // Fetch approved homestays
  const fetchHomestays = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homestay/approved', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setHomestays(result.homestays);
        setFilteredHomestays(result.homestays);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter homestays
  useEffect(() => {
    let filtered = homestays;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.homestayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.municipality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Province filter
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(h => h.province === selectedProvince);
    }

    // Price filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(h => {
        if (priceRange === 'budget') return h.price < 2000;
        if (priceRange === 'mid') return h.price >= 2000 && h.price < 5000;
        if (priceRange === 'luxury') return h.price >= 5000;
        return true;
      });
    }

    setFilteredHomestays(filtered);
  }, [searchTerm, selectedProvince, priceRange, homestays]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleBookNow = (homestayId) => {
    navigate(`/homestay/${homestayId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="listings-loading">
          <Mountain className="loading-icon" size={48} />
          <p>Loading mountain retreats...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="listings-page">
        {/* Hero Section */}
        <div className="listings-hero">
          <div className="hero-content">
            <h1 className="hero-title">Discover Authentic Homestays</h1>
            <p className="hero-subtitle">Experience the warmth of Nepali hospitality in the heart of the Himalayas</p>
          </div>
          <div className="hero-pattern"></div>
        </div>

        {/* Search & Filters */}
        <div className="listings-container">
          <div className="search-section">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by location, homestay name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <div className="filter-group">
                <MapPin size={16} />
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                  <option value="all">All Provinces</option>
                  <option value="Province 1">Province 1</option>
                  <option value="Madhesh Pradesh">Madhesh Pradesh</option>
                  <option value="Bagmati Pradesh">Bagmati Pradesh</option>
                  <option value="Gandaki Pradesh">Gandaki Pradesh</option>
                  <option value="Lumbini Pradesh">Lumbini Pradesh</option>
                  <option value="Karnali Pradesh">Karnali Pradesh</option>
                  <option value="Sudurpashchim Pradesh">Sudurpashchim Pradesh</option>
                </select>
                <ChevronDown size={16} />
              </div>

              <div className="filter-group">
                <span>NPR</span>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (&lt; NPR 2,000)</option>
                  <option value="mid">Mid-range (NPR 2,000 - 5,000)</option>
                  <option value="luxury">Luxury (&gt; NPR 5,000)</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </div>

            <div className="results-count">
              <Mountain size={18} />
              <span>{filteredHomestays.length} homestays found</span>
            </div>
          </div>

          {/* Listings Grid */}
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
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Section */}
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
                      className={`favorite-btn ${favorites.includes(homestay._id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(homestay._id)}
                    >
                      <Heart size={20} fill={favorites.includes(homestay._id) ? '#e74c3c' : 'none'} />
                    </button>
                    <div className="card-badge">
                      <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="card-content">
                    <h3 className="card-title">{homestay.homestayName}</h3>
                    
                    <div className="card-location">
                      <MapPin size={14} />
                      <span>{homestay.municipality}, {homestay.district}</span>
                    </div>

                    <p className="card-description">
                      {homestay.description?.substring(0, 100)}
                      {homestay.description?.length > 100 ? '...' : ''}
                    </p>

                    {/* Features */}
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

                    {/* Facilities */}
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

                    {/* Price & CTA */}
                    <div className="card-footer">
                      <div className="price-section">
                        <span className="price">NPR {homestay.price?.toLocaleString()}</span>
                        <span className="price-unit">/ night</span>
                      </div>
                      <button
                        className="book-btn"
                        onClick={() => handleBookNow(homestay._id)}
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