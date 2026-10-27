import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";

const email = String(process.argv[2] || "").trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run make-admin -- user@example.com");
  process.exitCode = 1;
} else {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true },
    ).select("email role");

    if (!user) {
      console.error(`No account found for ${email}. Create the account first, then run this command again.`);
      process.exitCode = 1;
    } else {
      console.log(`${user.email} now has the ${user.role} role.`);
    }
  } catch (error) {
    console.error("Could not assign the admin role:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
