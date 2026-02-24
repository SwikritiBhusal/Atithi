import express from 'express';
import { register, login, logout, verifyEmail, sendResetOtp, resetPassword, getAllUsers } from '../Controller/auth.controller.js';
//  verifyEmail, resetPassword, sendResetOtp
import userAuth from '../Middleware/auth.middleware.js'; 
import { isAuthenticated,  updateProfile, changePassword } from '../Controller/auth.controller.js';



const authRouter = express.Router();  

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
//authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/email-verify',  verifyEmail);

authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);
// PUT: Update user profile
authRouter.put('/update-profile/:userId', updateProfile);

// PUT: Change password
authRouter.put('/change-password', changePassword);

// GET: Get all users (Admin only)
authRouter.get('/users', getAllUsers);








export default authRouter;