
import express from "express";
import cors from "cors";
import doctorRoutes from "./routes/doctor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import connectDB from "./config/db.js";

const app = express();

const allowedOrigins = new Set([
  "https://medqueue-first.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
]);

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "MedQueue backend is running!" });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(503).json({ success: false, message: "The database is temporarily unavailable." });
  }
});
app.use("/api/doctors", doctorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error.message);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  res.status(status).json({
    success: false,
    message: status === 400 ? "The request body is invalid." : "An unexpected server error occurred.",
  });
});

export default app;
