import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css"; // reuse same CSS

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/send-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), // just send email
    });

    const result = await res.json();

    if (result.success) {
      alert("OTP has been sent to your email!");
      navigate(`/reset-password`);
    } else {
      alert(result.message || "Failed to send OTP!");
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
          Enter your registered email to receive a password reset OTP
        </p>
      </div>
      <form className="form-section" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email Address</label>
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
        <button type="submit" className="login-button">
          Send OTP
        </button>
      </form>
    </div>
  );
}
