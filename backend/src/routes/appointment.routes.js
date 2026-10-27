import { Router } from "express";
import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

function serializeAppointment(appointment) {
  const data = appointment.toObject();
  const doctor = data.doctorId || data.doctorDetails || null;
  delete data.doctorId;
  delete data.doctorDetails;
  return { ...data, doctor };
}

router.get("/", async (req, res, next) => {
  try {
    const visits = await Appointment.find({ userId: req.user._id })
      .populate("doctorId", "name specialization hospitalName city")
      .sort({ appointmentDate: -1 });
    res.json({ appointments: visits.map(serializeAppointment) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const date = new Date(req.body.appointmentDate);
    if (!Number.isFinite(date.getTime())) return res.status(400).json({ message: "Choose a valid appointment date and time." });

    let doctorId = null;
    let doctorDetails = req.body.doctor || {};
    if (req.body.doctorId) {
      if (!mongoose.isValidObjectId(req.body.doctorId)) return res.status(400).json({ message: "Choose a valid doctor." });
      const doctor = await Doctor.findById(req.body.doctorId).select("name specialization hospitalName city");
      if (!doctor) return res.status(404).json({ message: "The selected doctor could not be found." });
      doctorId = doctor._id;
    } else if (!String(doctorDetails.name || "").trim()) {
      return res.status(400).json({ message: "Enter a doctor name or choose a doctor from the directory." });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      doctorId,
      doctorDetails,
      appointmentDate: date,
      status: req.body.status === "completed" ? "completed" : "planned",
      diagnosis: req.body.diagnosis || "",
      notes: req.body.notes || "",
      medicines: Array.isArray(req.body.medicines) ? req.body.medicines : [],
      followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
    });
    await appointment.populate("doctorId", "name specialization hospitalName city");
    res.status(201).json({ appointment: serializeAppointment(appointment) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid appointment." });
    if (!["planned", "completed", "cancelled"].includes(req.body.status)) {
      return res.status(400).json({ message: "Choose a valid appointment status." });
    }
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true },
    ).populate("doctorId", "name specialization hospitalName city");
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    res.json({ appointment: serializeAppointment(appointment) });
  } catch (error) {
    next(error);
  }
});

export default router;
