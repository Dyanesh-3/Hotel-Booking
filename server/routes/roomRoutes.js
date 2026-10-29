import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    createRoom,
    getRooms,
    getOwnerRooms,
    toggleRoomAvailability,
    getUploadSignature
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.get('/upload-signature', protect, getUploadSignature);
roomRouter.post('/', upload.array("images", 4), protect, createRoom);
roomRouter.get('/', getRooms);
roomRouter.get('/owner', protect, getOwnerRooms);
roomRouter.post('/toggle-availability', protect, toggleRoomAvailability);

export default roomRouter;
