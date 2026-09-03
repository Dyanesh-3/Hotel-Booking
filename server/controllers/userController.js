import nodemailer from "nodemailer";
import Subscriber from "../models/Subscriber.js";

// Nodemailer transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// GET /api/user
// Returns the logged-in user's data from MongoDB using their Clerk ID
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success: true, role, recentSearchedCities, user: req.user})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res)=>{
    try {
        const {recentSearchCity} = req.body;
        const user = req.user;

        if(!user.recentSearchedCities){
            user.recentSearchedCities = [];
        }

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchCity)
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchCity)
        }
        await user.save();
        res.json({success: true, message: "City added"})

    } catch(error){
        res.json({success: false, message: error.message})
    }
};

// POST /api/user/subscribe
// Subscribe to newsletter - validate, store, and send welcome email
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.json({ success: false, message: "Please enter a valid email address." });
        }

        // Check for duplicate subscriber
        const existing = await Subscriber.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.json({ success: false, message: "This email is already subscribed!" });
        }

        // Save new subscriber
        await Subscriber.create({ email: email.toLowerCase() });

        // Send welcome email with promo code
        const promoCode = "VELORE10";
        await transporter.sendMail({
            from: `"veloreStay" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Welcome to veloreStay — Here's your exclusive offer 🎉",
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #333;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #fff;">velore<span style="color: #f59e0b;">Stay</span></h1>
                        <p style="margin: 8px 0 0; color: #888; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Your World-Class Stay Awaits</p>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #fff;">Welcome aboard! 🌟</h2>
                        <p style="margin: 0 0 20px; color: #aaa; line-height: 1.7; font-size: 15px;">
                            Thank you for subscribing to the veloreStay newsletter. You're now part of an exclusive community that gets first access to our finest hotel deals, curated travel inspiration, and members-only offers.
                        </p>
                        <p style="margin: 0 0 24px; color: #aaa; line-height: 1.7; font-size: 15px;">As a welcome gift, enjoy <strong style="color: #f59e0b;">10% off your first booking</strong> with the code below:</p>
                        <div style="background: #1a1a1a; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 32px;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #888; letter-spacing: 2px; text-transform: uppercase;">Your Promo Code</p>
                            <p style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #f59e0b;">${promoCode}</p>
                        </div>
                        <p style="margin: 0 0 12px; color: #666; font-size: 13px; line-height: 1.6;">
                            ✦ Valid for 30 days from subscription date<br>
                            ✦ Applicable on all hotel bookings<br>
                            ✦ Cannot be combined with other offers
                        </p>
                    </div>
                    <div style="padding: 24px 40px; background: #0a0a0a; border-top: 1px solid #222; text-align: center;">
                        <p style="margin: 0; color: #555; font-size: 12px;">© 2025 veloreStay. All rights reserved.</p>
                        <p style="margin: 6px 0 0; color: #444; font-size: 11px;">You received this because you subscribed at velorestay.com</p>
                    </div>
                </div>
            `,
        });

        res.json({ success: true, message: "Subscribed successfully! Check your email for a welcome offer." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
