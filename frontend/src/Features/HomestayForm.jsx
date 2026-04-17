import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, CheckCircle, AlertCircle } from "lucide-react";
import "./HomestayForm.css";
import Navbar from "../components/Navbar";
import { Toast, useToast } from "../components/toast";

// ─── Validation Constants ─────────────────────────────────
const PHOTO_MIN_MB = 0.1;   // 100KB minimum
const PHOTO_MAX_MB = 8;     // 8MB maximum per photo
const DOC_MIN_MB   = 0.05;  // 50KB minimum
const DOC_MAX_MB   = 10;    // 10MB maximum per doc

const toMB = (bytes) => bytes / (1024 * 1024);

// ─── Field Validators ─────────────────────────────────────
const validators = {
  ownerName: (v) => {
    if (!v?.trim()) return 'Full name is required';
    if (v.trim().length < 3) return 'Name must be at least 3 characters';
    return '';
  },
  phone: (v) => {
    if (!v) return 'Phone number is required';
    if (!/^\d+$/.test(v)) return 'Only numbers allowed';
    if (v.length !== 10) return `Must be exactly 10 digits (${v.length}/10)`;
    if (!/^9/.test(v)) return 'Nepali numbers must start with 9';
    return '';
  },
  citizenshipNo: (v) => {
    if (!v?.trim()) return 'Citizenship number is required';
    if (v.trim().length < 5) return 'Enter a valid citizenship number';
    return '';
  },
  homestayName: (v) => {
    if (!v?.trim()) return 'Homestay name is required';
    if (v.trim().length < 3) return 'At least 3 characters required';
    if (v.trim().length > 80) return 'Maximum 80 characters';
    return '';
  },
  description: (v) => {
    if (!v?.trim()) return 'Description is required';
    if (v.trim().length < 50) return `At least 50 characters required (${v.trim().length}/50)`;
    if (v.trim().length > 1000) return 'Maximum 1000 characters';
    return '';
  },
  province: (v) => (!v?.trim() ? 'Province is required' : ''),
  district: (v) => (!v?.trim() ? 'District is required' : ''),
  municipality: (v) => (!v?.trim() ? 'Municipality is required' : ''),
  rooms: (v) => {
    if (!v) return 'Number of rooms is required';
    if (parseInt(v) < 1) return 'Minimum 1 room required';
    if (parseInt(v) > 50) return 'Maximum 50 rooms allowed';
    return '';
  },
  price: (v) => {
    if (!v) return 'Price is required';
    if (parseInt(v) < 500) return 'Minimum price is NPR 500';
    if (parseInt(v) > 100000) return 'Maximum price is NPR 1,00,000';
    return '';
  },
};

// ─── Document Validator ───────────────────────────────────
const validateDocuments = (files, type = 'pdf') => {
  if (!files || files.length === 0) return 'Please upload this document as PDF';
 
  const fileArray = Array.from(files);
  for (const file of fileArray) {
    const mb = toMB(file.size);
    const ext = file.name.split('.').pop().toLowerCase();
 
    // ONLY PDF ALLOWED
    if (ext !== 'pdf') {
      return `Only PDF files are allowed. You uploaded: .${ext}`;
    }
 
    if (mb < DOC_MIN_MB) {
      return `File too small (min ${DOC_MIN_MB * 1000}KB). Please upload a clear PDF scan.`;
    }
    
    if (mb > DOC_MAX_MB) {
      return `File too large (max ${DOC_MAX_MB}MB). Your file is ${mb.toFixed(1)}MB`;
    }
  }
  return '';
};

// ─── Photo Validator ──────────────────────────────────────
const validatePhoto = (file) => {
  const mb = toMB(file.size);
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];

  if (!allowed.includes(ext)) return `Only JPG, PNG, WEBP allowed (got .${ext})`;
  if (mb < PHOTO_MIN_MB) return `Photo too small (min ${PHOTO_MIN_MB * 1000}KB). Use original camera photos.`;
  if (mb > PHOTO_MAX_MB) return `Photo too large (max ${PHOTO_MAX_MB}MB). Got ${mb.toFixed(1)}MB`;
  return '';
};

// ─── Inline Field Error Component ────────────────────────
const FieldError = ({ error }) =>
  error ? (
    <div className="hf-field-error">
      <AlertCircle size={13} />
      <span>{error}</span>
    </div>
  ) : null;

const FieldSuccess = ({ show, msg }) =>
  show ? (
    <div className="hf-field-success">
      <CheckCircle size={13} />
      <span>{msg || 'Looks good!'}</span>
    </div>
  ) : null;

// ─── Main Component ───────────────────────────────────────
const HomestayForm = () => {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [user, setUser]             = useState(null);
  const [photos, setPhotos]         = useState([]);
  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [specialFeatures, setSpecialFeatures] = useState(['', '', '']);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched]       = useState({});
  const [docErrors, setDocErrors]   = useState({ citizenshipFiles: '', tourismRegistration: '' });
  const [photoErrors, setPhotoErrors] = useState([]);

  const [formData, setFormData] = useState({
    ownerName: '', email: '', phone: '', citizenshipNo: '',
    homestayName: '', description: '',
    province: '', district: '', municipality: '', ward: '',
    rooms: '', guests: '', price: '', checkIn: '', checkOut: '',
    facilities: [],
    citizenshipFiles: null,
    tourismRegistration: null,
    smokingAllowed: false, petsAllowed: false, childrenAllowed: false,
    additionalRules: '',
  });

  // ─── Auth & existing homestay check ──────────────────
  useEffect(() => {
    const checkUserAndHomestay = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        navigate('/login', { state: { from: '/HomestayForm' } });
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);

      try {
        const response = await fetch(
          `http://localhost:5000/api/homestay/check-existing/${userData.id}`,
          { credentials: 'include' }
        );
        const result = await response.json();

        if (result.hasHomestay) {
          if (result.status === 'pending') {
            toast.info('Already Submitted', 'Your homestay is pending approval. Redirecting...');
            setTimeout(() => navigate('/pending-approval', { state: { email: userData.email } }), 1500);
            return;
          } else if (result.status === 'approved') {
            toast.success('Already Approved', 'Redirecting to dashboard...');
            setTimeout(() => navigate('/Hosts/hostDashboard'), 1500);
            return;
          }
        }

        setFormData(prev => ({
          ...prev,
          ownerName: userData.username || '',
          email: userData.email || '',
          phone: userData.contactNumber || '',
        }));
      } catch (error) {
        console.error('Error checking homestay:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndHomestay();
  }, [navigate]);

  // ─── Helpers ─────────────────────────────────────────
  const getError = (field) => {
    if (!touched[field]) return '';
    return validators[field]?.(formData[field]) || '';
  };

  const getStatus = (field) => {
    if (!touched[field] || !formData[field]) return '';
    return getError(field) ? 'invalid' : 'valid';
  };

  const markTouched = (field) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  // ─── Handlers ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'phone') v = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: v }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, value]
        : prev.facilities.filter(f => f !== value)
    }));
  };

  const handleOwnerPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const err = validatePhoto(file);
    if (err) { toast.error('Invalid Photo', err); return; }
    setOwnerPhoto({ file, preview: URL.createObjectURL(file) });
  };

  const removeOwnerPhoto = () => {
    if (ownerPhoto) URL.revokeObjectURL(ownerPhoto.preview);
    setOwnerPhoto(null);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      toast.warning('Too Many Photos', 'Maximum 10 photos allowed!');
      return;
    }

    const errors = [];
    const validFiles = [];

    files.forEach((file, i) => {
      const err = validatePhoto(file);
      if (err) {
        errors.push(`Photo ${i + 1}: ${err}`);
      } else {
        validFiles.push({ file, preview: URL.createObjectURL(file) });
      }
    });

    if (errors.length > 0) {
      toast.error('Some photos rejected', errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setPhotos(prev => [...prev, ...validFiles]);
    }

    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Document file change with validation
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const err = validateDocuments(files, 'any');
    setDocErrors(prev => ({ ...prev, [name]: err }));
    if (!err) setFormData(prev => ({ ...prev, [name]: files }));
  };

  const handleSpecialFeatureChange = (index, value) => {
    const updated = [...specialFeatures];
    updated[index] = value;
    setSpecialFeatures(updated);
  };

  const addSpecialFeature = () => {
    if (specialFeatures.length < 6) setSpecialFeatures([...specialFeatures, '']);
  };

  const removeSpecialFeature = (index) => {
    if (specialFeatures.length > 1)
      setSpecialFeatures(specialFeatures.filter((_, i) => i !== index));
  };

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allFields = Object.keys(validators);
    const newTouched = {};
    allFields.forEach(f => { newTouched[f] = true; });
    setTouched(newTouched);

    // Check field errors
    const fieldErrors = allFields.filter(f => validators[f]?.(formData[f]));
    if (fieldErrors.length > 0) {
      toast.error('Fix Errors', 'Please fix all highlighted fields before submitting');
      return;
    }

    // Owner photo
    if (!ownerPhoto) {
      toast.warning('Photo Required', 'Please upload your photo!');
      return;
    }

    // Homestay photos
    if (photos.length < 4) {
      toast.warning('More Photos Needed', `Upload at least 4 photos (${photos.length}/4)`);
      return;
    }

    // Document validation
    const citizenErr = validateDocuments(formData.citizenshipFiles, 'any');
    const tourismErr = validateDocuments(formData.tourismRegistration, 'any');
    setDocErrors({ citizenshipFiles: citizenErr, tourismRegistration: tourismErr });

    if (citizenErr || tourismErr) {
      toast.error('Document Error', 'Please fix document upload errors');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('userId', user.id);
    data.append('ownerName', formData.ownerName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('citizenshipNo', formData.citizenshipNo);
    data.append('homestayName', formData.homestayName);
    data.append('description', formData.description);
    data.append('province', formData.province);
    data.append('district', formData.district);
    data.append('municipality', formData.municipality);
    data.append('ward', formData.ward);
    data.append('rooms', formData.rooms);
    data.append('guests', formData.guests);
    data.append('price', formData.price);
    data.append('checkIn', formData.checkIn);
    data.append('checkOut', formData.checkOut);
    data.append('facilities', JSON.stringify(formData.facilities));
    data.append('smokingAllowed', formData.smokingAllowed);
    data.append('petsAllowed', formData.petsAllowed);
    data.append('childrenAllowed', formData.childrenAllowed);
    data.append('additionalRules', formData.additionalRules);

    const filledFeatures = specialFeatures.filter(f => f.trim() !== '');
    data.append('specialFeatures', JSON.stringify(filledFeatures));

    if (ownerPhoto) data.append('ownerPhoto', ownerPhoto.file);
    Array.from(formData.citizenshipFiles).forEach(f => data.append('citizenshipFiles', f));
    data.append('tourismRegistration', formData.tourismRegistration[0]);
    photos.forEach(({ file }) => data.append('homestayPhotos', file));

    try {
      const response = await fetch('http://localhost:5000/api/homestay/submit', {
        method: 'POST',
        body: data
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Submitted!', 'Your homestay has been submitted for review.');
        setTimeout(() => navigate('/pending-approval', { state: { email: user.email } }), 1200);
      } else {
        toast.error('Submission Failed', result.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error('Network Error', 'Submission failed! Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#666' }}>
          Loading...
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="homestay-form-page">
        <div className="homestay-form-container">
          <h2 className="homestay-form-title">Add Your Stay</h2>
          <p className="homestay-form-subtitle">Submit your homestay details for admin verification.</p>

          <form onSubmit={handleSubmit} className="homestay-form">

            {/* ── Owner Info ── */}
            <h3 className="homestay-section-title">Owner Information</h3>

            <div className="owner-photo-section">
              <label className="homestay-label">
                <span className="homestay-required">*</span> Your Photo
              </label>
              <p className="homestay-file-hint">Upload a clear photo of yourself (JPG/PNG, max 8MB)</p>
              {ownerPhoto ? (
                <div className="photo-preview-single">
                  <img src={ownerPhoto.preview} alt="Owner" />
                  <button type="button" className="remove-photo-btn" onClick={removeOwnerPhoto}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="photo-upload-box">
                  <div className="upload-icon">📷</div>
                  <span>Click to upload your photo</span>
                  <input type="file" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleOwnerPhotoChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Owner Name */}
            <input
              className={`homestay-input ${getStatus('ownerName')}`}
              name="ownerName"
              placeholder="Owner Full Name"
              value={formData.ownerName}
              onChange={handleChange}
              onBlur={() => markTouched('ownerName')}
              readOnly
              style={{ background: '#f8fafc', cursor: 'not-allowed' }}
            />
            <FieldError error={getError('ownerName')} />

            {/* Email */}
            <input
              className="homestay-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              readOnly
              style={{ background: '#f8fafc', cursor: 'not-allowed' }}
            />

            {/* Phone */}
            <input
              className={`homestay-input ${getStatus('phone')}`}
              name="phone"
              placeholder="Mobile Number (98XXXXXXXX)"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => markTouched('phone')}
              maxLength={10}
            />
            <FieldError error={getError('phone')} />
            <FieldSuccess show={touched.phone && !getError('phone')} msg="Valid phone number!" />

            {/* Citizenship No */}
            <input
              className={`homestay-input ${getStatus('citizenshipNo')}`}
              name="citizenshipNo"
              placeholder="Citizenship Number"
              value={formData.citizenshipNo}
              onChange={handleChange}
              onBlur={() => markTouched('citizenshipNo')}
            />
            <FieldError error={getError('citizenshipNo')} />

            {/* ── Homestay Info ── */}
            <h3 className="homestay-section-title">Homestay Details</h3>

            <input
              className={`homestay-input ${getStatus('homestayName')}`}
              name="homestayName"
              placeholder="Homestay Name"
              value={formData.homestayName}
              onChange={handleChange}
              onBlur={() => markTouched('homestayName')}
            />
            <FieldError error={getError('homestayName')} />

            <textarea
              className={`homestay-textarea ${getStatus('description')}`}
              name="description"
              placeholder="Describe your homestay (minimum 50 characters)"
              value={formData.description}
              onChange={handleChange}
              onBlur={() => markTouched('description')}
              rows="5"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-12px', marginBottom: '8px' }}>
              <FieldError error={getError('description')} />
              <span style={{ fontSize: '12px', color: formData.description.length >= 50 ? '#10b981' : '#94a3b8' }}>
                {formData.description.length}/1000
              </span>
            </div>

            {/* ── Location ── */}
            <h3 className="homestay-section-title">Location</h3>

            <input className={`homestay-input ${getStatus('province')}`} name="province" placeholder="Province" value={formData.province} onChange={handleChange} onBlur={() => markTouched('province')} />
            <FieldError error={getError('province')} />

            <input className={`homestay-input ${getStatus('district')}`} name="district" placeholder="District" value={formData.district} onChange={handleChange} onBlur={() => markTouched('district')} />
            <FieldError error={getError('district')} />

            <input className={`homestay-input ${getStatus('municipality')}`} name="municipality" placeholder="Municipality / Village" value={formData.municipality} onChange={handleChange} onBlur={() => markTouched('municipality')} />
            <FieldError error={getError('municipality')} />

            <input className="homestay-input" name="ward" placeholder="Ward Number (optional)" value={formData.ward} onChange={handleChange} />

            {/* ── Stay Info ── */}
            <h3 className="homestay-section-title">Stay Information</h3>

            <input className={`homestay-input ${getStatus('rooms')}`} name="rooms" type="number" placeholder="Total Rooms (1-50)" value={formData.rooms} onChange={handleChange} onBlur={() => markTouched('rooms')} min="1" max="50" />
            <FieldError error={getError('rooms')} />

            <input className="homestay-input" name="guests" type="number" placeholder="Guests per Room (optional)" value={formData.guests} onChange={handleChange} min="1" />

            <input className={`homestay-input ${getStatus('price')}`} name="price" type="number" placeholder="Price per Night (NPR 500 - 1,00,000)" value={formData.price} onChange={handleChange} onBlur={() => markTouched('price')} min="500" max="100000" />
            <FieldError error={getError('price')} />
            {touched.price && !getError('price') && formData.price && (
              <FieldSuccess show msg={`NPR ${parseInt(formData.price).toLocaleString()} per night`} />
            )}

            <div className="homestay-time-group">
              <div className="homestay-time-field">
                <label className="homestay-label">Check-in Time</label>
                <input className="homestay-input" name="checkIn" type="time" value={formData.checkIn} onChange={handleChange} />
              </div>
              <div className="homestay-time-field">
                <label className="homestay-label">Check-out Time</label>
                <input className="homestay-input" name="checkOut" type="time" value={formData.checkOut} onChange={handleChange} />
              </div>
            </div>

            {/* ── Facilities ── */}
            <h3 className="homestay-section-title">Facilities</h3>
            <div className="homestay-checkbox-group">
              {["Local Food", "Cultural Experience", "Hot Water", "Free Wi-Fi", "Nature View", "Peaceful Environment", "Mountain View", "Trekking Access", "Yoga & Meditation", "Parking Available", "Traditional Food", "River View"].map((item) => (
                <label key={item} className="homestay-checkbox-label">
                  <input type="checkbox" value={item} onChange={handleFacilityChange} checked={formData.facilities.includes(item)} className="homestay-checkbox" />
                  {item}
                </label>
              ))}
            </div>

            {/* ── Special Features ── */}
            <h3 className="homestay-section-title">What Makes Your Homestay Special?</h3>
            <p className="homestay-file-hint">Highlight unique features (e.g., "Mountain view from every room")</p>
            <div className="special-features-list">
              {specialFeatures.map((feature, index) => (
                <div key={index} className="special-feature-item">
                  <input className="homestay-input" placeholder={`Special feature ${index + 1}`} value={feature} onChange={(e) => handleSpecialFeatureChange(index, e.target.value)} style={{ marginBottom: 0 }} />
                  {specialFeatures.length > 1 && (
                    <button type="button" className="remove-feature-btn" onClick={() => removeSpecialFeature(index)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {specialFeatures.length < 6 && (
                <button type="button" className="add-feature-btn" onClick={addSpecialFeature}>
                  <Plus size={16} /> Add Another Feature
                </button>
              )}
            </div>

            {/* ── House Rules ── */}
            <h3 className="homestay-section-title">House Rules</h3>
            <div className="house-rules-section">
              {[['smokingAllowed', 'Smoking Allowed'], ['petsAllowed', 'Pets Allowed'], ['childrenAllowed', 'Children Friendly']].map(([name, label]) => (
                <label key={name} className="rule-checkbox-label">
                  <input type="checkbox" name={name} checked={formData[name]} onChange={handleCheckboxChange} className="homestay-checkbox" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <textarea className="homestay-textarea" name="additionalRules" placeholder="Additional house rules (optional)" value={formData.additionalRules} onChange={handleChange} rows="3" />

            {/* ── Cancellation Policy ── */}
            <h3 className="homestay-section-title">Cancellation Policy</h3>
            <div className="cancellation-policy-info">
              <div className="policy-info-box">
                <div className="policy-icon">ℹ️</div>
                <div className="policy-content">
                  <h4>Standard Atithi Cancellation Policy</h4>
                  <p className="policy-subtitle">All homestays follow this simple, fair policy:</p>
                  <ul className="policy-points">
                    <li><strong>✅ Within 2 hours of booking:</strong> 100% refund</li>
                    <li><strong>✅ More than 2 hours, before check-in:</strong> 80% refund</li>
                    <li><strong>❌ On check-in day or after:</strong> No cancellation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── KYC Documents ── */}
           <h3 className="homestay-section-title">KYC Documents</h3>
<p className="homestay-kyc-note">⚠️ Upload clear PDF scans only | Min: 50KB | Max: 10MB per file</p>
 
<div className="homestay-document-upload">
  <label className="homestay-label">
    <span className="homestay-required">*</span> Citizenship (Front & Back)
  </label>
  <p className="homestay-file-hint">
    📄 Upload both sides as PDF files | Min: 50KB | Max: 10MB each
  </p>
  <input
    className="homestay-file-input"
    type="file"
    name="citizenshipFiles"
    onChange={handleFileChange}
    multiple
    accept=".pdf,application/pdf"
  />
  {docErrors.citizenshipFiles && (
    <div className="hf-field-error">
      <AlertCircle size={13} />
      <span>{docErrors.citizenshipFiles}</span>
    </div>
  )}
  {!docErrors.citizenshipFiles && formData.citizenshipFiles && (
    <div className="hf-field-success">
      <CheckCircle size={13} />
      <span>✓ PDF documents uploaded successfully!</span>
    </div>
  )}
</div>
 
<div className="homestay-document-upload">
  <label className="homestay-label">
    <span className="homestay-required">*</span> Tourism Registration / Community Homestay Letter
  </label>
  <p className="homestay-file-hint">
    📄 Upload your official certificate as PDF | Min: 50KB | Max: 10MB
  </p>
  <input
    className="homestay-file-input"
    type="file"
    name="tourismRegistration"
    onChange={handleFileChange}
    accept=".pdf,application/pdf"
  />
  {docErrors.tourismRegistration && (
    <div className="hf-field-error">
      <AlertCircle size={13} />
      <span>{docErrors.tourismRegistration}</span>
    </div>
  )}
  {!docErrors.tourismRegistration && formData.tourismRegistration && (
    <div className="hf-field-success">
      <CheckCircle size={13} />
      <span>✓ PDF document uploaded successfully!</span>
    </div>
  )}
</div>
            {/* ── Photos ── */}
            <h3 className="homestay-section-title">Homestay Photos</h3>
            <label className="homestay-label"><span className="homestay-required">*</span> Upload Photos (Min 4, Max 10)</label>
            <p className="homestay-file-hint">
              JPG, PNG or WEBP only | Min: 100KB per photo | Max: 8MB per photo<br />
              Include rooms, common areas, exterior and surroundings
            </p>

            <div className="photo-upload-area">
              <label className="photo-upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to Add Photos</span>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
              <p className="photo-count-text">
                {photos.length}/10 photos added
                {photos.length < 4 && <span className="photo-count-warning"> (Need {4 - photos.length} more)</span>}
                {photos.length >= 4 && <span className="photo-count-ok"> ✓ Minimum requirement met</span>}
              </p>
            </div>

            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={photo.preview} alt={`Photo ${index + 1}`} className="photo-preview-img" />
                    <button type="button" className="photo-remove-btn" onClick={() => removePhoto(index)}>
                      <X size={16} />
                    </button>
                    <span className="photo-number-badge">{index + 1}</span>
                    <span className="photo-size-badge">{toMB(photo.file.size).toFixed(1)}MB</span>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label className="photo-add-more">
                    <Plus size={32} />
                    <span>Add More</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            )}

            {/* ── Declaration ── */}
            <div className="homestay-declaration">
              <input type="checkbox" required className="homestay-checkbox" />
              <span className="homestay-declaration-text">
                I confirm that all provided information and documents are authentic and correct. I understand that providing false information may result in rejection or legal action.
              </span>
            </div>

            <button type="submit" className="homestay-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

export default HomestayForm;