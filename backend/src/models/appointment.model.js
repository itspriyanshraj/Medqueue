import mongoose from "mongoose";

const doctorDetailsSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: "" },
  specialization: { type: String, trim: true, default: "" },
  hospitalName: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
}, { _id: false });

const medicineSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  dosage: { type: String, trim: true, default: "" },
  instructions: { type: String, trim: true, default: "" },
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
  doctorDetails: { type: doctorDetailsSchema, default: () => ({}) },
  appointmentDate: { type: Date, required: true },
  status: { type: String, enum: ["planned", "completed", "cancelled"], default: "planned" },
  diagnosis: { type: String, trim: true, maxlength: 2000, default: "" },
  notes: { type: String, trim: true, maxlength: 5000, default: "" },
  medicines: { type: [medicineSchema], default: [] },
  followUpDate: { type: Date, default: null },
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
export default Appointment;
