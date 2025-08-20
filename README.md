# Appointment Booking System

A full-stack appointment booking system built with Node.js, Express, MongoDB, and React.

## Features

- User authentication (JWT)
- Role-based access control (Patient & Admin)
- View available time slots
- Book appointments
- View personal bookings (for patients)
- View all bookings (for admins)
- Prevent double booking
- Responsive UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: React.js (to be implemented)
- **Styling**: CSS (to be implemented)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local or cloud instance)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/appointmentDB
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup (To be implemented)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Slots
- `GET /api/slots` - Get available slots (query params: from, to)
- `POST /api/slots/generate` - Generate slots (admin only)

### Bookings
- `POST /api/bookings` - Book a slot (protected)
- `GET /api/bookings/my-bookings` - Get user's bookings (protected)
- `GET /api/bookings/all` - Get all bookings (admin only)
- `PUT /api/bookings/:bookingId/cancel` - Cancel a booking (protected)

## Test Credentials

### Admin
- Email: admin@example.com
- Password: Passw0rd!

### Patient
- Email: patient@example.com
- Password: Passw0rd!

## Deployment

### Backend
1. Set up a MongoDB Atlas database and update the `MONGO_URI` in `.env`
2. Deploy to a platform like Render, Heroku, or Railway

### Frontend (To be implemented)

## License

This project is licensed under the MIT License.
