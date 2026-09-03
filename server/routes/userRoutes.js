import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {getUserData, storeRecentSearchedCities, subscribeNewsletter} from "../controllers/userController.js"

const userRouter = express.Router();

// GET /api/users/me - get current logged-in user from MongoDB
// Auth is handled inside the controller via req.auth from clerkMiddleware
userRouter.get('/', protect, getUserData);
userRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
userRouter.post('/subscribe', subscribeNewsletter);

export default userRouter;
