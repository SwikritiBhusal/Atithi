import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PendingApproval.css';

export default function PendingApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || null;

  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [dots, setDots] = useState('');

  // Animated dots for "waiting" effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll backend every 15 seconds to check approval status
  useEffect(() => {
    if (!email) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/homestay/status-by-email?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.success) {
          if (data.status === 'approved') setStatus('approved');
          else if (data.status === 'rejected') setStatus('rejected');
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    };

    checkStatus(); // Check immediately
    const interval = setInterval(checkStatus, 15000); // Then every 15s
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="pa-wrapper">
      <div className="pa-card">

        {/* Logo / Brand */}
        <div className="pa-brand">Atithi</div>

        {status === 'pending' && (
          <>
            <div className="pa-icon pa-icon--pending">⏳</div>
            <h1 className="pa-title">Homestay Submitted!</h1>
            <p className="pa-subtitle">
              Your homestay is currently under review by our admin team.
            </p>

            <div className="pa-status-badge pa-status-badge--pending">
              <span className="pa-pulse" />
              Pending Review{dots}
            </div>

            <div className="pa-info-box">
              <div className="pa-info-row">
                <span className="pa-info-icon">📧</span>
                <span>You'll receive an email at <strong>{email || 'your registered email'}</strong> once reviewed.</span>
              </div>
              <div className="pa-info-row">
                <span className="pa-info-icon">⏱️</span>
                <span>Review usually takes <strong>1–3 business days</strong>.</span>
              </div>
              <div className="pa-info-row">
                <span className="pa-info-icon">🔒</span>
                <span>You can <strong>log in</strong> only after your homestay is approved.</span>
              </div>
            </div>

            <div className="pa-steps">
              <div className="pa-step pa-step--done">
                <div className="pa-step-dot pa-step-dot--done">✓</div>
                <span>Form Submitted</span>
              </div>
              <div className="pa-step-line pa-step-line--pending" />
              <div className="pa-step pa-step--active">
                <div className="pa-step-dot pa-step-dot--active">2</div>
                <span>Admin Review</span>
              </div>
              <div className="pa-step-line pa-step-line--pending" />
              <div className="pa-step">
                <div className="pa-step-dot">3</div>
                <span>Approved & Login</span>
              </div>
            </div>

            <button className="pa-btn pa-btn--ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="pa-icon pa-icon--approved">🎉</div>
            <h1 className="pa-title pa-title--approved">You're Approved!</h1>
            <p className="pa-subtitle">
              Your homestay has been approved. You can now log in to access your host dashboard.
            </p>

            <div className="pa-status-badge pa-status-badge--approved">
              ✓ Homestay Approved
            </div>

            <div className="pa-steps">
              <div className="pa-step pa-step--done">
                <div className="pa-step-dot pa-step-dot--done">✓</div>
                <span>Form Submitted</span>
              </div>
              <div className="pa-step-line pa-step-line--done" />
              <div className="pa-step pa-step--done">
                <div className="pa-step-dot pa-step-dot--done">✓</div>
                <span>Admin Review</span>
              </div>
              <div className="pa-step-line pa-step-line--done" />
              <div className="pa-step pa-step--done">
                <div className="pa-step-dot pa-step-dot--done">✓</div>
                <span>Approved!</span>
              </div>
            </div>

            <button className="pa-btn pa-btn--primary" onClick={() => navigate('/login')}>
              Go to Login →
            </button>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div className="pa-icon pa-icon--rejected">❌</div>
            <h1 className="pa-title pa-title--rejected">Application Rejected</h1>
            <p className="pa-subtitle">
              Unfortunately your homestay application was not approved. Please check your email for details.
            </p>

            <div className="pa-status-badge pa-status-badge--rejected">
              ✗ Not Approved
            </div>

            <div className="pa-info-box pa-info-box--rejected">
              <div className="pa-info-row">
                <span className="pa-info-icon">📧</span>
                <span>Check <strong>{email || 'your email'}</strong> for the reason and next steps.</span>
              </div>
              <div className="pa-info-row">
                <span className="pa-info-icon">🔄</span>
                <span>You may resubmit after addressing the issues mentioned.</span>
              </div>
            </div>

            <button className="pa-btn pa-btn--primary" onClick={() => navigate('/HomestayForm')}>
              Resubmit Application
            </button>
            <button className="pa-btn pa-btn--ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}