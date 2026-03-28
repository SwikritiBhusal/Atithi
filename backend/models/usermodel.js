import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },   
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String },

  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },

  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },

    role: {
    type: String,
    enum: ["admin", "host", "tourist"],
    default: "tourist",
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
    },
  ],

  isAccountVerified: { type: Boolean, default: false },

    
});

export default mongoose.model("User", userSchema);
