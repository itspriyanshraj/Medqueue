
import { Router } from "express";
import { createDoctor, getAllDoctors, updateDoctor } from "../controllers/doctor.controller.js";
import { requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", getAllDoctors);
router.post("/", requireAdmin, createDoctor);
router.patch("/:id", requireAdmin, updateDoctor);

export default router;
