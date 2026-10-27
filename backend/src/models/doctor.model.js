
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Doctor email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Doctor phone number is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },

    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },

    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },

    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Hospital address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
    },

    availableDays: {
      type: [String],
      default: [],
    },

    availableTime: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
