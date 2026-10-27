import { Router } from "express";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { clearSessionCookie, requireAdmin, requireAuth, setSessionCookie } from "../middleware/requireAuth.js";

const router = Router();
const scrypt = promisify(scryptCallback);
const passwordLength = 64;

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role || "patient", patientProfile: user.patientProfile || {} };
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await scrypt(password, salt, passwordLength);
  return `${salt}:${key.toString("hex")}`;
}

async function passwordMatches(password, storedHash) {
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2 || name.length > 100) return res.status(400).json({ message: "Enter your name (2–100 characters)." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 10) return res.status(400).json({ message: "Password must be at least 10 characters." });

    const submittedProfile = req.body.patientProfile || {};
    const age = submittedProfile.age === "" || submittedProfile.age == null ? null : Number(submittedProfile.age);
    const validGenders = ["", "male", "female", "other", "woman", "man", "non-binary", "prefer-not-to-say"];
    const validBloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
    if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) return res.status(400).json({ message: "Enter an age between 0 and 120." });
    if (submittedProfile.gender && !validGenders.includes(submittedProfile.gender)) return res.status(400).json({ message: "Choose a valid gender option." });
    if (submittedProfile.bloodGroup && !validBloodGroups.includes(submittedProfile.bloodGroup)) return res.status(400).json({ message: "Choose a valid blood group." });

    const patientProfile = {
      age,
      gender: submittedProfile.gender || "",
      phone: String(submittedProfile.phone || "").trim().slice(0, 30),
      bloodGroup: submittedProfile.bloodGroup || "",
    };

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists. Please sign in." });

    const user = await User.create({ name, email, passwordHash: await hashPassword(password), patientProfile });
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || user.role === "admin" || !(await passwordMatches(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    setSessionCookie(res, user._id);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await passwordMatches(password, user.passwordHash)) || user.role !== "admin") {
      return res.status(401).json({ message: "Admin email or password is incorrect." });
    }

    setSessionCookie(res, user._id);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.get("/users", requireAdmin, async (_req, res, next) => {
  try {
    const users = await User.find({}, "name email role createdAt patientProfile").sort({ createdAt: -1 }).lean();
    return res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user account." });
    if (!["patient", "admin"].includes(req.body.role)) return res.status(400).json({ message: "Choose a valid account role." });
    if (String(req.user._id) === req.params.id) return res.status(403).json({ message: "You cannot change your own admin role." });

    const user = await User.findById(req.params.id).select("name email role createdAt patientProfile");
    if (!user) return res.status(404).json({ message: "User account not found." });
    if (user.role === "admin" && req.body.role === "patient") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) return res.status(409).json({ message: "The last admin account cannot be changed to a patient role." });
    }

    user.role = req.body.role;
    await user.save();
    return res.json({ user: { ...publicUser(user), createdAt: user.createdAt } });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

export default router;
