import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Stripe from "stripe";

//Function to check availablity of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const roomData = await Room.findById(room).populate('hotel');
        if (!roomData) return false;
        
        if (!roomData.isAvailable) return false;
        if (roomData.hotel.status !== 'approved' || !roomData.hotel.isActive) return false;

        const bookings = await Booking.find({
            room,
            status: { $ne: 'cancelled' },
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
// Helper function to validate booking dates consistently
export const validateBookingDates = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) {
        return { valid: false, message: "Check-in and check-out dates are required." };
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return { valid: false, message: "Invalid date format." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInMidnight = new Date(checkIn);
    checkInMidnight.setHours(0, 0, 0, 0);

    const checkOutMidnight = new Date(checkOut);
    checkOutMidnight.setHours(0, 0, 0, 0);

    if (checkInMidnight < today) {
        return { valid: false, message: "Check-in date cannot be in the past." };
    }

    if (checkOutMidnight <= checkInMidnight) {
        return { valid: false, message: "Check-out date must be strictly after check-in date." };
    }

    return { valid: true, checkIn, checkOut };
};

//API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        if (!room) {
            return res.status(400).json({ success: false, message: "Room ID is required" });
        }

        const dateValidation = validateBookingDates(checkInDate, checkOutDate);
        if (!dateValidation.valid) {
            return res.status(400).json({ success: false, message: dateValidation.message });
        }

        const isAvailable = await checkAvailability({ 
            checkInDate: dateValidation.checkIn, 
            checkOutDate: dateValidation.checkOut, 
            room 
        });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//API to create a new booking
// POST /api/bookings/create
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, userEmail } = req.body;
        const user = req.user._id;

        if (!room) {
            return res.status(400).json({ success: false, message: "Room ID is required" });
        }

        // 1. Validate dates FIRST
        const dateValidation = validateBookingDates(checkInDate, checkOutDate);
        if (!dateValidation.valid) {
            return res.status(400).json({ success: false, message: dateValidation.message });
        }
        const { checkIn, checkOut } = dateValidation;

        // 2. Validate guests as a positive integer
        const parsedGuests = Number(guests);
        if (!parsedGuests || isNaN(parsedGuests) || parsedGuests < 1 || !Number.isInteger(parsedGuests)) {
            return res.status(400).json({ success: false, message: "Guest count must be a positive integer." });
        }

        // 3. Validate Room & Hotel status
        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        if (roomData.hotel.status !== "approved" || !roomData.hotel.isActive) {
            return res.status(403).json({ success: false, message: "Hotel is not currently available for booking." });
        }

        // 4. Check availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });

        if (!isAvailable) {
            return res.status(400).json({ success: false, message: "Room is not available for the selected dates." });
        }

        // 5. Calculate price & create booking
        let totalPrice = roomData.pricePerNight;
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        totalPrice *= nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: parsedGuests,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
            status: "confirmed",
            paymentStatus: "pending"
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
        res.json({ success: true, message: "Booking created successfully", booking })

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

export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const user = req.user._id;

        const booking = await Booking.findOne({ _id: bookingId, user });
        if (!booking) {
            return res.json({ success: false, message: "Booking not found or unauthorized" });
        }

        if (booking.status === 'cancelled') {
            return res.json({ success: false, message: "Booking is already cancelled" });
        }

        if (booking.status === 'completed') {
            return res.json({ success: false, message: "Cannot cancel a completed booking" });
        }

        booking.status = 'cancelled';
        if (booking.paymentStatus === 'paid') {
            // Note: We don't automatically refund Stripe here unless we use the Stripe API.
            // For now, mark as refunded if we assume a manual/stub refund.
            // But per instructions: "DO NOT claim a refund unless a real refund operation occurred."
            // So we'll keep it as 'paid' or mark it for review. The instructions said: 
            // "If online payment was already completed: DO NOT claim a refund unless a real refund operation occurred."
            // We just cancel the booking status.
        }

        await booking.save();
        res.json({ success: true, message: "Booking cancelled successfully", booking });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.json({ success: false, message: "No Hotel found" })
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });
        const rooms = await Room.find({ hotel: hotel._id });

        const totalRooms = rooms.length;
        const availableRooms = rooms.filter(r => r.isAvailable).length;
        const unavailableRooms = totalRooms - availableRooms;

        const totalBookings = bookings.length;
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const upcomingBookings = bookings.filter(b => b.status !== 'cancelled' && new Date(b.checkInDate) >= today).length;

        const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.status !== 'cancelled' ? booking.totalPrice : 0), 0)
        const totalPaidRevenue = bookings.reduce((acc, booking) => acc + (booking.paymentStatus === 'paid' ? booking.totalPrice : 0), 0)

        res.json({ 
            success: true, 
            dashboardData: { 
                totalRooms,
                availableRooms,
                unavailableRooms,
                totalBookings, 
                upcomingBookings,
                totalRevenue, 
                totalPaidRevenue,
                bookings,
                status: hotel.status,
                rejectionReason: hotel.rejectionReason,
                suspensionReason: hotel.suspensionReason
            } 
        })

    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" })
    }
}

export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Bug fix 1: findId → findById
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;

        // Bug fix 2: stripe is a constructor - initialize correctly
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Bug fix 3: line_items must be an ARRAY [], not an object {}
        // Bug fix 4: price_data needs { currency, unit_amount, product_data } - not just "usd"
        const line_items = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100,
                },
                quantity: 1,
            }
        ];

        // Bug fix 5: sessions.create() not sessions.created()
        // Bug fix 6: checkout.sessions (lowercase) not Checkout.sessions
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId,
            }
        });

        res.json({ success: true, url: session.url });

    } catch (error) {
        console.error("Stripe payment error:", error.message);
        res.json({ success: false, message: error.message });
    }
}