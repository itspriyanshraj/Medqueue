import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema({
  age: { type: Number, min: 0, max: 120, default: null },
  gender: { type: String, enum: ["", "male", "female", "other", "woman", "man", "non-binary", "prefer-not-to-say"], default: "" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  bloodGroup: { type: String, enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"], default: "" },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["patient", "admin"], default: "patient", index: true },
  patientProfile: { type: patientProfileSchema, default: () => ({}) },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
