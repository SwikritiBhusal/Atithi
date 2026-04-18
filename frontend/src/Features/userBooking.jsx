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
  ChevronRight,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAppToast } from '../components/toast';
import './userBooking.css';

export default function UserBookings() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  // ⭐ NEW: Cancellation states
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      sessionStorage.setItem('redirectAfterLogin', '/my-bookings');
      toast.warning('Login Required', 'Please login to view your bookings.');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    
    fetchBookings(userData.id);
  }, [navigate, toast]);

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

  // ⭐ NEW: Cancel booking function
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?\n\n• Within 2 hours: 100% refund\n• After 2 hours: 80% refund (20% fee)')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/booking/cancel/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: cancellationReason || 'No reason provided'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          result.info.title || 'Booking Cancelled',
          `${result.info.message} ${result.info.refundTimeline ? `(${result.info.refundTimeline})` : ''}`.trim(),
          6000
        );
        
        fetchBookings(user.id);
        setCancellingBookingId(null);
        setCancellationReason('');
      } else {
        toast.error('Cancellation Failed', result.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error('Cancellation Failed', 'Failed to cancel booking');
    }
  };

  // ⭐ NEW: Check if booking can be cancelled
  const canCancelBooking = (booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    
    return today < checkInDate;
  };

  // ⭐ NEW: Calculate refund preview
  const getRefundAmount = (booking) => {
    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const hoursSinceBooking = (now - bookingCreatedAt) / (1000 * 60 * 60);

    if (hoursSinceBooking <= 2) {
      return {
        amount: booking.advancePayment,
        percentage: 100,
        fee: 0
      };
    } else {
      return {
        amount: Math.round(booking.advancePayment * 0.8),
        percentage: 80,
        fee: Math.round(booking.advancePayment * 0.2)
      };
    }
  };

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
          <div className="ub-header">
            <div>
              <h1 className="ub-title">My Bookings</h1>
              <p className="ub-subtitle">View and manage all your homestay reservations</p>
            </div>
          </div>

          {/* ⭐ NEW: Policy Info */}
          <div className="ub-policy-info">
            <Info size={16} />
            <span>
              <strong>Cancellation Policy:</strong> Within 2 hours = 100% refund. After 2 hours, before check-in = 80% refund (20% fee). No cancellation on/after check-in.
            </span>
          </div>

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
              {filteredBookings.map((booking, index) => {
                const refundInfo = getRefundAmount(booking);
                
                return (
                  <div key={booking._id} className="ub-booking-card" style={{ animationDelay: `${index * 0.1}s` }}>
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

                      {/* ⭐ NEW: Cancellation Info Box */}
                      {booking.status === 'cancelled' && booking.cancellation && (
                        <div className="ub-cancellation-box">
                          <div className="ub-cancellation-header">
                            <XCircle size={16} />
                            <span>Cancelled</span>
                          </div>
                          <div className="ub-cancellation-body">
                            <div className="ub-cancel-row">
                              <span className="label">Cancelled:</span>
                              <span className="value">
                                {new Date(booking.cancellation.cancelledAt).toLocaleDateString()}
                              </span>
                            </div>
                            {booking.cancellation.reason && (
                              <div className="ub-cancel-row">
                                <span className="label">Reason:</span>
                                <span className="value">{booking.cancellation.reason}</span>
                              </div>
                            )}
                            <div className="ub-refund-info">
                              <div className="ub-refund-row">
                                <span>Refund: NPR {booking.cancellation.refundAmount?.toLocaleString()} ({booking.cancellation.refundPercentage}%)</span>
                              </div>
                              <div className="ub-refund-status">
                                {booking.cancellation.refundStatus === 'pending' && '⏳ Processing within 24 hours'}
                                {booking.cancellation.refundStatus === 'processing' && '🔄 Processing'}
                                {booking.cancellation.refundStatus === 'completed' && '✅ Completed'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="ub-card-footer">
                        <div className="ub-price-section">
                          <span className="price-label">Total Paid</span>
                          <span className="price-value">NPR {booking.advancePayment.toLocaleString()}</span>
                          {booking.remainingPayment > 0 && (
                            <span className="price-remaining">+{booking.remainingPayment.toLocaleString()} at property</span>
                          )}
                        </div>
                      </div>

                      {/*NEW: Cancel Button */}
                      {canCancelBooking(booking) && (
                        <div className="ub-cancel-section">
                          {cancellingBookingId === booking._id ? (
                            <div className="ub-cancel-form">
                              <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="ub-cancel-input"
                              />
                              <div className="ub-refund-preview">
                                <div className="refund-amount">NPR {refundInfo.amount.toLocaleString()}</div>
                                <div className="refund-percent">{refundInfo.percentage}% refund</div>
                                {refundInfo.fee > 0 && (
                                  <div className="refund-fee">Fee: NPR {refundInfo.fee.toLocaleString()}</div>
                                )}
                              </div>
                              <div className="ub-cancel-btns">
                                <button
                                  className="btn-confirm-cancel"
                                  onClick={() => handleCancelBooking(booking._id)}
                                >
                                  Confirm Cancel
                                </button>
                                <button
                                  className="btn-cancel-action"
                                  onClick={() => {
                                    setCancellingBookingId(null);
                                    setCancellationReason('');
                                  }}
                                >
                                  Nevermind
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="ub-cancel-btn"
                              onClick={() => setCancellingBookingId(booking._id)}
                            >
                              <XCircle size={16} />
                              Cancel Booking
                              <span className="refund-badge">{refundInfo.percentage}%</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="ub-card-meta">
                        <span className="booking-id">Ref: {booking.bookingId}</span>
                        <span className="booking-date">Booked on {formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
