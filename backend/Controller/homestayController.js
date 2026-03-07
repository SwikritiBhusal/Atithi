import Homestay from '../models/homestayModel.js';
// import userModel from '../models/usermodel.js';
import transporter from '../Config/nodeMailer.js';

// Submit homestay for verification
export const submitHomestay = async (req, res) => {
  try {
    const {
      userId,
      ownerName, email, phone, citizenshipNo,
      homestayName, description,
      province, district, municipality, ward,
      rooms, guests, price, checkIn, checkOut,
      facilities,
      // NEW FIELDS
      smokingAllowed, petsAllowed, childrenAllowed,
      additionalRules, cancellationPolicy, specialFeatures
    } = req.body;

    // Parse arrays
    const facilitiesArray = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    const specialFeaturesArray = typeof specialFeatures === 'string' ? JSON.parse(specialFeatures) : specialFeatures;

    // Extract Cloudinary URLs
    const citizenshipFiles = req.files['citizenshipFiles']
      ? req.files['citizenshipFiles'].map(file => ({
          url: file.path,
          public_id: file.filename
        }))
      : [];

    const tourismRegistration = req.files['tourismRegistration']
      ? {
          url: req.files['tourismRegistration'][0].path,
          public_id: req.files['tourismRegistration'][0].filename
        }
      : null;

    const homestayPhotos = req.files['homestayPhotos']
      ? req.files['homestayPhotos'].map(file => ({
          url: file.path,
          public_id: file.filename
        }))
      : [];

    // NEW: Owner Photo
    const ownerPhoto = req.files['ownerPhoto']
      ? {
          url: req.files['ownerPhoto'][0].path,
          public_id: req.files['ownerPhoto'][0].filename
        }
      : null;

    // Validations
    if (!ownerName || !email || !phone || !citizenshipNo || !homestayName) {
      return res.json({ success: false, message: 'Please fill all required fields' });
    }

    if (!ownerPhoto) {
      return res.json({ success: false, message: 'Please upload your photo' });
    }

    if (citizenshipFiles.length === 0) {
      return res.json({ success: false, message: 'Please upload citizenship documents' });
    }

    if (!tourismRegistration) {
      return res.json({ success: false, message: 'Please upload tourism registration document' });
    }

    if (homestayPhotos.length < 4) {
      return res.json({ success: false, message: 'Please upload at least 4 homestay photos' });
    }

    // Create homestay
    const homestay = new Homestay({
      ownerName,
      email,
      phone,
      citizenshipNo,
      ownerPhoto, // ← NEW
      homestayName,
      description,
      province,
      district,
      municipality,
      ward,
      rooms,
      guests,
      price,
      checkIn,
      checkOut,
      facilities: facilitiesArray,
      specialFeatures: specialFeaturesArray, // ← NEW
      smokingAllowed: smokingAllowed === 'true', // ← NEW
      petsAllowed: petsAllowed === 'true',       // ← NEW
      childrenAllowed: childrenAllowed === 'true', // ← NEW
      additionalRules,                            // ← NEW
      cancellationPolicy,                         // ← NEW
      citizenshipFiles,
      tourismRegistration,
      homestayPhotos,
      status: 'pending',
      hostUserId: userId
    });

    await homestay.save();

    return res.json({
      success: true,
      message: 'Homestay submitted successfully! Admin will review within 2-3 business days.',
      homestayId: homestay._id
    });

  } catch (error) {
    console.error('Homestay submission error:', error);
    return res.json({
      success: false,
      message: error.message || 'Something went wrong during submission'
    });
  }
};

// Get all homestays
export const getAllHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find().sort({ submittedAt: -1 });
    return res.json({ success: true, homestays });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get homestay by ID
export const getHomestayById = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) return res.json({ success: false, message: 'Homestay not found' });
    return res.json({ success: true, homestay });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get pending homestays
export const getPendingHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find({ status: 'pending' }).sort({ submittedAt: -1 });
    return res.json({ success: true, count: homestays.length, homestays });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get approved homestays (for public listings)
export const getApprovedHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find({ status: 'approved' })
      .select('-citizenshipFiles -tourismRegistration -citizenshipNo -adminRemarks')
      .sort({ approvedAt: -1 });
    
    return res.json({ success: true, homestays });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Approve homestay
export const approveHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const homestay = await Homestay.findById(id);
    if (!homestay) return res.json({ success: false, message: 'Homestay not found' });

    if (homestay.status !== 'pending') {
      return res.json({ success: false, message: 'Homestay is not pending' });
    }

    homestay.status = 'approved';
    homestay.approvedAt = new Date();
    homestay.adminRemarks = remarks || 'Approved by admin';

    await homestay.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: homestay.email,
      subject: '🎉 Your Homestay is Approved! - Atithi',
      text: `
Dear ${homestay.ownerName},

Congratulations! Your homestay "${homestay.homestayName}" has been approved on Atithi.

Your homestay is now live and visible to tourists!

You can login to your host dashboard using your existing credentials at:
http://localhost:5173/login

Thank you for joining Atithi!
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Homestay approved and notification sent!'
    });

  } catch (error) {
    console.error('Approve error:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Reject homestay
export const rejectHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.json({ success: false, message: 'Rejection reason is required' });
    }

    const homestay = await Homestay.findById(id);
    if (!homestay) return res.json({ success: false, message: 'Homestay not found' });

    if (homestay.status !== 'pending') {
      return res.json({ success: false, message: 'Homestay is not pending' });
    }

    homestay.status = 'rejected';
    homestay.rejectedAt = new Date();
    homestay.adminRemarks = remarks;

    await homestay.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: homestay.email,
      subject: 'Homestay Verification Update - Atithi',
      text: `
Dear ${homestay.ownerName},

Thank you for submitting your homestay "${homestay.homestayName}" on Atithi.

After reviewing your application, we were unable to approve it at this time.

Reason: ${remarks}

You may resubmit your application after addressing the above issue.

For any queries, contact our support team.

Thank you,
Atithi Team
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Homestay rejected and notification sent to owner.'
    });

  } catch (error) {
    console.error('Reject error:', error);
    return res.json({ success: false, message: error.message });
  }
};
// Get host's own homestay
export const getMyHomestay = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const homestay = await Homestay.findOne({ 
      hostUserId: userId,
      status: 'approved' // Only show if approved
    });
    
    if (!homestay) {
      return res.json({ 
        success: false, 
        message: 'No approved homestay found' 
      });
    }
    
    return res.json({ 
      success: true, 
      homestay 
    });
  } catch (error) {
    return res.json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update homestay (host can edit their own)
export const updateHomestay = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Fields that hosts can update
    const allowedFields = [
      'homestayName',
      'description',
      'rooms',
      'guests',
      'price',
      'checkIn',
      'checkOut',
      'facilities',
      'specialFeatures',
      'smokingAllowed',
      'petsAllowed',
      'childrenAllowed',
      'additionalRules',
      'cancellationPolicy'
    ];
    
    // Filter only allowed fields
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });
    
    const homestay = await Homestay.findByIdAndUpdate(
      id,
      filteredData,
      { new: true, runValidators: true }
    );
    
    if (!homestay) {
      return res.json({ 
        success: false, 
        message: 'Homestay not found' 
      });
    }
    
    return res.json({ 
      success: true, 
      message: 'Homestay updated successfully',
      homestay 
    });
  } catch (error) {
    return res.json({ 
      success: false, 
      message: error.message 
    });
  }
};