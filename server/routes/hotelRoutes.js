import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    registerHotel, 
    getOwnerHotel, 
    updateHotel, 
    resubmitHotel,
    getDestinations
} from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.get('/destinations', getDestinations);
hotelRouter.post('/', protect, registerHotel);
hotelRouter.get('/my-hotel', protect, getOwnerHotel);
hotelRouter.put('/:id', protect, updateHotel);
hotelRouter.put('/:id/resubmit', protect, resubmitHotel);

export default hotelRouter;
