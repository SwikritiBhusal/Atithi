import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Home, 
  MapPin, 
  Clock,
  User,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './userBooking.css';

export default function UserBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      // Save the intended destination
      sessionStorage.setItem('redirectAfterLogin', '/my-bookings');
      alert('Please login to view your bookings');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    
    // Fetch bookings for the logged-in user
    fetchBookings(userData.id);
  }, [navigate]);

  const fetchBookings = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/booking/user/${userId}`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = 
      booking.homestayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.homestayLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: 'Confirmed', color: 'success' },
      completed: { label: 'Completed', color: 'info' },
      cancelled: { label: 'Cancelled', color: 'danger' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <span className={`ub-status-badge ${config.color}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
  };

  const stats = getBookingStats();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="ub-loading">Loading your bookings...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="user-bookings-page">
        <div className="ub-container">
          {/* Header */}
          <div className="ub-header">
            <div>
              <h1 className="ub-title">My Bookings</h1>
              <p className="ub-subtitle">View and manage all your homestay reservations</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="ub-stats">
            <div className={`ub-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <div className="stat-icon total">
                <Home size={24} />
              </div>
              <div>
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
            </div>

            <div className={`ub-stat-card ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>
              <div className="stat-icon confirmed">
                <Calendar size={24} />
              </div>
              <div>
                <span className="stat-value">{stats.confirmed}</span>
                <span className="stat-label">Confirmed</span>
              </div>
            </div>

            <div className={`ub-stat-card ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              <div className="stat-icon completed">
                <Home size={24} />
              </div>
              <div>
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className={`ub-stat-card ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
              <div className="stat-icon cancelled">
                <Clock size={24} />
              </div>
              <div>
                <span className="stat-value">{stats.cancelled}</span>
                <span className="stat-label">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="ub-controls">
            <div className="ub-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by homestay name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="ub-filter-group">
              <Filter size={16} />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="ub-no-bookings">
              <Home size={64} />
              <h3>No bookings found</h3>
              <p>{filter === 'all' 
                ? "You haven't made any bookings yet" 
                : `No ${filter} bookings`}
              </p>
              <button className="ub-browse-btn" onClick={() => navigate('/homestayListings')}>
                Browse Homestays
              </button>
            </div>
          ) : (
            <div className="ub-bookings-grid">
              {filteredBookings.map((booking, index) => (
                <div key={booking._id} className="ub-booking-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Homestay Image */}
                  <div className="ub-card-image">
                    {booking.homestayId?.homestayPhotos && booking.homestayId.homestayPhotos.length > 0 ? (
                      <img 
                        src={booking.homestayId.homestayPhotos[0].url} 
                        alt={booking.homestayName}
                      />
                    ) : (
                      <div className="ub-no-image">
                        <Home size={40} />
                      </div>
                    )}
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Card Content */}
                  <div className="ub-card-content">
                    <h3 className="ub-card-title">{booking.homestayName}</h3>
                    
                    <div className="ub-card-location">
                      <MapPin size={14} />
                      <span>{booking.homestayLocation}</span>
                    </div>

                    <div className="ub-card-details">
                      <div className="ub-detail-item">
                        <Calendar size={16} />
                        <div>
                          <span className="detail-label">Check-in</span>
                          <span className="detail-value">{formatDate(booking.checkIn)}</span>
                        </div>
                      </div>

                      <div className="ub-detail-item">
                        <Calendar size={16} />
                        <div>
                          <span className="detail-label">Check-out</span>
                          <span className="detail-value">{formatDate(booking.checkOut)}</span>
                        </div>
                      </div>

                      <div className="ub-detail-item">
                        <Clock size={16} />
                        <div>
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{booking.nights} Night(s)</span>
                        </div>
                      </div>

                      <div className="ub-detail-item">
                        <Home size={16} />
                        <div>
                          <span className="detail-label">Rooms</span>
                          <span className="detail-value">{booking.rooms} Room(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="ub-card-footer">
                      <div className="ub-price-section">
                        <span className="price-label">Total Paid</span>
                        <span className="price-value">NPR {booking.advancePayment.toLocaleString()}</span>
                        {booking.remainingPayment > 0 && (
                          <span className="price-remaining">+{booking.remainingPayment.toLocaleString()} at property</span>
                        )}
                      </div>

                      <button 
                        className="ub-view-btn"
                        onClick={() => navigate(`/booking/${booking.bookingId}`, { state: { booking } })}
                      >
                        View Details
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <div className="ub-card-meta">
                      <span className="booking-id">Ref: {booking.bookingId}</span>
                      <span className="booking-date">Booked on {formatDate(booking.createdAt)}</span>
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