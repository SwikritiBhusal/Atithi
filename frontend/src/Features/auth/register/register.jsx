import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Home, Luggage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import Navbar from "../../../components/Navbar";
import Logo from "../../../assets/images/atithi-high-resolution-logo.png";



export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    role: "tourist", // ← ADDED: Default role
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.contactNumber || !formData.password) {
      alert("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to the terms");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          contactNumber: formData.contactNumber,
          password: formData.password,
          role: formData.role, // ← ADDED: Send role
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Registration successful as ${formData.role}! Please check your email for OTP.`);
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Registration failed");
      console.error(error);
    }
  };
 
  return (
    <>
      <Navbar />
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-container">
        <div className="card-wrapper">
          <div className="left-panel">
            <div className="logo-box">
              <img src={Logo} alt="Namaste Logo" className="logo-image" />
            </div>
            <h1 className="brand-name">Namaste!</h1>
            <p className="tagline">
              Experience the warmth of Nepali hospitality. Join Atithi to discover authentic homestays.
            </p>
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0L12.2451 6.90983L19.5106 6.90983L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983L7.75486 6.90983L10 0Z" fill="#fbbf24"/>
              </svg>
              <span>Trusted by 10k+ travelers</span>
            </div>
          </div>

          <div className="right-panel">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to start your journey.</p>
            </div>

            <div>
              {/* ============ ROLE SELECTION ============ */}
              <div className="role-selection">
                <label className="role-label">I am registering as:</label>
                <div className="role-options">
                  <label className={`role-option ${formData.role === 'tourist' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="tourist"
                      checked={formData.role === 'tourist'}
                      onChange={handleChange}
                    />
                    <Luggage size={20} />
                    <div>
                      <span className="role-title">Tourist</span>
                      <span className="role-desc">I want to book homestays</span>
                    </div>
                  </label>

                  <label className={`role-option ${formData.role === 'host' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="host"
                      checked={formData.role === 'host'}
                      onChange={handleChange}
                    />
                    <Home size={20} />
                    <div>
                      <span className="role-title">Host</span>
                      <span className="role-desc">I want to list my homestay</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input type="text" name="username" placeholder="username" value={formData.username} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input type="tel" name="contactNumber" placeholder="" value={formData.contactNumber} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="" value={formData.password} onChange={handleChange} />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="" value={formData.confirmPassword} onChange={handleChange} />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="terms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>

              <button onClick={handleSubmit} className="submit-btn">
                Register Account
              </button>

              <div className="login-link">
                Already have an account? <a href="/login">Login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}