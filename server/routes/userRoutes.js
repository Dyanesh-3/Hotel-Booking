import express from "express";
import { getMe } from "../controllers/userController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// GET /api/users/me - get current logged-in user from MongoDB
router.get("/me", requireAuth(), getMe);

export default router;
