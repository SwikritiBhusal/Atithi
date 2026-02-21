// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import userModel from '../models/usermodel.js';
// import transporter from '../Config/nodeMailer.js';




// export const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await User.findOne({ email, role: "admin" });

//     if (!admin) {
//       return res.status(401).json({ message: "Admin not found" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: admin.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       message: "Admin login successful",
//       token,
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };