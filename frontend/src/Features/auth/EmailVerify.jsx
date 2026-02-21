import React, { useState } from "react";
import { Mail, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
//import Logo from "../../../assets/images/atithi-high-resolution-logo.png";
import "./EmailVerify.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/email-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        alert("Email verified successfully!");
        navigate("/login");
      } else {
        alert(result.message || "Verification failed!");
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
          Enter the OTP sent to your email to verify your account
        </p>
      </div>

      <form className="form-section" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <div className="input-container">
            <Mail className="icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>OTP</label>
          <div className="input-container">
            <Key className="icon" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="login-button">
          Verify Email
        </button>
      </form>
    </div>
  );
}