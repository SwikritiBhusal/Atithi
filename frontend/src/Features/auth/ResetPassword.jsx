import React, { useState } from "react";
import { Key, Eye, EyeOff, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, otp, password } = formData;

    if (!email, !otp || !password ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Password reset successful! Please login.");
        navigate("/login");
      } else {
        alert(result.message || "Password reset failed!");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="login-card">
      <div className="brand-section">
        <p className="welcome-text">
          Enter your Email, OTP and new password to reset your account password
        </p>
      </div>

      <form className="form-section" onSubmit={handleSubmit}>
         <div className="input-group">
          <label>Email</label>
          <div className="input-container">
            <Key className="icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      
        <div className="input-group">
            
          <label>OTP</label>
          <div className="input-container">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP sent to your email"
            value={formData.otp}
            onChange={handleChange}
            required
          />
          </div>
        </div>

        <div className="input-group">
          <label>New Password</label>
          <div className="input-container">
            <Key className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>


        <button type="submit" className="login-button">
          Reset Password
        </button>
      </form>
    </div>
  );
}
