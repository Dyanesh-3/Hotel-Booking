# Hotel Booking Platform

A full-stack, production-ready hotel booking platform featuring a beautiful UI, role-based access control, and complete management dashboards for Customers, Hotel Owners, and Administrators.

## 🌟 Features

### For Customers:
- **Search & Filter**: Browse hotels across different cities with date-specific availability checking.
- **Room Booking**: Secure and intuitive room booking flow.
- **My Bookings**: View past and upcoming reservations with their payment status.

### For Hotel Owners:
- **Hotel Registration**: Apply to list your hotel on the platform (requires Admin approval).
- **Room Management**: Create and toggle availability for different room types.
- **Dashboard**: Track bookings and revenue via a dedicated owner interface.
- **Resubmission**: Fix and resubmit rejected hotel applications.

### For Administrators:
- **Hotel Moderation**: Approve, reject, suspend, or reactivate hotels to maintain platform quality.
- **User Management**: View and suspend malicious users.
- **Global Dashboard**: Track total revenue, bookings, and platform growth.
- **Action History**: Maintain an audit log of all moderation actions.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Clerk (Strict Sign In / Sign Up separation)
- **Image Storage**: Cloudinary
- **Email Notifications**: Nodemailer (Brevo SMTP)
- **Payments**: Stripe

## 🚀 Architecture & Security

- **Role-Based Access Control (RBAC)**: Backend APIs are protected with `requireRole` middleware.
- **Owner Authorization**: Owners can strictly only modify their own hotels and rooms.
- **Booking Validation**: Backend enforces strict date validation, past-date rejection, and prevents double-booking overlaps. Price is calculated securely server-side.
- **Data Integrity**: Hotels must be explicitly `approved` and `isActive` to appear publicly.
- **Environment Security**: CORS is restricted, and secrets are strictly separated between client and server.

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd hotel-booking
```

### 2. Configure Environment Variables
Create a `.env` file in both `client` and `server` directories. Use `.env.example` as a template.

**Server (.env):**
```env
MONGODB_URI=your_mongo_uri
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SENDER_EMAIL=your_email
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
STRIPE_SECRET_KEY=your_stripe_secret
FRONTEND_URL=http://localhost:5173
```

**Client (.env):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=$
```

### 3. Install Dependencies
```bash
# In the client directory
npm install

# In the server directory
npm install
```

### 4. Run the Application
```bash
# Start backend (from /server)
npm run server

# Start frontend (from /client)
npm run dev
```

## 📖 API Documentation (Highlights)

- `GET /api/room` - Publicly available rooms for approved hotels.
- `POST /api/bookings/check-availability` - Validates dates and checks overlap.
- `POST /api/bookings/create` - Protected user route to create a booking.
- `GET /api/admin/hotels` - Protected admin route to list all hotels regardless of status.
- `PUT /api/admin/hotels/:id/approve` - Protected admin route to approve a hotel.
- `POST /api/hotels` - Protected owner route to register a new hotel.
