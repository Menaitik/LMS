/**
 * Run once to create the default admin account:
 *   node server/seed-admin.js
 *
 * Change credentials anytime directly in MongoDB Atlas.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Profile = require("./models/Profile");

const DEFAULT_EMAIL = "admin@studynotion.com";
const DEFAULT_PASSWORD = "Admin@123456";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: DEFAULT_EMAIL });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    await mongoose.disconnect();
    return;
  }

  const profile = await Profile.create({
    gender: null, dateOfBirth: null, about: "Platform Administrator", contactNumber: "",
  });

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const admin = await User.create({
    firstName: "Admin",
    lastName: "StudyNotion",
    email: DEFAULT_EMAIL,
    password: hashed,
    accountType: "Admin",
    approved: true,
    active: true,
    image: `https://api.dicebear.com/5.x/initials/svg?seed=Admin`,
    additionalDetails: profile._id,
  });

  console.log("✅ Admin created successfully!");
  console.log("   Email   :", DEFAULT_EMAIL);
  console.log("   Password:", DEFAULT_PASSWORD);
  console.log("   ID      :", admin._id);
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
