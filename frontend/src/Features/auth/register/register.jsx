// import React, { useState } from 'react';
// import { Eye, EyeOff, User, Mail, Phone, Lock, Home, Luggage, Check, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import './register.css';
// import Navbar from "../../../components/Navbar";
// import Logo from "../../../assets/images/atithi-high-resolution-logo.png";
// import { Toast, useToast } from '../../../components/toast';

// const validatePassword = (password) => ({
//   minLength:    password.length >= 8,
//   hasUppercase: /[A-Z]/.test(password),
//   hasNumber:    /[0-9]/.test(password),
//   hasSpecial:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
// });

// const getStrength = (rules) => {
//   const passed = Object.values(rules).filter(Boolean).length;
//   if (passed <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%' };
//   if (passed === 2) return { label: 'Fair',   color: '#f59e0b', width: '50%' };
//   if (passed === 3) return { label: 'Good',   color: '#3b82f6', width: '75%' };
//   return              { label: 'Strong', color: '#10b981', width: '100%' };
// };

// export default function RegisterPage() {
//   const navigate = useNavigate();
//   const { toasts, toast, removeToast } = useToast();

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     username: "", email: "", contactNumber: "",
//     password: "", confirmPassword: "",
//     role: "tourist", agreeTerms: false,
//   });

//   const passwordRules = validatePassword(formData.password);
//   const strength = getStrength(passwordRules);
//   const allRulesPassed = Object.values(passwordRules).every(Boolean);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.username || !formData.email || !formData.contactNumber || !formData.password) {
//       toast.warning('Missing Fields', 'Please fill in all required fields');
//       return;
//     }
//     if (!allRulesPassed) {
//       toast.error('Weak Password', 'Password needs 8+ chars, uppercase, number & special character');
//       return;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Password Mismatch', 'Your passwords do not match');
//       return;
//     }
//     if (!formData.agreeTerms) {
//       toast.warning('Terms Required', 'Please agree to the Terms of Service');
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           username: formData.username, email: formData.email,
//           contactNumber: formData.contactNumber,
//           password: formData.password, role: formData.role,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast.success('Registration Successful!', 'Check your email for the OTP verification code');
//         setTimeout(() => navigate("/verify-email", { state: { email: formData.email } }), 1800);
//       } else {
//         toast.error('Registration Failed', result.message || 'Please try again');
//       }
//     } catch (error) {
//       toast.error('Something went wrong', 'Please check your connection and try again');
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <Toast toasts={toasts} removeToast={removeToast} />
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="card-container">
//           <div className="card-wrapper">
//             <div className="left-panel">
//               <div className="logo-box">
//                 <img src={Logo} alt="Namaste Logo" className="logo-image" />
//               </div>
//               <h1 className="brand-name">Namaste!</h1>
//               <p className="tagline">Experience the warmth of Nepali hospitality. Join Atithi to discover authentic homestays.</p>
//               <div className="trust-badge">
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                   <path d="M10 0L12.2451 6.90983L19.5106 6.90983L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983L7.75486 6.90983L10 0Z" fill="#fbbf24"/>
//                 </svg>
//                 <span>Trusted by 10k+ travelers</span>
//               </div>
//             </div>

//             <div className="right-panel">
//               <div className="form-header">
//                 <h2>Create Account</h2>
//                 <p>Fill in your details to start your journey.</p>
//               </div>

//               <div>
//                 <div className="role-selection">
//                   <label className="role-label">I am registering as:</label>
//                   <div className="role-options">
//                     <label className={`role-option ${formData.role === 'tourist' ? 'active' : ''}`}>
//                       <input type="radio" name="role" value="tourist" checked={formData.role === 'tourist'} onChange={handleChange} />
//                       <Luggage size={20} />
//                       <div><span className="role-title">Tourist</span><span className="role-desc">I want to book homestays</span></div>
//                     </label>
//                     <label className={`role-option ${formData.role === 'host' ? 'active' : ''}`}>
//                       <input type="radio" name="role" value="host" checked={formData.role === 'host'} onChange={handleChange} />
//                       <Home size={20} />
//                       <div><span className="role-title">Host</span><span className="role-desc">I want to list my homestay</span></div>
//                     </label>
//                   </div>
//                 </div>

//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Username</label>
//                     <div className="input-wrapper">
//                       <User size={18} className="input-icon" />
//                       <input type="text" name="username" placeholder="username" value={formData.username} onChange={handleChange} />
//                     </div>
//                   </div>

//                   <div className="form-group">
//                     <label>Email Address</label>
//                     <div className="input-wrapper">
//                       <Mail size={18} className="input-icon" />
//                       <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
//                     </div>
//                   </div>

//                   <div className="form-group">
//                     <label>Contact Number</label>
//                     <div className="input-wrapper">
//                       <Phone size={18} className="input-icon" />
//                       <input type="tel" name="contactNumber" placeholder="" value={formData.contactNumber} onChange={handleChange} />
//                     </div>
//                   </div>

//                   <div className="form-group">
//                     <label>Password</label>
//                     <div className="input-wrapper">
//                       <Lock size={18} className="input-icon" />
//                       <input type={showPassword ? "text" : "password"} name="password" placeholder="Min 8 chars, number & symbol" value={formData.password} onChange={handleChange} />
//                       <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
//                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                       </button>
//                     </div>
//                     {formData.password.length > 0 && (
//                       <div className="pw-strength-wrap">
//                         <div className="pw-strength-bar">
//                           <div className="pw-strength-fill" style={{ width: strength.width, background: strength.color }} />
//                         </div>
//                         <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
//                       </div>
//                     )}
//                     {formData.password.length > 0 && (
//                       <div className="pw-rules">
//                         <div className={`pw-rule ${passwordRules.minLength ? 'pass' : 'fail'}`}>{passwordRules.minLength ? <Check size={11} /> : <X size={11} />} 8+ characters</div>
//                         <div className={`pw-rule ${passwordRules.hasUppercase ? 'pass' : 'fail'}`}>{passwordRules.hasUppercase ? <Check size={11} /> : <X size={11} />} Uppercase letter</div>
//                         <div className={`pw-rule ${passwordRules.hasNumber ? 'pass' : 'fail'}`}>{passwordRules.hasNumber ? <Check size={11} /> : <X size={11} />} Number</div>
//                         <div className={`pw-rule ${passwordRules.hasSpecial ? 'pass' : 'fail'}`}>{passwordRules.hasSpecial ? <Check size={11} /> : <X size={11} />} Special char</div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label>Confirm Password</label>
//                     <div className="input-wrapper">
//                       <Lock size={18} className="input-icon" />
//                       <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} />
//                       <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
//                         {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                       </button>
//                     </div>
//                     {formData.confirmPassword.length > 0 && (
//                       <div className={`pw-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
//                         {formData.password === formData.confirmPassword
//                           ? <><Check size={11} /> Passwords match</>
//                           : <><X size={11} /> Passwords do not match</>}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="checkbox-group">
//                   <input type="checkbox" id="terms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
//                   <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
//                 </div>

//                 <button onClick={handleSubmit} className="submit-btn">Register Account</button>

//                 <div className="login-link">
//                   Already have an account? <a href="/login">Login</a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Home, Luggage, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import Navbar from "../../../components/Navbar";
import Logo from "../../../assets/images/atithi-high-resolution-logo.png";
import { Toast, useToast } from '../../../components/toast';

// ─── Validation Rules ────────────────────────────────────────
const validatePassword = (password) => ({
  minLength:    password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber:    /[0-9]/.test(password),
  hasSpecial:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});

const getStrength = (rules) => {
  const passed = Object.values(rules).filter(Boolean).length;
  if (passed <= 1) return { label: 'Weak',   color: '#ef4444', width: '25%' };
  if (passed === 2) return { label: 'Fair',   color: '#f59e0b', width: '50%' };
  if (passed === 3) return { label: 'Good',   color: '#3b82f6', width: '75%' };
  return              { label: 'Strong', color: '#10b981', width: '100%' };
};

const validators = {
  username: (val) => {
    if (!val) return 'Username is required';
    if (val.trim().length < 3) return 'At least 3 characters required';
    if (val.trim().length > 30) return 'Maximum 30 characters allowed';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Only letters and spaces allowed';
    if (/^\s|\s$/.test(val)) return 'Cannot start or end with a space';
    if (/\s{2,}/.test(val)) return 'No consecutive spaces allowed';
    return '';
  },
  email: (val) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    if (/\s/.test(val)) return 'Email cannot contain spaces';
    return '';
  },
  contactNumber: (val) => {
    if (!val) return 'Phone number is required';
    if (!/^\d+$/.test(val)) return 'Only numbers allowed';
    if (val.length !== 10) return `Must be exactly 10 digits (${val.length}/10)`;
    if (!/^9/.test(val)) return 'Nepali numbers must start with 9';
    return '';
  },
  password: (val) => {
    if (!val) return 'Password is required';
    const rules = validatePassword(val);
    if (!rules.minLength)    return 'At least 8 characters required';
    if (!rules.hasUppercase) return 'At least 1 uppercase letter required';
    if (!rules.hasNumber)    return 'At least 1 number required';
    if (!rules.hasSpecial)   return 'At least 1 special character required';
    return '';
  },
  confirmPassword: (val, password) => {
    if (!val) return 'Please confirm your password';
    if (val !== password) return 'Passwords do not match';
    return '';
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '', email: '', contactNumber: '',
    password: '', confirmPassword: '',
    role: 'tourist', agreeTerms: false,
  });

  // Track which fields have been touched (show error only after user interacts)
  const [touched, setTouched] = useState({});

  const passwordRules = validatePassword(formData.password);
  const strength = getStrength(passwordRules);

  // Get error for a field
  const getError = (field) => {
    if (!touched[field]) return '';
    if (field === 'confirmPassword') return validators.confirmPassword(formData.confirmPassword, formData.password);
    return validators[field]?.(formData[field]) || '';
  };

  // Field status for border color
  const getStatus = (field) => {
    if (!touched[field] || !formData[field]) return '';
    return getError(field) ? 'invalid' : 'valid';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = type === 'checkbox' ? checked : value;

    // Auto-process fields
    if (name === 'email') processedValue = value.toLowerCase().trim();
    if (name === 'contactNumber') processedValue = value.replace(/\D/g, '').slice(0, 10); // digits only, max 10
    if (name === 'username') processedValue = value.replace(/[^a-zA-Z\s]/g, ''); // letters and spaces only

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    return (
      !validators.username(formData.username) &&
      !validators.email(formData.email) &&
      !validators.contactNumber(formData.contactNumber) &&
      !validators.password(formData.password) &&
      !validators.confirmPassword(formData.confirmPassword, formData.password) &&
      formData.agreeTerms
    );
  };

  const handleSubmit = async () => {
    // Mark all fields as touched to show all errors
    setTouched({
      username: true, email: true, contactNumber: true,
      password: true, confirmPassword: true
    });

    if (!isFormValid()) {
      toast.error('Invalid Form', 'Please fix all errors before submitting');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email,
          contactNumber: formData.contactNumber,
          password: formData.password,
          role: formData.role,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Registration Successful!', 'Check your email for the OTP verification code');
        setTimeout(() => navigate("/verify-email", { state: { email: formData.email } }), 1800);
      } else {
        toast.error('Registration Failed', result.message || 'Please try again');
      }
    } catch (error) {
      toast.error('Something went wrong', 'Please check your connection and try again');
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-container">
          <div className="card-wrapper">

            {/* Left Panel — UNCHANGED */}
            <div className="left-panel">
              <div className="logo-box">
                <img src={Logo} alt="Namaste Logo" className="logo-image" />
              </div>
              <h1 className="brand-name">Namaste!</h1>
              <p className="tagline">Experience the warmth of Nepali hospitality. Join Atithi to discover authentic homestays.</p>
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
                {/* Role Selection — UNCHANGED */}
                <div className="role-selection">
                  <label className="role-label">I am registering as:</label>
                  <div className="role-options">
                    <label className={`role-option ${formData.role === 'tourist' ? 'active' : ''}`}>
                      <input type="radio" name="role" value="tourist" checked={formData.role === 'tourist'} onChange={handleChange} />
                      <Luggage size={20} />
                      <div><span className="role-title">Tourist</span><span className="role-desc">I want to book homestays</span></div>
                    </label>
                    <label className={`role-option ${formData.role === 'host' ? 'active' : ''}`}>
                      <input type="radio" name="role" value="host" checked={formData.role === 'host'} onChange={handleChange} />
                      <Home size={20} />
                      <div><span className="role-title">Host</span><span className="role-desc">I want to list my homestay</span></div>
                    </label>
                  </div>
                </div>

                <div className="form-grid">

                  {/* ── Username ── */}
                  <div className="form-group">
                    <label>Username</label>
                    <div className={`input-wrapper ${getStatus('username')}`}>
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="username"
                        placeholder="Full name (letters only)"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={() => handleBlur('username')}
                        maxLength={30}
                      />
                      {getStatus('username') === 'valid'   && <Check size={16} className="field-check" />}
                      {getStatus('username') === 'invalid' && <X     size={16} className="field-x"     />}
                    </div>
                    {getError('username') && <span className="field-error">{getError('username')}</span>}
                    {touched.username && !getError('username') && <span className="field-success">Looks good!</span>}
                  </div>

                  {/* ── Email ── */}
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className={`input-wrapper ${getStatus('email')}`}>
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                      />
                      {getStatus('email') === 'valid'   && <Check size={16} className="field-check" />}
                      {getStatus('email') === 'invalid' && <X     size={16} className="field-x"     />}
                    </div>
                    {getError('email') && <span className="field-error">{getError('email')}</span>}
                    {touched.email && !getError('email') && <span className="field-success">Valid email!</span>}
                  </div>

                  {/* ── Phone ── */}
                  <div className="form-group">
                    <label>
                      Contact Number
                      {formData.contactNumber.length > 0 && (
                        <span className="field-counter">{formData.contactNumber.length}/10</span>
                      )}
                    </label>
                    <div className={`input-wrapper ${getStatus('contactNumber')}`}>
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        name="contactNumber"
                        placeholder="98XXXXXXXX (10 digits)"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur('contactNumber')}
                        maxLength={10}
                      />
                      {getStatus('contactNumber') === 'valid'   && <Check size={16} className="field-check" />}
                      {getStatus('contactNumber') === 'invalid' && <X     size={16} className="field-x"     />}
                    </div>
                    {getError('contactNumber') && <span className="field-error">{getError('contactNumber')}</span>}
                    {touched.contactNumber && !getError('contactNumber') && <span className="field-success">Valid number!</span>}
                  </div>

                  {/* ── Password ── */}
                  <div className="form-group">
                    <label>Password</label>
                    <div className={`input-wrapper ${getStatus('password')}`}>
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Min 8 chars, number & symbol"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {formData.password.length > 0 && (
                      <div className="pw-strength-wrap">
                        <div className="pw-strength-bar">
                          <div className="pw-strength-fill" style={{ width: strength.width, background: strength.color }} />
                        </div>
                        <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}

                    {/* Rules checklist */}
                    {formData.password.length > 0 && (
                      <div className="pw-rules">
                        <div className={`pw-rule ${passwordRules.minLength    ? 'pass' : 'fail'}`}>{passwordRules.minLength    ? <Check size={11}/> : <X size={11}/>} 8+ characters</div>
                        <div className={`pw-rule ${passwordRules.hasUppercase ? 'pass' : 'fail'}`}>{passwordRules.hasUppercase ? <Check size={11}/> : <X size={11}/>} Uppercase letter</div>
                        <div className={`pw-rule ${passwordRules.hasNumber    ? 'pass' : 'fail'}`}>{passwordRules.hasNumber    ? <Check size={11}/> : <X size={11}/>} Number</div>
                        <div className={`pw-rule ${passwordRules.hasSpecial   ? 'pass' : 'fail'}`}>{passwordRules.hasSpecial   ? <Check size={11}/> : <X size={11}/>} Special char</div>
                      </div>
                    )}
                  </div>

                  {/* ── Confirm Password ── */}
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className={`input-wrapper ${getStatus('confirmPassword')}`}>
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                      />
                      <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {getError('confirmPassword') && <span className="field-error">{getError('confirmPassword')}</span>}
                    {touched.confirmPassword && !getError('confirmPassword') && <span className="field-success">Passwords match!</span>}
                  </div>

                </div>

                {/* Terms */}
                <div className="checkbox-group">
                  <input type="checkbox" id="terms" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                  <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
                </div>

                {/* Submit — disabled until valid */}
                <button
                  onClick={handleSubmit}
                  className="submit-btn"
                  style={{ opacity: isFormValid() ? 1 : 0.65, cursor: isFormValid() ? 'pointer' : 'not-allowed' }}
                >
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