import express from "express";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/me - get current logged-in user from MongoDB
// Auth is handled inside the controller via req.auth from clerkMiddleware
router.get("/me", getMe);

export default router;
