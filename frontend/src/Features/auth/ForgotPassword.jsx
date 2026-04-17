import React, { useState } from "react";
import { Mail, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Toast, useToast } from "../../components/toast";
import "./Shared.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.warning("Missing Email", "Please enter your email address."); return; }

    setLoading(true);
    try {
      const res    = await fetch("http://localhost:5000/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("OTP Sent!", "Check your inbox for the password reset OTP.");
        setTimeout(() => navigate("/reset-password"), 1500);
      } else {
        toast.error("Failed", result.message || "Could not send OTP. Please try again.");
      }
    } catch {
      toast.error("Something went wrong", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-page-wrapper">
        <div className="auth-card">

          {/* Step indicator */}
          <div className="auth-steps">
            <div className="auth-step active">
              <div className="auth-step-dot active">1</div>
              <span>Email</span>
            </div>
            <div className="auth-step-line" />
            <div className="auth-step">
              <div className="auth-step-dot">2</div>
              <span>OTP</span>
            </div>
            <div className="auth-step-line" />
            <div className="auth-step">
              <div className="auth-step-dot">3</div>
              <span>Reset</span>
            </div>
          </div>

          {/* Icon */}
          <div className="auth-icon-wrap">
            <KeyRound size={28} />
          </div>

          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={17} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Info */}
            <div className="auth-info-box">
              <span className="auth-info-icon">⏱️</span>
              <span>The OTP will expire in <strong>15 minutes</strong>. Check your spam folder if you don't see it.</span>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Sending OTP…" : "Send OTP →"}
            </button>

            <p className="auth-footer-link">
              Remember your password? <span onClick={() => navigate("/login")}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}