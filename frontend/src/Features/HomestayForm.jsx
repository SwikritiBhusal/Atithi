import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import "./HomestayForm.css";
import Navbar from "../components/Navbar";


const HomestayForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]); // For multiple homestay photos
  const [ownerPhoto, setOwnerPhoto] = useState(null); // For owner photo
  const [specialFeatures, setSpecialFeatures] = useState(['', '', '']); // 3 default inputs

  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    citizenshipNo: "",
    homestayName: "",
    description: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    rooms: "",
    guests: "",
    price: "",
    checkIn: "",
    checkOut: "",
    facilities: [],
    citizenshipFiles: null,
    tourismRegistration: null,
    // New fields
    smokingAllowed: false,
    petsAllowed: false,
    childrenAllowed: false,
    additionalRules: "",
    cancellationPolicy: "moderate",
  });

  // Check if user is logged in
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please login or register first to add your homestay!');
      navigate('/login', { state: { from: '/HomestayForm' } });
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    setFormData(prev => ({
      ...prev,
      ownerName: userData.username || "",
      email: userData.email || "",
      phone: userData.contactNumber || "",
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files });
  };

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, value],
      });
    } else {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter((f) => f !== value),
      });
    }
  };

  // Owner photo handling
  const handleOwnerPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOwnerPhoto({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeOwnerPhoto = () => {
    if (ownerPhoto) {
      URL.revokeObjectURL(ownerPhoto.preview);
      setOwnerPhoto(null);
    }
  };

  // Multiple homestay photos handling
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > 10) {
      alert('Maximum 10 photos allowed!');
      return;
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Special features handling
  const handleSpecialFeatureChange = (index, value) => {
    const updated = [...specialFeatures];
    updated[index] = value;
    setSpecialFeatures(updated);
  };

  const addSpecialFeature = () => {
    if (specialFeatures.length < 6) {
      setSpecialFeatures([...specialFeatures, '']);
    }
  };

  const removeSpecialFeature = (index) => {
    if (specialFeatures.length > 1) {
      setSpecialFeatures(specialFeatures.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!ownerPhoto) {
      alert('Please upload your photo!');
      return;
    }

    if (photos.length < 4) {
      alert('Please upload at least 4 homestay photos!');
      return;
    }

    const data = new FormData();

    // Append userId
    data.append('userId', user.id);

    // Append basic fields
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

    // Append new fields
    data.append('smokingAllowed', formData.smokingAllowed);
    data.append('petsAllowed', formData.petsAllowed);
    data.append('childrenAllowed', formData.childrenAllowed);
    data.append('additionalRules', formData.additionalRules);
    data.append('cancellationPolicy', formData.cancellationPolicy);
    
    // Filter out empty special features
    const filledFeatures = specialFeatures.filter(f => f.trim() !== '');
    data.append('specialFeatures', JSON.stringify(filledFeatures));

    // Append owner photo
    if (ownerPhoto) {
      data.append('ownerPhoto', ownerPhoto.file);
    }

    // Append citizenship files
    if (formData.citizenshipFiles) {
      Array.from(formData.citizenshipFiles).forEach(file => {
        data.append('citizenshipFiles', file);
      });
    }

    // Append tourism registration
    if (formData.tourismRegistration) {
      data.append('tourismRegistration', formData.tourismRegistration[0]);
    }

    // Append homestay photos
    photos.forEach(({ file }) => {
      data.append('homestayPhotos', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/homestay/submit', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Homestay submitted successfully!\n\n📧 You will be notified via email once the admin reviews and approves your submission.\n\n⏳ Please wait for approval before accessing the host dashboard.');
        navigate('/');
      } else {
        alert(result.message || 'Submission failed!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Submission failed! Please try again.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="homestay-form-page">
        <div className="homestay-form-container">
          <h2 className="homestay-form-title">Add Your Stay</h2>
          <p className="homestay-form-subtitle">
            Submit your homestay details for admin verification.
          </p>

          <form onSubmit={handleSubmit} className="homestay-form">
            {/* Owner Info */}
            <h3 className="homestay-section-title">Owner Information</h3>
            
            {/* Owner Photo Upload */}
            <div className="owner-photo-section">
              <label className="homestay-label">
                <span className="homestay-required">*</span> Your Photo
              </label>
              <p className="homestay-file-hint">Upload a clear photo of yourself (builds trust with guests)</p>
              
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOwnerPhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            <input
              className="homestay-input"
              name="ownerName"
              placeholder="Owner Full Name"
              value={formData.ownerName}
              onChange={handleChange}
              readOnly
              style={{ background: '#f8fafc', cursor: 'not-allowed' }}
              required
            />
            <input
              className="homestay-input"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              readOnly
              style={{ background: '#f8fafc', cursor: 'not-allowed' }}
              required
            />
            <input
              className="homestay-input"
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              className="homestay-input"
              name="citizenshipNo"
              placeholder="Citizenship Number"
              value={formData.citizenshipNo}
              onChange={handleChange}
              required
            />

            {/* Homestay Info */}
            <h3 className="homestay-section-title">Homestay Details</h3>
            <input
              className="homestay-input"
              name="homestayName"
              placeholder="Homestay Name"
              value={formData.homestayName}
              onChange={handleChange}
              required
            />
            <textarea
              className="homestay-textarea"
              name="description"
              placeholder="Describe your homestay (minimum 50 characters)"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              minLength="50"
              required
            ></textarea>

            {/* Location */}
            <h3 className="homestay-section-title">Location</h3>
            <input className="homestay-input" name="province" placeholder="Province" value={formData.province} onChange={handleChange} required />
            <input className="homestay-input" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
            <input className="homestay-input" name="municipality" placeholder="Municipality / Village" value={formData.municipality} onChange={handleChange} required />
            <input className="homestay-input" name="ward" placeholder="Ward Number" value={formData.ward} onChange={handleChange} />

            {/* Stay Info */}
            <h3 className="homestay-section-title">Stay Information</h3>
            <input className="homestay-input" name="rooms" type="number" placeholder="Total Rooms" value={formData.rooms} onChange={handleChange} required />
            <input className="homestay-input" name="guests" type="number" placeholder="Guests per Room" value={formData.guests} onChange={handleChange} />
            <input className="homestay-input" name="price" type="number" placeholder="Price per Night (NPR)" value={formData.price} onChange={handleChange} required />
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

            {/* Facilities */}
            <h3 className="homestay-section-title">Facilities</h3>
            <div className="homestay-checkbox-group">
              {["Local Food", "Cultural Experience", "Hot Water", "Free Wi-Fi", "Nature View", "Peaceful Environment"].map((item) => (
                <label key={item} className="homestay-checkbox-label">
                  <input type="checkbox" value={item} onChange={handleFacilityChange} checked={formData.facilities.includes(item)} className="homestay-checkbox" />
                  {item}
                </label>
              ))}
            </div>

            {/* NEW: Special Features */}
            <h3 className="homestay-section-title">What Makes Your Homestay Special?</h3>
            <p className="homestay-file-hint">Highlight unique features that make your homestay stand out (e.g., "Mountain view from every room", "Traditional home-cooked meals")</p>
            <div className="special-features-list">
              {specialFeatures.map((feature, index) => (
                <div key={index} className="special-feature-item">
                  <input
                    className="homestay-input"
                    placeholder={`Special feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleSpecialFeatureChange(index, e.target.value)}
                  />
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

            {/* NEW: House Rules */}
            <h3 className="homestay-section-title">House Rules</h3>
            <p className="homestay-file-hint">Set clear expectations for your guests</p>
            <div className="house-rules-section">
              <label className="rule-checkbox-label">
                <input
                  type="checkbox"
                  name="smokingAllowed"
                  checked={formData.smokingAllowed}
                  onChange={handleCheckboxChange}
                  className="homestay-checkbox"
                />
                <span>Smoking Allowed</span>
              </label>
              <label className="rule-checkbox-label">
                <input
                  type="checkbox"
                  name="petsAllowed"
                  checked={formData.petsAllowed}
                  onChange={handleCheckboxChange}
                  className="homestay-checkbox"
                />
                <span>Pets Allowed</span>
              </label>
              <label className="rule-checkbox-label">
                <input
                  type="checkbox"
                  name="childrenAllowed"
                  checked={formData.childrenAllowed}
                  onChange={handleCheckboxChange}
                  className="homestay-checkbox"
                />
                <span>Children Friendly</span>
              </label>
            </div>
            <textarea
              className="homestay-textarea"
              name="additionalRules"
              placeholder="Additional house rules (optional)"
              value={formData.additionalRules}
              onChange={handleChange}
              rows="3"
            ></textarea>

            {/* NEW: Cancellation Policy */}
            
            {/* ⭐ UPDATED: Simple Cancellation Policy Info Box */}
            <h3 className="homestay-section-title">Cancellation Policy</h3>
            <div className="cancellation-policy-info">
              <div className="policy-info-box">
                <div className="policy-icon">ℹ️</div>
                <div className="policy-content">
                  <h4>Standard Atithi Cancellation Policy</h4>
                  <p className="policy-subtitle">All homestays follow this simple, fair policy:</p>
                  <ul className="policy-points">
                    <li><strong>✅ Within 2 hours of booking:</strong> 100% refund (grace period for mistakes)</li>
                    <li><strong>✅ More than 2 hours, before check-in day:</strong> 80% refund (20% cancellation fee)</li>
                    <li><strong>❌ On check-in day or after:</strong> No cancellation allowed</li>
                  </ul>
                  <p className="policy-note">
                    💡 This policy protects both hosts and guests while maintaining flexibility for travelers. Refunds are processed within 7-10 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* KYC Documents */}
            <h3 className="homestay-section-title">KYC Documents</h3>
            <p className="homestay-kyc-note">Please upload clear copies of the required documents for verification purposes.</p>
            <div className="homestay-document-upload">
              <label className="homestay-label"><span className="homestay-required">*</span> Citizenship (Front & Back)</label>
              <p className="homestay-file-hint">Upload both sides of your citizenship card</p>
              <input className="homestay-file-input" type="file" name="citizenshipFiles" onChange={handleFileChange} multiple accept="image/*,application/pdf" required />
            </div>
            <div className="homestay-document-upload">
              <label className="homestay-label"><span className="homestay-required">*</span> Tourism Registration / Community Homestay Letter</label>
              <p className="homestay-file-hint">Upload your official tourism registration certificate or community homestay authorization letter</p>
              <input className="homestay-file-input" type="file" name="tourismRegistration" onChange={handleFileChange} accept="image/*,application/pdf" required />
            </div>

            {/* Multiple Homestay Photos */}
            <h3 className="homestay-section-title">Homestay Photos</h3>
            <label className="homestay-label">
              <span className="homestay-required">*</span> Upload Photos (Minimum 4, Maximum 10)
            </label>
            <p className="homestay-file-hint">Include photos of rooms, common areas, exterior, and surrounding views</p>
            
            {/* Photo Upload Area */}
            <div className="photo-upload-area">
              <label className="photo-upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Click to Add Photos</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
              <p className="photo-count-text">
                {photos.length}/10 photos added
                {photos.length < 4 && <span className="photo-count-warning"> (Need {4 - photos.length} more)</span>}
                {photos.length >= 4 && <span className="photo-count-ok"> ✓ Minimum requirement met</span>}
              </p>
            </div>

            {/* Photo Previews Grid */}
            {photos.length > 0 && (
              <div className="photo-preview-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={photo.preview} alt={`Photo ${index + 1}`} className="photo-preview-img" />
                    <button type="button" className="photo-remove-btn" onClick={() => removePhoto(index)}>
                      <X size={16} />
                    </button>
                    <span className="photo-number-badge">{index + 1}</span>
                  </div>
                ))}
                {photos.length < 10 && (
                  <label className="photo-add-more">
                    <Plus size={32} />
                    <span>Add More</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            )}

            {/* Declaration */}
            <div className="homestay-declaration">
              <input type="checkbox" required className="homestay-checkbox" />
              <span className="homestay-declaration-text">
                I confirm that all provided information and documents are authentic and correct. I understand that providing false information may result in rejection or legal action.
              </span>
            </div>

            <button type="submit" className="homestay-submit-btn">Submit for Verification</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default HomestayForm;