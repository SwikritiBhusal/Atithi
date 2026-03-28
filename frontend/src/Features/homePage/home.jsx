import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import './home.css';  
import Navbar from "../../components/Navbar";
import video1 from "../../assets/Videos/Tourism.mp4";
import video2 from "../../assets/Videos/Tourism (1).mp4";
import SmartRecommendation from '../../Features/SmartRecommendation';


export default function HomePage() {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const featuredStays = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      title: 'Himalayan Sunrise Villa',
      location: 'Nagarkot, Bhaktapur',
      price: 3500,
      rating: 4.9
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      title: 'Lakeside Serenity',
      location: 'Pokhara, Kaski',
      price: 2800,
      rating: 4.8
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?w=800&q=80',
      title: 'Gurung Heritage Stay',
      location: 'Ghandruk, Kaski',
      price: 2000,
      rating: 4.9
    }
  ];

  return (
    
  <>
       {/* Navbar on top */}
        <Navbar />
    <div className="app">
      
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Find Your Perfect Homestay<br />in Nepal</h1>
          <p>Book local, authentic, and verified stays across Nepal</p>
          <p>Get AI-powered personalized recommendations</p>
          
          <button 
          className="ai-recommend-btn"
          onClick={() => setShowQuestionnaire(true)}
        >
          ✨ Find My Perfect Match
        </button>
        </div>
        {showQuestionnaire && (
        <SmartRecommendation onClose={() => setShowQuestionnaire(false)} />
      )}
      </section>

      <section className="interests">
         {/* NEW VIDEO SECTION */}
      <section className="video-showcase">
        <div className="video-container">
          <div className="video-wrapper left-video">
            <video autoPlay loop muted playsInline>
              <source src={video1} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-overlay">
            </div>
          </div>
          
          <div className="video-wrapper right-video">
            <video autoPlay loop muted playsInline>
              <source src={video2} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-overlay">
            </div>
          </div>
        </div>
      </section>
        
      </section>

      <section className="featured">
       
        <h2>Our Featured Stays</h2>
        <div className="stays-grid">
          {featuredStays.map((stay) => (
            <div key={stay.id} className="stay-card">
              <div className="stay-image">
                <img src={stay.image} alt={stay.title} />
                <div className="stay-rating">⭐ {stay.rating}</div>
              </div>
              <div className="stay-info">
                <h3>{stay.title}</h3>
                <p>{stay.location}</p>
                <div className="stay-footer">
                  <div className="stay-price">
                    <span className="price">Rs. {stay.price.toLocaleString()}</span>
                    <span className="per-night">/night</span>
                  </div>
                  <button className="btn-view">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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