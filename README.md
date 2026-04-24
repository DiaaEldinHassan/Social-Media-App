# Social Media App (Week 18)

Full-stack authentication and user profile project using:

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express + TypeScript + MongoDB + Redis
- **Auth:** JWT (access/refresh) + Google OAuth
- **Media:** Cloudinary (profile picture upload)

## Project Structure

```text
Week 18/
├── Client/   # React frontend
└── Server/   # Express TypeScript backend
```

## Features

- Sign up / sign in with email and password
- Email OTP confirmation
- Google login
- Forgot password + reset password flow (OTP-based)
- Protected routes with role-aware auth middleware
- Profile update (username/email)
- Profile picture upload and persistence
- Rate limiting and security headers (`helmet`)

## Tech Stack

### Client

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS v4
- Lucide React

### Server

- Node.js + TypeScript
- Express 5
- Mongoose
- Redis
- JWT (`jsonwebtoken`)
- Zod validation
- Multer
- Nodemailer
- Cloudinary

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB instance
- Redis instance
- Cloudinary account
- Google OAuth client (for social login)

## Environment Variables

### Client (`Client/.env`)

```env
VITE_BASE_URL="http://localhost:3000"
VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

### Server (`Server/src/config/.env.dev`)

The backend loads env from `src/config/.env.dev`.

```env
PORT=3000
MONGO_URI=your_mongodb_connection
REDIS_URL=your_redis_connection
SALT=10
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
ORIGIN=http://localhost:5173
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_email_password_or_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

From project root:

```bash
cd Server
npm install

cd ../Client
npm install
```

## Run the App

### 1) Start Backend

```bash
cd Server
npm run start:dev
```

Backend runs on `http://localhost:3000` (from `PORT`).

### 2) Start Frontend

```bash
cd Client
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Available Scripts

### Client

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Server

- `npm run start:dev` - TypeScript watch + Node watch on compiled output
- `npm run start:prod` - compile and run production build

## API Overview

### Auth routes (`/auth`)

- `POST /auth/signUp`
- `POST /auth/signIn`
- `POST /auth/confirmOtp`
- `POST /auth/forget-password`
- `POST /auth/reset-password`
- `PATCH /auth/update-password`
- `POST /auth/logout`
- `POST /auth/logoutAll`

### User routes (`/users`)

- `GET /users` (protected test route)
- `GET /users/me` (protected)
- `PATCH /users/me` (protected)
- `POST /users/profile-pic` (protected, multipart form-data, field: `ProfilePic`)
- `POST /users/video-upload` (protected)

## Security Notes

- CORS is restricted by `ORIGIN` environment variable.
- Global rate limiter is enabled.
- Additional auth-specific rate limiter is applied on `/auth`.
- JWT is required for protected routes via `Authorization: Bearer <accessToken>`.

## Author

- Diaa Eldin Hassan
