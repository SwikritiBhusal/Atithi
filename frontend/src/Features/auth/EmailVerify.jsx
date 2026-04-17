import React, { useState, useRef } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Toast, useToast } from "../../components/toast";
import "./Shared.css";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [email, setEmail] = useState("");
  const [otp, setOtp]     = useState(["", "", "", "", "", ""]);
  const inputRefs         = useRef([]);

  /* ── OTP box handlers ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // one digit per box
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { if (i < 6) newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");

    if (!email) { toast.warning("Missing Email", "Please enter your email address."); return; }
    if (otpStr.length < 6) { toast.warning("Incomplete OTP", "Please enter all 6 digits of your OTP."); return; }

    try {
      const res    = await fetch("http://localhost:5000/api/auth/email-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpStr }),
        credentials: "include",
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Email Verified!", "Your account has been verified. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1800);
      } else {
        toast.error("Verification Failed", result.message || "Invalid OTP. Please try again.");
      }
    } catch {
      toast.error("Something went wrong", "Please check your connection and try again.");
    }
  };

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-page-wrapper">
        <div className="auth-card">

          {/* Icon */}
          <div className="auth-icon-wrap">
            <ShieldCheck size={28} />
          </div>

          <h2 className="auth-title">Verify Your Email</h2>
          <p className="auth-subtitle">
            Enter your email and the 6-digit OTP we sent to verify your account.
          </p>

          {/* Info box */}
          <div className="auth-info-box" style={{ marginBottom: 24 }}>
            <span className="auth-info-icon">📧</span>
            <span>Check your inbox (and spam folder) for the OTP. It expires in <strong>24 hours</strong>.</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={17} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* OTP boxes */}
            <div className="auth-input-group">
              <label className="auth-label">One-Time Password (OTP)</label>
              <div className="otp-boxes-wrap" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Verify Email
            </button>

            <p className="auth-footer-link">
              Already verified? <span onClick={() => navigate("/login")}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}