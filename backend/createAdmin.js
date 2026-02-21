import dotenv from "dotenv";

dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/usermodel.js";


async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("admin already exists!");
      return process.exit();
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      email: "admin1@gmail.com",
      password: hashedPassword, // save hashed password
      role: "admin",
      isAccountVerified: true
    });

    console.log("admin created successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

createAdmin();