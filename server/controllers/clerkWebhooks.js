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
        const payload = req.body.toString();

        await whook.verify(payload, headers);

        const { data, type } = JSON.parse(payload);

        console.log("=================================");
        console.log("Webhook received:", type);
        console.log("Clerk User ID:", data.id);

        const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            image: data.image_url,
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