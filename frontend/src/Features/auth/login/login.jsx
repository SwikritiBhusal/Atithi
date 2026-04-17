import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './login.css';
import Navbar from "../../../components/Navbar";
import Logo from "../../../assets/images/atithi-high-resolution-logo.png";
import { Toast, useToast } from '../../../components/toast'; 

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { toasts, toast, removeToast } = useToast(); // ✅

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') navigate('/Admin/overview');
      else if (user.role === 'host') {
        if (user.hasApprovedHomestay) navigate('/Hosts/hostDashboard');
        else navigate('/');
      } else navigate('/');
    }
     
  }, [navigate]);

  useEffect(() => {
  if (location.state?.message) {
    toast.info('Login Required', location.state.message);
  }
}, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!formData.email || !formData.password) {
      toast.warning('Missing Fields', 'Please enter your email and password');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token || "authenticated");
        window.dispatchEvent(new Event('userChanged'));
        window.dispatchEvent(new Event('storage'));

        // ✅ Success toast
        toast.success('Login Successful', `Welcome back, ${result.user.username}!`);

        const role = result.user.role;
        const from = location.state?.from;

        // Redirect after short delay so toast is visible
        setTimeout(() => {
          // After localStorage set, inside setTimeout:
if (from === '/HomestayForm') {
  navigate('/HomestayForm'); 
} else if (role === 'admin') {
  navigate('/Admin/overview');
} else if (role === 'host') {
  if (result.user.hasApprovedHomestay) {
    navigate('/Hosts/hostDashboard');
  } else {
    navigate('/HomestayForm'); 
  }
} else {
  navigate('/');
}
        }, 1200);

      } else {
        if (result.isPending) {
    navigate('/pending-approval', { state: { email: formData.email } });
    return;
  }
        setError(result.message || "Login failed!");
        // ✅ Error toast
        toast.error('Login Failed', result.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong!");
      toast.error('Something went wrong', 'Please try again later');
    }
  };

  const goToForgotPassword = () => {
    setError("");
    navigate("/forgot-password");
  };

  return (
    <>
      <Navbar />
     
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="registerr-pagee-wrapperr">
        <div className="login-containerr">
          <div className="login-cardd">
            <div className="brand-sectionn">
              <div className="logo-wrapperr">
                <div className="logo-boxx">
                  <img src={Logo} alt="Namaste Logo" className="logo-imagee" />
                </div>
              </div>
              <h3><b>Welcome Back!</b></h3>
              <p className="welcome-textt">Please login to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="form-sectionn">
              <div className="input-groupp">
                <label>Email Address</label>
                <div className="input-containerr">
                  <Mail size={18} className="iconn" />
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

              <div className="input-groupp">
                <label>Password</label>
                <div className="input-containerr">
                  <Lock size={18} className="iconn" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="eye-buttonn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="remember-forgot">
                <div className="remember-sectionn">
                  <input
                    type="checkbox"
                    id="remember"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <div className="forgot-link" onClick={goToForgotPassword}>
                  Forgot Password?
                </div>
              </div>

              <button type="submit" className="login-buttonn">Log In</button>

              <div className="register-sectionn">
                Don't have an account? <a href="/register">Register</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}