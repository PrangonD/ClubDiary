require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Seed initial System Admin
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "System Admin" });
    if (existingAdmin) {
      console.log("System Admin already exists");
      return;
    }

    // Get admin details from env
    const name = process.env.ADMIN_NAME || "System Admin";
    const email = process.env.ADMIN_EMAIL || "admin@clubdiary.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: "System Admin",
    });

    console.log("System Admin created:", admin.email);
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedAdmin();
  process.exit();
};

runSeed();
