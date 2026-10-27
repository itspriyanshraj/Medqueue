
import express from "express";
import cors from "cors";
import doctorRoutes from "./routes/doctor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MedQueue backend is running!"
  });
});

export default app;
