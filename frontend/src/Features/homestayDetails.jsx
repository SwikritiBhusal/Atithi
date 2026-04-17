import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Home, Users, Clock, Check, ArrowLeft, Calendar,
  Wifi, Coffee, Mountain, Sun, Wind, Shield, ChevronLeft, ChevronRight,
  Phone, Mail, User, Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import './homestayDetails.css';

export default function HomestayDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAvailability, setShowAvailability] = useState(false); // ← Added
  const [availability, setAvailability] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });

  const [userId, setUserId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user?._id || user?.id || null);
    }
    fetchHomestayDetails();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchAvailability = async () => {
      try {
        const params = new URLSearchParams();
        if (bookingData.checkIn && bookingData.checkOut) {
          params.set('checkIn', bookingData.checkIn);
          params.set('checkOut', bookingData.checkOut);
        }

        const query = params.toString();
        const response = await fetch(
          `http://localhost:5000/api/homestay/${id}/availability${query ? `?${query}` : ''}`,
          { credentials: 'include' }
        );
        const result = await response.json();

        if (result.success) {
          setAvailability(result.availability);
        }
      } catch (error) {
        console.error('Availability error:', error);
      }
    };

    fetchAvailability();
  }, [bookingData.checkIn, bookingData.checkOut, id]);

  const fetchHomestayDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/homestay/${id}`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setHomestay(result.homestay);

        // If user already left a review, prefill it
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const currentUserId = parsed?._id || parsed?.id;
          if (currentUserId) {
            const existingReview = result.homestay.reviews?.find(
              (r) => r.user === currentUserId || r.user?._id === currentUserId
            );
            if (existingReview) {
              setReviewRating(existingReview.rating);
              setReviewComment(existingReview.comment || '');
            }
          }
        }
      } else {
        alert('Homestay not found!');
        navigate('/homestays');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load homestay details');
      navigate('/homestays');
    } finally {
      setLoading(false);
    }
  };

  const facilityIcons = {
    'Free Wi-Fi': <Wifi size={18} />,
    'Local Food': <Coffee size={18} />,
    'Nature View': <Mountain size={18} />,
    'Hot Water': <Sun size={18} />,
    'Peaceful Environment': <Wind size={18} />,
    'Cultural Experience': <Shield size={18} />
  };


  const getCrispImageUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto:best,f_auto,w_1920,dpr_auto/');
};

const getThumbnailUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto:best,f_auto,w_300,h_200,c_fill/');
};

  const nextImage = () => {
    if (homestay?.homestayPhotos?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === homestay.homestayPhotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (homestay?.homestayPhotos?.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? homestay.homestayPhotos.length - 1 : prev - 1
      );
    }
  };

  const handleCheckAvailability = () => {
    setShowAvailability(true);
    
    // Scrolling to availability section
    setTimeout(() => {
      document.getElementById('availability-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const currentAvailableRooms = availability?.availableRooms ?? homestay?.availableRooms ?? Math.max(
    0,
    Number(homestay?.rooms || 0) - Number(homestay?.blockedRooms || 0)
  );

  useEffect(() => {
    if (currentAvailableRooms <= 0 && bookingData.rooms !== 0) {
      setBookingData((prev) => ({
        ...prev,
        rooms: 0
      }));
      return;
    }

    if (currentAvailableRooms > 0 && (bookingData.rooms === 0 || bookingData.rooms > currentAvailableRooms)) {
      setBookingData((prev) => ({
        ...prev,
        rooms: currentAvailableRooms
      }));
    }
  }, [bookingData.rooms, currentAvailableRooms]);

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    return nights * bookingData.rooms * (homestay?.price || 0);
  };

  const handleBookNow = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates!');
      return;
    }
    
    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      alert('Check-out date must be after check-in date!');
      return;
    }

    if (currentAvailableRooms <= 0 || bookingData.rooms <= 0) {
      alert('No rooms are available for the selected dates.');
      return;
    }
    
    if (bookingData.rooms > currentAvailableRooms) {
      alert(`Only ${currentAvailableRooms} room(s) are available for the selected dates!`);
      return;
    }
    
    // Navigate to booking confirmation
    navigate(`/homestay/${id}/confirm`, { 
      state: { 
        homestay,
        bookingData,
        totalPrice: calculateTotalPrice(),
        nights 
      } 
    });
  };

  const handleReviewSubmit = async () => {
    if (!userId) {
      alert('Please login to submit a review.');
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('Please provide a rating between 1 and 5.');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch(`http://localhost:5000/api/homestay/${id}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });

      const result = await response.json();
      if (result.success && result.homestay) {
        setHomestay(result.homestay);
        setReviewComment('');
        alert('Your review has been saved!');
      } else {
        alert(result.message || 'Could not submit review.');
      }
    } catch (error) {
      console.error('Review submit error:', error);
      alert('Something went wrong while submitting your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStarInputs = () => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${i <= reviewRating ? 'active' : ''}`}
          onClick={() => setReviewRating(i)}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <Star size={18} fill={i <= reviewRating ? '#fbbf24' : 'none'} stroke="#fbbf24" />
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="details-loading">Loading...</div>
      </>
    );
  }

  if (!homestay) {
    return (
      <>
        <Navbar />
        <div className="details-loading">Homestay not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="details-page">
        {/* Floating background elements - flags, leaves, mountains */}
        <div className="bg-flags">
          {[...Array(15)].map((_, i) => <div key={i} className="bg-flag" />)}
        </div>
        {/* Back Button */}
        <div className="details-container">
          <button className="back-btn" onClick={() => navigate('/homestayListings')}>
            <ArrowLeft size={20} />
            Back to Listings
          </button>

          {/* Header */}
          <div className="details-header">
            <div>
              <h1 className="details-title">{homestay.homestayName}</h1>
              <div className="details-location">
                <MapPin size={18} />
                <span>{homestay.municipality}, {homestay.district}, {homestay.province}</span>
              </div>
            </div>
            <div className="details-price-badge">
              <span className="price-large">NPR {homestay.price?.toLocaleString()}</span>
              <span className="price-small">per night</span>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="photo-gallery">
            {homestay.homestayPhotos && homestay.homestayPhotos.length > 0 ? (
              <>
                <div className="main-photo">
                  {/* ✅ CHANGE 2: getCrispImageUrl used on main photo */}
                  <img 
                    src={getCrispImageUrl(homestay.homestayPhotos[currentImageIndex].url)}
                    alt={`${homestay.homestayName} - View ${currentImageIndex + 1}`}
                  />
                  {homestay.homestayPhotos.length > 1 && (
                    <>
                      <button className="photo-nav prev" onClick={prevImage}>
                        <ChevronLeft size={24} />
                      </button>
                      <button className="photo-nav next" onClick={nextImage}>
                        <ChevronRight size={24} />
                      </button>
                      <div className="photo-counter">
                        {currentImageIndex + 1} / {homestay.homestayPhotos.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {homestay.homestayPhotos.length > 1 && (
                  <div className="photo-thumbnails">
                    {homestay.homestayPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        {/* ✅ CHANGE 3: getCrispImageUrl used on thumbnails */}
                        <img src={getThumbnailUrl(photo.url)} alt={`Thumbnail ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-photos">
                <Home size={64} />
                <p>No photos available</p>
              </div>
            )}
          </div>

          <div className="details-content">
            {/* Main Content */}
            <div className="main-content">
              {/* Quick Info */}
              <div className="quick-info">
                <div className="info-item">
                  <Home size={20} />
                  <div>
                    <span className="info-label">Rooms</span>
                    <span className="info-value">{currentAvailableRooms} Available</span>
                  </div>
                </div>
                <div className="info-item">
                  <Users size={20} />
                  <div>
                    <span className="info-label">Capacity</span>
                    <span className="info-value">{homestay.guests || 2} Guests per room</span>
                  </div>
                </div>
                <div className="info-item">
                  <Clock size={20} />
                  <div>
                    <span className="info-label">Check-in</span>
                    <span className="info-value">{homestay.checkIn || '2:00 PM'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Clock size={20} />
                  <div>
                    <span className="info-label">Check-out</span>
                    <span className="info-value">{homestay.checkOut || '11:00 AM'}</span>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <section className="details-section">
                <h2>About This Homestay</h2>
                <p className="about-text">
                  {homestay.description || 'Experience authentic Nepali hospitality in this beautiful homestay.'}
                </p>
              </section>

              {/* Special Features Section */}
              {homestay.specialFeatures && homestay.specialFeatures.length > 0 && (
                <section className="details-section special-features-section">
                  <h2>✨ What Makes This Stay Special</h2>
                  <div className="special-features-list">
                    {homestay.specialFeatures.map((feature, index) => (
                      <div key={index} className="special-feature-item">
                        <span className="feature-icon">⭐</span>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Amenities */}
              <section className="details-section">
                <h2>Amenities & Facilities</h2>
                <div className="amenities-grid">
                  {homestay.facilities && homestay.facilities.length > 0 ? (
                    homestay.facilities.map((facility, index) => (
                      <div key={index} className="amenity-item">
                        <div className="amenity-icon">
                          {facilityIcons[facility] || <Check size={18} />}
                        </div>
                        <span>{facility}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No facilities listed</p>
                  )}
                </div>
              </section>

              {/* Location Details */}
              <section className="details-section">
                <h2>Location</h2>
                <div className="location-details">
                  <div className="location-item">
                    <span className="location-label">Province:</span>
                    <span className="location-value">{homestay.province}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">District:</span>
                    <span className="location-value">{homestay.district}</span>
                  </div>
                  <div className="location-item">
                    <span className="location-label">Municipality:</span>
                    <span className="location-value">{homestay.municipality}</span>
                  </div>
                  {homestay.ward && (
                    <div className="location-item">
                      <span className="location-label">Ward:</span>
                      <span className="location-value">{homestay.ward}</span>
                    </div>
                  )}
                </div>
              </section>

{/* House Rules Section */}
<section className="details-section house-rules-section">
  <h2>📋 House Rules</h2>
  <div className="house-rules-grid">
    <div className="rule-item">
      <span className={`rule-icon ${homestay.smokingAllowed ? 'allowed' : 'not-allowed'}`}>
        {homestay.smokingAllowed ? '✓' : '✗'}
      </span>
      <div>
        <span className="rule-label">Smoking</span>
        <span className="rule-status">{homestay.smokingAllowed ? 'Allowed' : 'Not Allowed'}</span>
      </div>
    </div>
    <div className="rule-item">
      <span className={`rule-icon ${homestay.petsAllowed ? 'allowed' : 'not-allowed'}`}>
        {homestay.petsAllowed ? '✓' : '✗'}
      </span>
      <div>
        <span className="rule-label">Pets</span>
        <span className="rule-status">{homestay.petsAllowed ? 'Allowed' : 'Not Allowed'}</span>
      </div>
    </div>
    <div className="rule-item">
      <span className={`rule-icon ${homestay.childrenAllowed ? 'allowed' : 'not-allowed'}`}>
        {homestay.childrenAllowed ? '✓' : '✗'}
      </span>
      <div>
        <span className="rule-label">Children</span>
        <span className="rule-status">{homestay.childrenAllowed ? 'Friendly' : 'Adults Only'}</span>
      </div>
    </div>
  </div>
  {homestay.additionalRules && (
    <div className="additional-rules">
      <h4>Additional Rules</h4>
      <ul>
        {homestay.additionalRules.split('\n').filter(rule => rule.trim()).map((rule, index) => (
          <li key={index}>{rule.trim()}</li>
        ))}
      </ul>
    </div>
  )}
</section>

{/* Cancellation Policy Section */}
<section className="details-section cancellation-section">
  <h2>🔄 Cancellation Policy</h2>
  <div className="policy-card">
    {homestay.cancellationPolicy === 'flexible' && (
      <>
        <div className="policy-badge flexible">Flexible</div>
        <p className="policy-text">
          ✓ Free cancellation up to 7 days before check-in<br/>
          ✓ Full refund if cancelled more than 7 days in advance<br/>
          ✓ 50% refund if cancelled 3-7 days before check-in<br/>
          ✗ No refund within 3 days of check-in
        </p>
      </>
    )}
    {homestay.cancellationPolicy === 'moderate' && (
      <>
        <div className="policy-badge moderate">Moderate</div>
        <p className="policy-text">
          ✓ Free cancellation up to 14 days before check-in<br/>
          ✓ 50% refund if cancelled 7-14 days before check-in<br/>
          ✗ No refund within 7 days of check-in
        </p>
      </>
    )}
    {homestay.cancellationPolicy === 'strict' && (
      <>
        <div className="policy-badge strict">Strict</div>
        <p className="policy-text">
          ✗ No refunds within 30 days of check-in<br/>
          ✓ 50% refund if cancelled more than 30 days in advance<br/>
          ⚠ Please plan your trip carefully
        </p>
      </>
    )}
  </div>
</section>

              {/* Host Information */}
              <section className="details-section">
                <h2>Host Information</h2>
                <div className="host-info">
                  <div className="host-avatar">
                    {homestay.ownerPhoto?.url ? (
                      <img src={homestay.ownerPhoto.url} alt={homestay.ownerName} className="host-photo" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="host-details">
                    <h3>Hosted by {homestay.ownerName}</h3>
                    <div className="host-contact">
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{homestay.email}</span>
                      </div>
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{homestay.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reviews Section */}
              <section className="details-section reviews-section">
                <h2>Reviews</h2>

                <div className="review-summary">
                  <div className="review-score">
                    <Star size={20} fill={homestay.averageRating > 0 ? '#fbbf24' : 'none'} stroke="#fbbf24" />
                    <span className="score-text">
                      {homestay.averageRating > 0 ? homestay.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="review-count">
                      {homestay.reviewCount ? `(${homestay.reviewCount} review${homestay.reviewCount === 1 ? '' : 's'})` : '(No reviews yet)'}
                    </span>
                  </div>
                </div>

                {/* Leave a Review */}
                <div className="review-form">
                  <h3>{userId ? 'Leave a review' : 'Log in to leave a review'}</h3>
                  <div className="rating-select">
                    {renderStarInputs()}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share what you loved about this stay..."
                    rows={4}
                    disabled={!userId}
                  />
                  <button
                    className="submit-review-btn"
                    onClick={handleReviewSubmit}
                    disabled={!userId || isSubmittingReview}
                  >
                    {isSubmittingReview ? 'Saving…' : 'Submit Review'}
                  </button>
                </div>

                {/* Review List */}
                <div className="reviews-list">
                  {homestay.reviews && homestay.reviews.length > 0 ? (
                    homestay.reviews
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((review) => (
                        <div key={review._id || review.createdAt} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-name">{review.name}</div>
                            <div className="review-rating">
                              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                              <span>{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          {review.comment && <p className="review-comment">{review.comment}</p>}
                          <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                  ) : (
                    <p className="no-reviews">Be the first to review this homestay!</p>
                  )}
                </div>
              </section>

              {/* Availability Section */}
              {showAvailability && (
                <section className="details-section availability-section" id="availability-section">
                  <h2>Check Availability & Book</h2>
                  
                  <div className="booking-form">
                    <div className="form-row">
                      <div className="form-field">
                        <label>Check-in Date</label>
                        <input
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) => handleBookingChange('checkIn', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="form-field">
                        <label>Check-out Date</label>
                        <input
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) => handleBookingChange('checkOut', e.target.value)}
                          min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label>Number of Rooms</label>
                        <select
                          value={bookingData.rooms}
                          onChange={(e) => handleBookingChange('rooms', parseInt(e.target.value))}
                          disabled={currentAvailableRooms <= 0}
                        >
                          {currentAvailableRooms <= 0 ? (
                            <option value={0}>No rooms available</option>
                          ) : (
                            [...Array(currentAvailableRooms)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i === 0 ? 'Room' : 'Rooms'}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Number of Guests</label>
                        <select
                          value={bookingData.guests}
                          onChange={(e) => handleBookingChange('guests', parseInt(e.target.value))}
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="availability-meta">
                      <span>{currentAvailableRooms} room(s) available</span>
                      {availability?.blockedRooms ? <span>{availability.blockedRooms} blocked by host</span> : null}
                    </div>

                    {/* Price Breakdown */}
                    {bookingData.checkIn && bookingData.checkOut && (
                      <div className="price-breakdown">
                        <div className="breakdown-row">
                          <span>NPR {homestay.price?.toLocaleString()} × {bookingData.rooms} room(s) × {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} night(s)</span>
                          <span>NPR {calculateTotalPrice().toLocaleString()}</span>
                        </div>
                        <div className="breakdown-row total">
                          <span>Total</span>
                          <span>NPR {calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <button className="book-now-btn" onClick={handleBookNow} disabled={currentAvailableRooms <= 0}>
                      Book Now
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="booking-sidebar">
              <div className="booking-card">
                <div className="booking-price">
                  <span className="price">NPR {homestay.price?.toLocaleString()}</span>
                  <span className="price-unit">per night</span>
                </div>

                <div className="booking-info">
                  <div className="booking-item">
                    <Home size={16} />
                    <span>{currentAvailableRooms} rooms available</span>
                  </div>
                  <div className="booking-item">
                    <Users size={16} />
                    <span>Up to {homestay.guests || 2} guests per room</span>
                  </div>
                </div>

                <button className="availability-btn" onClick={handleCheckAvailability}>
                  <Calendar size={18} />
                  Check Availability
                </button>

                <p className="booking-note">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
