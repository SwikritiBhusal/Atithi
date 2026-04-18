import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Home, 
  MapPin, 
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

import './hostBookings.css';
import { useAppToast } from '../../components/toast';

export default function HostBookings() {
  const toast = useAppToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);


  useEffect(() => {
    fetchBookings();
  }, []);



  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      
      const response = await fetch(`http://localhost:5000/api/booking/host/${user.id}`, {
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

  const handleDelete = async (bookingId, bookingRef) => {
    const reason = prompt('Why are you deleting this booking? (Optional - for records):');
    
    if (!window.confirm(`Are you sure you want to DELETE booking ${bookingRef}?\n\nThis action cannot be undone!`)) {
      return;
    }

    setProcessingId(bookingId);
    try {
      const response = await fetch(`http://localhost:5000/api/booking/delete/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || 'Host emergency' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Booking Deleted', 'Booking deleted successfully.');
        addNotification({
          title: 'Booking canceled',
          message: `Booking ${bookingRef} was canceled and removed from your list.`,
        });
        fetchBookings(); // Refresh list
      } else {
        toast.error('Delete Failed', 'Failed to delete booking.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Delete Failed', 'Error deleting booking.');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = 
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: 'Confirmed', color: 'success', icon: <CheckCircle size={14} /> },
      cancelled: { label: 'Cancelled', color: 'danger', icon: <XCircle size={14} /> },
      completed: { label: 'Completed', color: 'info', icon: <CheckCircle size={14} /> }
    };

    const config = statusConfig[status] || { label: status, color: 'default', icon: <Clock size={14} /> };
    return (
      <span className={`hb-status-badge ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
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
    return <div className="hb-loading">Loading bookings...</div>;
  }

  return (
    <div className="host-bookings">
      {/* Header */}
      <div className="hb-header">
        <div>
          <h2 className="hb-title">My Bookings</h2>
          <p className="hb-subtitle">View and manage your homestay bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="hb-stats">
        <div className={`hb-stat-card ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <div className="stat-icon total">
            <Home size={24} />
          </div>
          <div>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>

        <div className={`hb-stat-card ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>
          <div className="stat-icon confirmed">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="stat-value">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>

        <div className={`hb-stat-card ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          <div className="stat-icon completed">
            <Calendar size={24} />
          </div>
          <div>
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className={`hb-stat-card ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
          <div className="stat-icon cancelled">
            <XCircle size={24} />
          </div>
          <div>
            <span className="stat-value">{stats.cancelled}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="hb-controls">
        <div className="hb-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by guest name, email, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hb-filter-group">
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
        <div className="hb-no-bookings">
          <Home size={64} />
          <h3>No bookings found</h3>
          <p>{filter === 'all' 
            ? "You don't have any bookings yet" 
            : `No ${filter} bookings`}
          </p>
        </div>
      ) : (
        <div className="hb-bookings-list">
          {filteredBookings.map((booking, index) => (
            <div key={booking._id} className="hb-booking-card" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Card Header */}
              <div className="hb-card-header">
                <div>
                  <h3 className="hb-booking-id">Booking #{booking.bookingId}</h3>
                  <span className="hb-booking-date">Received on {formatDate(booking.createdAt)}</span>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="hb-card-body">
                {/* Guest Information */}
                <div className="hb-section">
                  <h4 className="hb-section-title">
                    <User size={18} />
                    Guest Information
                  </h4>
                  <div className="hb-info-grid">
                    <div className="hb-info-item">
                      <User size={14} />
                      <span>{booking.guestName}</span>
                    </div>
                    <div className="hb-info-item">
                      <Mail size={14} />
                      <span>{booking.guestEmail}</span>
                    </div>
                    <div className="hb-info-item">
                      <Phone size={14} />
                      <span>{booking.guestPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="hb-section">
                  <h4 className="hb-section-title">
                    <Calendar size={18} />
                    Booking Details
                  </h4>
                  <div className="hb-details-grid">
                    <div className="hb-detail-item">
                      <span className="detail-label">Check-in</span>
                      <span className="detail-value">{formatDate(booking.checkIn)}</span>
                    </div>
                    <div className="hb-detail-item">
                      <span className="detail-label">Check-out</span>
                      <span className="detail-value">{formatDate(booking.checkOut)}</span>
                    </div>
                    <div className="hb-detail-item">
                      <span className="detail-label">Nights</span>
                      <span className="detail-value">{booking.nights}</span>
                    </div>
                    <div className="hb-detail-item">
                      <span className="detail-label">Rooms</span>
                      <span className="detail-value">{booking.rooms}</span>
                    </div>
                    <div className="hb-detail-item">
                      <span className="detail-label">Guests</span>
                      <span className="detail-value">{booking.guests}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="hb-section">
                  <h4 className="hb-section-title">Payment Summary</h4>
                  <div className="hb-payment-info">
                    <div className="payment-row">
                      <span>Total Amount:</span>
                      <span className="amount">NPR {booking.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="payment-row highlight">
                      <span>Paid (Advance):</span>
                      <span className="amount">NPR {booking.advancePayment.toLocaleString()}</span>
                    </div>
                    {booking.remainingPayment > 0 && (
                      <div className="payment-row">
                        <span>Due at Property:</span>
                        <span className="amount">NPR {booking.remainingPayment.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="payment-row small">
                      <span>Transaction ID:</span>
                      <span className="txn-id">{booking.khaltiTransactionId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button (for emergencies only) */}
              {booking.status === 'confirmed' && (
                <div className="hb-card-actions">
                  <button 
                    className="hb-delete-btn"
                    onClick={() => handleDelete(booking._id, booking.bookingId)}
                    disabled={processingId === booking._id}
                  >
                    <XCircle size={18} />
                    {processingId === booking._id ? 'Deleting...' : 'Delete Booking (Emergency Only)'}
                  </button>
                </div>
              )}

              {booking.status === 'cancelled' && (
                <div className="hb-cancellation-note">
                  <strong>Status:</strong> This booking was cancelled
                  {booking.cancellationReason && ` - Reason: ${booking.cancellationReason}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}