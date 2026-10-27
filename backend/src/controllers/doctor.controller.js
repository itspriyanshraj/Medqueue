import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      hospitalName,
      address,
      city,
      consultationFee,
      availableDays,
      availableTime,
      profileImage,
      isAvailable,
    } = req.body;

    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      hospitalName,
      address,
      city,
      consultationFee,
      availableDays: Array.isArray(availableDays) ? availableDays : [],
      availableTime: availableTime || "",
      profileImage: profileImage || "",
      isAvailable: isAvailable !== false,
    });

    return res.status(201).json({ success: true, doctor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A doctor with this email already exists." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Could not save the doctor. Please try again." });
  }
};

export const updateDoctor = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid doctor profile." });
  }

  const editableFields = [
    "name", "email", "phone", "specialization", "qualification", "experience",
    "hospitalName", "address", "city", "consultationFee", "availableDays",
    "availableTime", "profileImage", "isAvailable",
  ];
  const updates = Object.fromEntries(
    editableFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]]),
  );
  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: "Provide at least one doctor detail to update." });
  }
  if (Object.hasOwn(updates, "availableDays") && !Array.isArray(updates.availableDays)) {
    return res.status(400).json({ success: false, message: "Available days must be a list." });
  }

  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found." });
    return res.json({ success: true, doctor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A doctor with this email already exists." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Could not update the doctor. Please try again." });
  }
};
