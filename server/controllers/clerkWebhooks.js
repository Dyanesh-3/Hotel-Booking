import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // req.body is RAW BUFFER
        let payload;
        if (typeof req.body === "string") {
            payload = req.body;
        } else if (Buffer.isBuffer(req.body)) {
            payload = req.body.toString('utf8');
        } else if (typeof req.body === "object") {
            payload = JSON.stringify(req.body);
            console.log("WARNING: Vercel pre-parsed the body into an object. Signature verification might fail due to formatting differences.");
        } else {
            payload = req.body?.toString();
        }

        console.log("Webhook payload type:", typeof req.body, "IsBuffer:", Buffer.isBuffer(req.body));
        console.log("Payload start:", payload?.substring(0, 50));
        console.log("Using Webhook Secret starting with:", process.env.CLERK_WEBHOOK_SECRET?.substring(0, 10));

        await whook.verify(payload, headers);

        const { data, type } = JSON.parse(payload);

        console.log("=================================");
        console.log("Webhook received:", type);
        console.log("Clerk User ID:", data.id);

        const userData = {
            _id: data.id,
            email: data.email_addresses && data.email_addresses.length > 0 ? data.email_addresses[0].email_address : "no-email@provided.com",
            username: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.username || "Anonymous User",
            image: data.image_url || "",
            recentSearchedCities: [],
        };

        console.log("User data:", userData);

        switch (type) {

            case "user.created": {

                const newUser = await User.create(userData);

                console.log("User created in MongoDB:", newUser);

                break;
            }

            case "user.updated": {

                const updatedUser = await User.findByIdAndUpdate(
                    data.id,
                    userData,
                    { new: true }
                );

                console.log("User updated in MongoDB:", updatedUser);

                break;
            }

            case "user.deleted": {

                const deletedUser = await User.findByIdAndDelete(data.id);

                console.log("User deleted from MongoDB:", deletedUser);

                break;
            }

            default:
                console.log("Unhandled webhook type:", type);
        }

        console.log("Webhook processed successfully");
        console.log("=================================");

        res.status(200).json({
            success: true,
            message: "Webhook processed successfully"
        });

    } catch (error) {

        console.log("=================================");
        console.log("WEBHOOK ERROR:", error.message);
        console.log("=================================");

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export default clerkWebhooks;