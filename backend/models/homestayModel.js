

import mongoose from 'mongoose';

const homestaySchema = new mongoose.Schema({
  // Owner Information
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  citizenshipNo: { type: String, required: true },
  ownerPhoto: {  // ← NEW
    url: String,
    public_id: String
  },
  
  // Homestay Details
  homestayName: { type: String, required: true },
  description: { type: String, required: true },
  
  // Location
  province: { type: String, required: true },
  district: { type: String, required: true },
  municipality: { type: String, required: true },
  ward: String,
  
  // Stay Information
  rooms: { type: Number, required: true },
  guests: Number,
  price: { type: Number, required: true },
  checkIn: String,
  checkOut: String,
  
  // Facilities
  facilities: [String],
  
  // NEW: Special Features
  specialFeatures: [String],  // ← NEW
  
  // NEW: House Rules
  smokingAllowed: { type: Boolean, default: false },  // ← NEW
  petsAllowed: { type: Boolean, default: false },      // ← NEW
  childrenAllowed: { type: Boolean, default: true },   // ← NEW
  additionalRules: String,                              // ← NEW
  
  // NEW: Cancellation Policy
  cancellationPolicy: {  // ← NEW
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  
  // Documents
  citizenshipFiles: [{
    url: String,
    public_id: String
  }],
  tourismRegistration: {
    url: String,
    public_id: String
  },
  
  // Photos (Now multiple)
  homestayPhotos: [{
    url: String,
    public_id: String
  }],
  
  // Status & Admin
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  rejectedAt: Date,
  adminRemarks: String
});

const Homestay = mongoose.models.Homestay || mongoose.model('Homestay', homestaySchema);
export default Homestay;