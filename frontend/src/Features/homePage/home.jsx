import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from "../../components/Navbar";
import video1 from "../../assets/Videos/Tourism.mp4";
import video2 from "../../assets/Videos/Tourism (1).mp4";
import SmartRecommendation from '../../Features/SmartRecommendation';
import { Toast, useToast } from '../../components/toast';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80',
    label: 'Nagarkot, Bhaktapur',
    tagline: 'Wake up to Himalayan sunrises'
  },
  {
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1920&q=80',
    label: 'Pokhara, Kaski',
    tagline: 'Lakeside serenity awaits'
  },
  {
    image: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?w=1920&q=80',
    label: 'Ghandruk, Kaski',
    tagline: 'Live the Gurung heritage'
  }
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [featuredStays, setFeaturedStays] = useState([]);
  const [loadingStays, setLoadingStays] = useState(true);
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const isLoggedIn = !!localStorage.getItem('user');

  // ─── Fetch featured stays from backend ───────────────────────────────────
  useEffect(() => {
    const fetchStays = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/homestay/approved');
        const data = await res.json();
        if (data.success) {
          const top3 = [...data.homestays]
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 3);
          setFeaturedStays(top3);
        }
      } catch (err) {
        console.error('Failed to fetch stays:', err);
      } finally {
        setLoadingStays(false);
      }
    };
    fetchStays();
  }, []);

  // ─── Hero slideshow ───────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [current]);

  const goToNext = () => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % heroSlides.length);
      setTransitioning(false);
    }, 800);
  };

  const goTo = (idx) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 800);
  };

  const handleViewDetails = (stayId) => {
    if (!isLoggedIn) {
      toast.info('Login Required', 'Please login or register to explore homestays!');
      setTimeout(() => navigate('/login', {
        state: { from: '/homestayListings', message: 'Please login or register to explore homestays!' }
      }), 1500);
    } else {
      navigate(`/homestay/${stayId}`);
    }
  };

  const handleAIMatch = () => {
    if (!isLoggedIn) {
      toast.info('Login Required', 'Please login or register to find your perfect match!');
      setTimeout(() => navigate('/login', {
        state: { from: '/', message: 'Please login or register to find your perfect match!' }
      }), 1500);
    } else {
      setShowQuestionnaire(true);
    }
  };

  const handleExploreStays = () => {
    if (!isLoggedIn) {
      toast.info('Login Required', 'Please login or register to explore homestays!');
      setTimeout(() => navigate('/login', {
        state: { from: '/homestayListings', message: 'Please login or register to explore homestays!' }
      }), 1500);
    } else {
      navigate('/homestayListings');
    }
  };

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="app">

        {/* ═══════════════════════════════════════
            HERO — sliding background images
        ═══════════════════════════════════════ */}
        <section className="hero-wrap">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`hero-slide ${i === current ? 'active' : 'inactive'}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}

          <div className="hero-overlay-grad" />

          <div className="hero-content-wrap">
            <div className="hero-location-pill">
              <span className="dot" />
              {heroSlides[current].label}
            </div>
            <h1 className="hero-heading">
              Find Your<br /><em>Perfect</em> Homestay<br />in Nepal
            </h1>
            <p className="hero-sub">Book local, authentic &amp; verified stays across Nepal</p>
            <p className="hero-tagline">{heroSlides[current].tagline}</p>
            <div className="hero-cta-row">
              <button className="hero-explore-btn" onClick={handleExploreStays}>
                Explore Stays
              </button>
            </div>
          </div>

          <div className="slide-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`slide-dot ${i === current ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="slide-counter">
            <strong>{String(current + 1).padStart(2, '0')}</strong> / {String(heroSlides.length).padStart(2, '0')}
          </div>

          <div className="hero-progress" key={current} />
        </section>

        {/* ═══════════════════════════════════════
            FLOATING AI BUTTON
        ═══════════════════════════════════════ */}
        <div className="ai-float-trigger">
          <button
            className="ai-float-btn"
            onClick={handleAIMatch}
            aria-label="AI Recommendation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.636 5.636l1.414 1.414M16.95 16.95l1.414 1.414M5.636 18.364l1.414-1.414M16.95 7.05l1.414-1.414" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>
          <span className="ai-float-label">AI Match</span>
        </div>

        {showQuestionnaire && (
          <SmartRecommendation onClose={() => setShowQuestionnaire(false)} />
        )}

        {/* ═══════════════════════════════════════
            VIDEO SHOWCASE
        ═══════════════════════════════════════ */}
        <section className="video-section">
          <div className="video-section-inner">
            <div className="video-card">
              <div className="video-card-inner">
                <video autoPlay loop muted playsInline>
                  <source src={video1} type="video/mp4" />
                </video>
                <div className="video-card-overlay">
                  <span className="video-card-tag">Local Tourism</span>
                  <p className="video-card-desc">Experience authentic Nepali hospitality</p>
                </div>
              </div>
            </div>

            <div className="video-card">
              <div className="video-card-inner">
                <video autoPlay loop muted playsInline>
                  <source src={video2} type="video/mp4" />
                </video>
                <div className="video-card-overlay">
                  <span className="video-card-tag">Culture &amp; Nature</span>
                  <p className="video-card-desc">Discover hidden gems across Nepal</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURED STAYS
        ═══════════════════════════════════════ */}
        <section className="featured">
          <div className="featured-header">
            <span className="featured-eyebrow">Handpicked for you</span>
            <h2>Our Featured Stays</h2>
            <p className="featured-sub">Verified, authentic homestays loved by travellers</p>
          </div>

          {loadingStays ? (
            <div className="stays-skeleton-grid">
              {[1, 2, 3].map(n => (
                <div key={n} className="stay-skeleton">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line w70" />
                    <div className="skeleton-line w45" />
                    <div className="skeleton-line w55" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredStays.length === 0 ? (
            <p className="stays-empty">No stays found. Please check back later.</p>
          ) : (
            <div className="stays-grid">
              {featuredStays.map((stay) => (
                <div key={stay._id} className="stay-card">
                  <div className="stay-image">
                    <img
                      src={stay.homestayPhotos?.[0]?.url}
                      alt={stay.homestayName}
                    />
                    <div className="stay-rating">⭐ {stay.averageRating?.toFixed(1) || 'New'}</div>
                  </div>
                  <div className="stay-info">
                    <h3>{stay.homestayName}</h3>
                    <p>{stay.municipality}, {stay.district}</p>
                    <div className="stay-footer">
                      <div className="stay-price">
                        <span className="price">Rs. {stay.price?.toLocaleString()}</span>
                        <span className="per-night">/night</span>
                      </div>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(stay._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-section">
              <h3>Company</h3>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#press">Press</a>
              <a href="#blog">Blog</a>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <a href="#help">Help Center</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact Us</a>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="social-links">
                <a href="#facebook">Facebook</a>
                <a href="#twitter">Twitter</a>
                <a href="#instagram">Instagram</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Atithi. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}