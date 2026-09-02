import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//Function to check availablity of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lt: new Date(checkOutDate) },
            checkOutDate: { $gt: new Date(checkInDate) },
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}
//API to check availability of room
// POST /api/bookings/check-availability

export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
//API to check a new booking
// POST /api/bookings/book

export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, userEmail } = req.body;
        const user = req.user._id;

        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });

        if (!isAvailable) {
            return res.json({ success: false, message: "room is not available" })
        }

        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }

        let totalPrice = roomData.pricePerNight;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
        });

        // Determine real recipient email
        let recipientEmail = req.user.email;
        if (userEmail && (!recipientEmail || recipientEmail.endsWith('@clerkuser.com'))) {
            recipientEmail = userEmail;
            try {
                req.user.email = userEmail;
                await req.user.save();
            } catch (saveErr) {
                console.log("Could not update user email in DB:", saveErr.message);
            }
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: recipientEmail,
            subject: "Hotel Booking Details",
            html: `
            <h2>Booking Details</h2>
            <p>Dear ${req.user?.username || 'Guest'},</p>
            <p>Thank you for choosing us for your stay. Your booking is confirmed! Please review the details below.</p>
            <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Hotel Name:</strong> ${roomData.hotel?.name || 'Hotel'}</li>
                <li><strong>Location:</strong> ${roomData.hotel?.address || 'Location'}</li>
                <li><strong>Date:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toDateString() : ''}</li>
                <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}</li>
            </ul>
            <p>We look forward to welcoming you!</p>
            <p>If you have any questions, please feel free to contact us.</p>
            `
        };

        try {
            console.log("Sending booking confirmation email to:", recipientEmail);
            const mailInfo = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully. MessageId:", mailInfo.messageId);
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }
        res.json({ success: true, message: "Booking created successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "failed to create booking" })
    }
}
//API to get all bookings for a user
// GET /api/bookings/user

export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 })
        res.json({ success: true, bookings })
    } catch (error) {
        res.json({ success: false, message: "failed to fetch booking" })
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.json({ success: false, message: "No Hotel found" })
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });

        const totalBookings = bookings.length;

        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)

        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } })

    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" })
    }

} 