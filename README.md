# EventEase Backend

Event Booking Platform Backend API

## Features

- User authentication (JWT)
- Role-based access (User/Admin)
- Event management
- Booking system with seat validation
- Booking cancellation
- Event status tracking
- Attendee management

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventease-backend


Install dependencies

bash
npm install
Environment Setup

Copy .env file and update variables:

3. **env**
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/eventease
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   Start the server


3. **Development**
   ```bash
   npm run dev


