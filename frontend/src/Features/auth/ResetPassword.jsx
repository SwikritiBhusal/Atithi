import React, { useState, useRef } from "react";
import { Mail, Key, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Toast, useToast } from "../../components/toast";
import "./Shared.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [email, setEmail]           = useState("");
  const [otp, setOtp]               = useState(["", "", "", "", "", ""]);
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const inputRefs                   = useRef([]);

  /* ── OTP handlers ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
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

    if (!email)           { toast.warning("Missing Email",    "Please enter your email."); return; }
    if (otpStr.length < 6){ toast.warning("Incomplete OTP",  "Please enter all 6 OTP digits."); return; }
    if (!password)        { toast.warning("Missing Password", "Please enter a new password."); return; }
    if (password.length < 8) { toast.warning("Weak Password", "Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res    = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: otpStr, newPassword: password }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success("Password Reset!", "Your password has been updated. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1800);
      } else {
        toast.error("Reset Failed", result.message || "Invalid OTP or expired. Try again.");
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
            <div className="auth-step done">
              <div className="auth-step-dot done">✓</div>
              <span>Email</span>
            </div>
            <div className="auth-step-line done" />
            <div className="auth-step active">
              <div className="auth-step-dot active">2</div>
              <span>OTP</span>
            </div>
            <div className="auth-step-line" />
            <div className="auth-step active">
              <div className="auth-step-dot active">3</div>
              <span>Reset</span>
            </div>
          </div>

          {/* Icon */}
          <div className="auth-icon-wrap">
            <LockKeyhole size={28} />
          </div>

          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Enter your email, the OTP from your inbox, and your new password below.
          </p>

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
              <label className="auth-label">6-Digit OTP</label>
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

            {/* New Password */}
            <div className="auth-input-group">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrap">
                <Key size={17} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password →"}
            </button>

            <p className="auth-footer-link">
              Back to <span onClick={() => navigate("/login")}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}