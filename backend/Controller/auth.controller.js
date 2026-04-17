// import userModel from '../models/usermodel.js'; 
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import Homestay from '../models/homestayModel.js';
// import transporter from '../Config/nodeMailer.js'; 


// export const register = async (req, res) => {
//   const { username, email, password, contactNumber, role } = req.body;
 
//   if (!username || !email || !password || !contactNumber) {
//     return res.json({ success: false, message: 'Missing Details' });
//   }
 
//   // Server-side password validation
//   if (password.length < 8) {
//     return res.json({ success: false, message: 'Password must be at least 8 characters' });
//   }
//   if (!/[A-Z]/.test(password)) {
//     return res.json({ success: false, message: 'Password must contain at least 1 uppercase letter' });
//   }
//   if (!/[0-9]/.test(password)) {
//     return res.json({ success: false, message: 'Password must contain at least 1 number' });
//   }
//   if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
//     return res.json({ success: false, message: 'Password must contain at least 1 special character' });
//   }
 
//   try {
//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.json({ success: false, message: "User already exists" });
//     }
 
//     const hashedPassword = await bcrypt.hash(password, 10);
 
//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     const user = new userModel({
//       username,
//       email,
//       password: hashedPassword,
//       contactNumber,
//       verifyOtp: otp,
//       verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
//       isAccountVerified: false,
//       role: role || 'tourist'
//     });
 
//     await user.save();
 
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: 'Account Verification OTP',
//       text: `Your OTP is ${otp}. Verify your account using this OTP.`
//     };
 
//     await transporter.sendMail(mailOptions);
 
//     return res.json({ success: true });
 
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
 


// // LOGIN
// export const login = async (req, res) => {

//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.json({ success: false, message: 'Email and password are required' });
//     }

//     try {

//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.json({ success: false, message: 'Invalid email' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.json({ success: false, message: 'Invalid password' });
//         }

//         // Check if account is verified (skip for admin)
//     if (!user.isAccountVerified && user.role !== 'admin') {
//       return res.json({ 
//         success: false, 
//         message: 'Please verify your email first' 
//       });
//     }

//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         // ============ CHECK IF HOST HAS APPROVED HOMESTAY ============
// let hasApprovedHomestay = false;
// if (user.role === 'host') {
//   const approvedHomestay = await Homestay.findOne({
//     hostUserId: user._id,
//     status: 'approved'
//   });
//   hasApprovedHomestay = !!approvedHomestay;
// }

//        return res.json({
//   success: true,
//   token: token,  
//   user: {
//     id: user._id,
//     username: user.username,
//     email: user.email,
//     role: user.role, 
//     isAccountVerified: user.isAccountVerified,
//      hasApprovedHomestay: hasApprovedHomestay 
//   },
// });

//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// };


// // LOGOUT
// export const logout = async (req, res) => {
//     try {

//         res.clearCookie('token', {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
//         });

//         return res.json({ success: true, message: "Logged Out" });

//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// };

// export const verifyEmail = async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.json({ success: false, message: 'Missing details' });
//   }

//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.json({ success: false, message: 'User not found' });
//     }

//     if (user.isAccountVerified) {
//       return res.json({ success: false, message: 'Account already verified' });
//     }

//     if (!user.verifyOtp || user.verifyOtp.trim() !== String(otp).trim()) {
//       return res.json({ success: false, message: 'Invalid OTP' });
//     }

//     if (user.verifyOtpExpireAt < Date.now()) {
//       return res.json({ success: false, message: 'OTP expired' });
//     }

//     //VERIFY USER
//     user.isAccountVerified = true;
//     user.verifyOtp = '';
//     user.verifyOtpExpireAt = 0;

//     await user.save();

//     //SENDING WELCOME EMAIL after verification
//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: 'Welcome to Atithi!',
//       text: `Hello ${user.username},

// Welcome to Atithi!, your local homestay booking platform.
// Your account has been successfully verified with the email: ${user.email}

// Happy travelling!`
//     };

//     await transporter.sendMail(mailOptions);

//     console.log("Email verified for:", user.email);

//     return res.json({
//       success: true,
//       message: 'Email verified and welcome email sent!'
//     });

//   } catch (error) {
//     console.error(error);
//     return res.json({ success: false, message: error.message });
//   }
// };

// // SEND RESET OTP
// export const sendResetOtp = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.json({ success: false, message: 'Email is required' });
//     }

//     try {

//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }

//         const otp = String(Math.floor(100000 + Math.random() * 900000));

//         user.resetOtp = otp;
//         user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

//         await user.save();

//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: user.email,
//             subject: 'Password Reset OTP',
//             text: `Hello ${user.username}, your verification OTP is ${otp}`,
//         };

//         await transporter.sendMail(mailOptions);

//         return res.json({ success: true, message: 'OTP sent to your email' });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };
// // RESET PASSWORD
// export const resetPassword = async (req, res) => {
//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword) {
//         return res.json({ success: false, message: 'Email, OTP, and new password are required' });
//     }
//     try {
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.json({ success: false, message: 'User not found' });
//         }

//         // Fixed OTP comparison
//         if (!user.resetOtp || user.resetOtp.trim() !== String(otp).trim()) {
//             return res.json({ success: false, message: 'Invalid OTP' });
//         }

//         if (user.resetOtpExpireAt < Date.now()) {
//             return res.json({ success: false, message: 'OTP Expired' });
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         user.password = hashedPassword;
//         user.resetOtp = '';
//         user.resetOtpExpireAt = 0;

//         await user.save();

//         return res.json({ success: true, message: 'Password has been reset successfully' });

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };
// // IS AUTHENTICATED
// export const isAuthenticated = async (req, res) => {
//     try{
//         return res.json({ success: true});
//     } catch(error){
//     return res.json({
//         success: false,
//         message: error.message,
//         user: req.user
//     });
//     }

  
// };

// // Update user profile
// export const updateProfile = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { username, email, contactNumber } = req.body;

//     // Find user
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({ success: false, message: 'User not found' });
//     }

//     // Check if email already exists (if changing)
//     if (email !== user.email) {
//       const existingUser = await userModel.findOne({ email });
//       if (existingUser) {
//         return res.json({ success: false, message: 'Email already in use' });
//       }
//     }

//     // Update user
//     user.username = username;
//     user.email = email;
//     user.contactNumber = contactNumber;

//     await user.save();

//     return res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         contactNumber: user.contactNumber,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Update profile error:', error);
//     return res.json({ success: false, message: error.message });
//   }
// };

// // Change password
// export const changePassword = async (req, res) => {
//   try {
//     const { userId, currentPassword, newPassword } = req.body;

//     // Find user
//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({ success: false, message: 'User not found' });
//     }

//     // Verify current password
//     const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
//     if (!isPasswordValid) {
//       return res.json({ success: false, message: 'Current password is incorrect' });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Update password
//     user.password = hashedPassword;
//     await user.save();

//     return res.json({
//       success: true,
//       message: 'Password changed successfully'
//     });

//   } catch (error) {
//     console.error('Change password error:', error);
//     return res.json({ success: false, message: error.message });
//   }
// };


// // Get all users (Admin only)
// export const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users, excluding password field
//     const users = await userModel.find({})
//       .select('-password')
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       users,
//       count: users.length
//     });

//   } catch (error) {
//     console.error('Get all users error:', error);
//     return res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// // import userModel from '../models/usermodel.js'; 
// // import bcrypt from 'bcryptjs';
// // import jwt from 'jsonwebtoken';
// // import Homestay from '../models/homestayModel.js';
// // import transporter from '../Config/nodeMailer.js'; 


// // export const register = async (req, res) => {
// //   const { username, email, password, contactNumber, role } = req.body;
 
// //   if (!username || !email || !password || !contactNumber) {
// //     return res.json({ success: false, message: 'Missing Details' });
// //   }
 
// //   // Server-side password validation
// //   if (password.length < 8) {
// //     return res.json({ success: false, message: 'Password must be at least 8 characters' });
// //   }
// //   if (!/[A-Z]/.test(password)) {
// //     return res.json({ success: false, message: 'Password must contain at least 1 uppercase letter' });
// //   }
// //   if (!/[0-9]/.test(password)) {
// //     return res.json({ success: false, message: 'Password must contain at least 1 number' });
// //   }
// //   if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
// //     return res.json({ success: false, message: 'Password must contain at least 1 special character' });
// //   }
 
// //   try {
// //     const existingUser = await userModel.findOne({ email });
// //     if (existingUser) {
// //       return res.json({ success: false, message: "User already exists" });
// //     }
 
// //     const hashedPassword = await bcrypt.hash(password, 10);
 
// //     const otp = String(Math.floor(100000 + Math.random() * 900000));
// //     const user = new userModel({
// //       username,
// //       email,
// //       password: hashedPassword,
// //       contactNumber,
// //       verifyOtp: otp,
// //       verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
// //       isAccountVerified: false,
// //       role: role || 'tourist'
// //     });
 
// //     await user.save();
 
// //     const mailOptions = {
// //       from: process.env.SENDER_EMAIL,
// //       to: user.email,
// //       subject: 'Account Verification OTP',
// //       text: `Your OTP is ${otp}. Verify your account using this OTP.`
// //     };
 
// //     await transporter.sendMail(mailOptions);
 
// //     return res.json({ success: true });
 
// //   } catch (error) {
// //     res.json({ success: false, message: error.message });
// //   }
// // };
 


// // // LOGIN
// // export const login = async (req, res) => {

// //     const { email, password } = req.body;

// //     if (!email || !password) {
// //         return res.json({ success: false, message: 'Email and password are required' });
// //     }

// //     try {

// //         const user = await userModel.findOne({ email });
// //         if (!user) {
// //             return res.json({ success: false, message: 'Invalid email' });
// //         }

// //         const isMatch = await bcrypt.compare(password, user.password);
// //         if (!isMatch) {
// //             return res.json({ success: false, message: 'Invalid password' });
// //         }

// //         // Check if account is verified (skip for admin)
// //         if (!user.isAccountVerified && user.role !== 'admin') {
// //           return res.json({ 
// //             success: false, 
// //             message: 'Please verify your email first' 
// //           });
// //         }

// //         // ⭐⭐⭐ NEW: CHECK IF HOST HAS APPROVED HOMESTAY ⭐⭐⭐
// //         if (user.role === 'host') {
// //           const approvedHomestay = await Homestay.findOne({
// //             hostUserId: user._id,
// //             status: 'approved'
// //           });

// //           // ✅ BLOCK LOGIN if no approved homestay
// //           if (!approvedHomestay) {
// //             // Check if they have pending homestay
// //             const pendingHomestay = await Homestay.findOne({
// //               hostUserId: user._id,
// //               status: 'pending'
// //             });

// //             if (pendingHomestay) {
// //               return res.json({
// //                 success: false,
// //                 message: 'Your homestay is pending approval. Please wait for admin approval before logging in.',
// //                 isPending: true
// //               });
// //             } else {
// //               return res.json({
// //                 success: false,
// //                 message: 'Please submit a homestay for approval before logging in as a host.',
// //                 noHomestay: true
// //               });
// //             }
// //           }
// //         }

// //         // If we reach here, user is allowed to login
// //         const token = jwt.sign(
// //             { id: user._id, role: user.role },
// //             process.env.JWT_SECRET,
// //             { expiresIn: '7d' }
// //         );

// //         res.cookie('token', token, {
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',
// //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
// //             maxAge: 7 * 24 * 60 * 60 * 1000
// //         });

// //         return res.json({
// //           success: true,
// //           token: token,  
// //           user: {
// //             id: user._id,
// //             username: user.username,
// //             email: user.email,
// //             role: user.role, 
// //             isAccountVerified: user.isAccountVerified,
// //             hasApprovedHomestay: true // Always true here (we already checked above)
// //           },
// //         });

// //     } catch (error) {
// //         return res.json({ success: false, message: error.message });
// //     }
// // };


// // // LOGOUT
// // export const logout = async (req, res) => {
// //     try {

// //         res.clearCookie('token', {
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',
// //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
// //         });

// //         return res.json({ success: true, message: "Logged Out" });

// //     } catch (error) {
// //         return res.json({ success: false, message: error.message });
// //     }
// // };

// // export const verifyEmail = async (req, res) => {
// //   const { email, otp } = req.body;

// //   if (!email || !otp) {
// //     return res.json({ success: false, message: 'Missing details' });
// //   }

// //   try {
// //     const user = await userModel.findOne({ email });
// //     if (!user) {
// //       return res.json({ success: false, message: 'User not found' });
// //     }

// //     if (user.isAccountVerified) {
// //       return res.json({ success: false, message: 'Account already verified' });
// //     }

// //     if (!user.verifyOtp || user.verifyOtp.trim() !== String(otp).trim()) {
// //       return res.json({ success: false, message: 'Invalid OTP' });
// //     }

// //     if (user.verifyOtpExpireAt < Date.now()) {
// //       return res.json({ success: false, message: 'OTP expired' });
// //     }

// //     //VERIFY USER
// //     user.isAccountVerified = true;
// //     user.verifyOtp = '';
// //     user.verifyOtpExpireAt = 0;

// //     await user.save();

// //     //SENDING WELCOME EMAIL after verification
// //     const mailOptions = {
// //       from: process.env.SENDER_EMAIL,
// //       to: user.email,
// //       subject: 'Welcome to Atithi!',
// //       text: `Hello ${user.username},

// // Welcome to Atithi!, your local homestay booking platform.
// // Your account has been successfully verified with the email: ${user.email}

// // Happy travelling!`
// //     };

// //     await transporter.sendMail(mailOptions);

// //     console.log("Email verified for:", user.email);

// //     return res.json({
// //       success: true,
// //       message: 'Email verified and welcome email sent!'
// //     });

// //   } catch (error) {
// //     console.error(error);
// //     return res.json({ success: false, message: error.message });
// //   }
// // };

// // // SEND RESET OTP
// // export const sendResetOtp = async (req, res) => {
// //     const { email } = req.body;

// //     if (!email) {
// //         return res.json({ success: false, message: 'Email is required' });
// //     }

// //     try {

// //         const user = await userModel.findOne({ email });
// //         if (!user) {
// //             return res.json({ success: false, message: 'User not found' });
// //         }

// //         const otp = String(Math.floor(100000 + Math.random() * 900000));

// //         user.resetOtp = otp;
// //         user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

// //         await user.save();

// //         const mailOptions = {
// //             from: process.env.SENDER_EMAIL,
// //             to: user.email,
// //             subject: 'Password Reset OTP',
// //             text: `Hello ${user.username}, your verification OTP is ${otp}`,
// //         };

// //         await transporter.sendMail(mailOptions);

// //         return res.json({ success: true, message: 'OTP sent to your email' });

// //     } catch (error) {
// //         res.json({ success: false, message: error.message });
// //     }
// // };

// // // RESET PASSWORD
// // export const resetPassword = async (req, res) => {
// //     const { email, otp, newPassword } = req.body;

// //     if (!email || !otp || !newPassword) {
// //         return res.json({ success: false, message: 'Email, OTP, and new password are required' });
// //     }
// //     try {
// //         const user = await userModel.findOne({ email });
// //         if (!user) {
// //             return res.json({ success: false, message: 'User not found' });
// //         }

// //         // Fixed OTP comparison
// //         if (!user.resetOtp || user.resetOtp.trim() !== String(otp).trim()) {
// //             return res.json({ success: false, message: 'Invalid OTP' });
// //         }

// //         if (user.resetOtpExpireAt < Date.now()) {
// //             return res.json({ success: false, message: 'OTP Expired' });
// //         }

// //         const hashedPassword = await bcrypt.hash(newPassword, 10);

// //         user.password = hashedPassword;
// //         user.resetOtp = '';
// //         user.resetOtpExpireAt = 0;

// //         await user.save();

// //         return res.json({ success: true, message: 'Password has been reset successfully' });

// //     } catch (error) {
// //         res.json({ success: false, message: error.message });
// //     }
// // };

// // // IS AUTHENTICATED
// // export const isAuthenticated = async (req, res) => {
// //     try{
// //         return res.json({ success: true});
// //     } catch(error){
// //     return res.json({
// //         success: false,
// //         message: error.message,
// //         user: req.user
// //     });
// //     }

  
// // };

// // // Update user profile
// // export const updateProfile = async (req, res) => {
// //   try {
// //     const { userId } = req.params;
// //     const { username, email, contactNumber } = req.body;

// //     // Find user
// //     const user = await userModel.findById(userId);
// //     if (!user) {
// //       return res.json({ success: false, message: 'User not found' });
// //     }

// //     // Check if email already exists (if changing)
// //     if (email !== user.email) {
// //       const existingUser = await userModel.findOne({ email });
// //       if (existingUser) {
// //         return res.json({ success: false, message: 'Email already in use' });
// //       }
// //     }

// //     // Update user
// //     user.username = username;
// //     user.email = email;
// //     user.contactNumber = contactNumber;

// //     await user.save();

// //     return res.json({
// //       success: true,
// //       message: 'Profile updated successfully',
// //       user: {
// //         id: user._id,
// //         username: user.username,
// //         email: user.email,
// //         contactNumber: user.contactNumber,
// //         role: user.role
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Update profile error:', error);
// //     return res.json({ success: false, message: error.message });
// //   }
// // };

// // // Change password
// // export const changePassword = async (req, res) => {
// //   try {
// //     const { userId, currentPassword, newPassword } = req.body;

// //     // Find user
// //     const user = await userModel.findById(userId);
// //     if (!user) {
// //       return res.json({ success: false, message: 'User not found' });
// //     }

// //     // Verify current password
// //     const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
// //     if (!isPasswordValid) {
// //       return res.json({ success: false, message: 'Current password is incorrect' });
// //     }

// //     // Hash new password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(newPassword, salt);

// //     // Update password
// //     user.password = hashedPassword;
// //     await user.save();

// //     return res.json({
// //       success: true,
// //       message: 'Password changed successfully'
// //     });

// //   } catch (error) {
// //     console.error('Change password error:', error);
// //     return res.json({ success: false, message: error.message });
// //   }
// // };


// // // Get all users (Admin only)
// // export const getAllUsers = async (req, res) => {
// //   try {
// //     // Fetch all users, excluding password field
// //     const users = await userModel.find({})
// //       .select('-password')
// //       .sort({ createdAt: -1 });

// //     return res.json({
// //       success: true,
// //       users,
// //       count: users.length
// //     });

// //   } catch (error) {
// //     console.error('Get all users error:', error);
// //     return res.json({
// //       success: false,
// //       message: error.message
// //     });
// //   }
// // };

import userModel from '../models/usermodel.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Homestay from '../models/homestayModel.js';
import transporter from '../Config/nodeMailer.js'; 


export const register = async (req, res) => {
  const { username, email, password, contactNumber, role } = req.body;
 
  if (!username || !email || !password || !contactNumber) {
    return res.json({ success: false, message: 'Missing Details' });
  }
 
  // Server-side password validation
  if (password.length < 8) {
    return res.json({ success: false, message: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.json({ success: false, message: 'Password must contain at least 1 uppercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    return res.json({ success: false, message: 'Password must contain at least 1 number' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.json({ success: false, message: 'Password must contain at least 1 special character' });
  }
 
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const user = new userModel({
      username,
      email,
      password: hashedPassword,
      contactNumber,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      isAccountVerified: false,
      role: role || 'tourist'
    });
 
    await user.save();
 
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. Verify your account using this OTP.`
    };
 
    await transporter.sendMail(mailOptions);
 
    return res.json({ success: true });
 
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
 


// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    if (!user.isAccountVerified && user.role !== 'admin') {
      return res.json({ success: false, message: 'Please verify your email first' });
    }

    // Host check
    if (user.role === 'host') {
      const approvedHomestay = await Homestay.findOne({
        hostUserId: user._id,
        status: 'approved'
      });

      const pendingHomestay = !approvedHomestay
        ? await Homestay.findOne({ hostUserId: user._id, status: 'pending' })
        : null;

      // Block ONLY if pending
      if (pendingHomestay) {
        return res.json({
          success: false,
          message: 'Your homestay is pending approval. Please wait for admin review.',
          isPending: true
        });
      }

      // No homestay or approved → allow login
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isAccountVerified: user.isAccountVerified,
          hasApprovedHomestay: !!approvedHomestay,
          hasNoHomestay: !approvedHomestay && !pendingHomestay
        }
      });
    }

    // ← Tourist / Admin - यो part missing थियो!
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAccountVerified: user.isAccountVerified,
        hasApprovedHomestay: user.role === 'admin' ? true : false
      }
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// LOGOUT
export const logout = async (req, res) => {
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: "Logged Out" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: 'Account already verified' });
    }

    if (!user.verifyOtp || user.verifyOtp.trim() !== String(otp).trim()) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP expired' });
    }

    //VERIFY USER
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();

    //SENDING WELCOME EMAIL after verification
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Welcome to Atithi!',
      text: `Hello ${user.username},

Welcome to Atithi!, your local homestay booking platform.
Your account has been successfully verified with the email: ${user.email}

Happy travelling!`
    };

    await transporter.sendMail(mailOptions);

    console.log("Email verified for:", user.email);

    return res.json({
      success: true,
      message: 'Email verified and welcome email sent!'
    });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// SEND RESET OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Hello ${user.username}, your verification OTP is ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Fixed OTP comparison
        if (!user.resetOtp || user.resetOtp.trim() !== String(otp).trim()) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// IS AUTHENTICATED
export const isAuthenticated = async (req, res) => {
    try{
        return res.json({ success: true});
    } catch(error){
    return res.json({
        success: false,
        message: error.message,
        user: req.user
    });
    }

  
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, contactNumber } = req.body;

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Check if email already exists (if changing)
    if (email !== user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.json({ success: false, message: 'Email already in use' });
      }
    }

    // Update user
    user.username = username;
    user.email = email;
    user.contactNumber = contactNumber;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.json({ success: false, message: error.message });
  }
};


// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding password field
    const users = await userModel.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};