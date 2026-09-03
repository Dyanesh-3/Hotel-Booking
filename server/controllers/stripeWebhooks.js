import Stripe from "stripe";
import Booking from "../models/Booking.js";

// API to handle Stripe Webhooks
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_KEY;
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const payment_intentId = paymentIntent.id;

            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: payment_intentId,
            });
            const bookingId = sessions.data?.[0]?.metadata?.bookingId;

            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    status: "confirmed",
                    paymentMethod: "Stripe",
                });
            }
        } else if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata?.bookingId;

            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    status: "confirmed",
                    paymentMethod: "Stripe",
                });
            }
        } else {
            console.log("Unhandled event type:", event.type);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Error processing webhook:", error.message);
        res.status(500).json({ error: "Webhook handler failed" });
    }
};

    
