# Eventra — MERN Event Management Portal

Full-stack event management platform: discover events, book tickets with QR
confirmations, and host events — with three roles (User, Organizer, Admin),
coupon discounts, Stripe payments, QR check-in, and automated email reminders.

## Stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios, React Toastify, Recharts, html5-qrcode (QR scanning)
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcryptjs, Multer + Cloudinary, Nodemailer, express-validator, node-cron, qrcode, Stripe

## Features

- **Browse & search:** full-text search, filter by category/city/date/price, sort by date/price/popularity/trending/rating, pagination
- **Booking:** ticket booking with seat tracking, unique ticket codes, QR code generation, downloadable confirmation, cancel/refund
- **Coupons:** percentage/fixed discounts with max discount, min order value, expiry, and usage limits
- **Payments:** demo mode + Stripe Checkout (INR); Stripe is optional and gracefully reports "not configured" without a key
- **QR check-in:** organizers/admins scan attendee QR codes in-browser to check in tickets
- **Reviews & ratings:** confirmed attendees rate (1–5) and comment; aggregate rating stored on the event
- **Favorites:** save events to a personal favorites list
- **Reminders:** daily cron job emails attendees when an event is within 24 hours
- **Organizer tools:** create/edit/delete/duplicate events, draft/publish status, close registration, attendees list, CSV attendee export, revenue dashboard with charts
- **Admin tools:** platform stats, manage users (block/unblock), approve organizers, remove any event
- **Auth:** JWT, register/login/logout, forgot/reset password via email, change password, role-based access control
- **UX:** dark mode toggle, skeleton loaders, toast notifications, protected routes, 404 page
- **Organizer approval flow:** new organizer signups start with `isApproved: false` and need admin approval before managing events

## Project structure

```
event-portal/
├── server/
│   ├── config/            # db.js, cloudinary.js
│   ├── models/            # User, Event, Booking, Coupon, Review
│   ├── controllers/       # auth, user, event, booking, admin
│   ├── routes/            # auth, event, booking, user, admin, payment
│   ├── middleware/        # auth (JWT), role (RBAC), approvedOrganizer, upload (multer), validate, errorHandler
│   ├── utils/             # generateToken, sendEmail, cloudinaryUpload, reminderScheduler
│   ├── scripts/           # seedEvents.js
│   └── server.js
└── client/
    └── src/
        ├── api/axios.js          # axios instance with auth interceptor
        ├── context/AuthContext.jsx
        ├── components/           # Navbar, Footer, EventCard, ProtectedRoute, Pagination, SkeletonCard, DarkModeToggle
        ├── pages/                # one file per route
        ├── hooks/
        ├── utils/
        └── App.jsx
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, SMTP_*, STRIPE_SECRET_KEY
npm run seed:events     # optional: add demo organizer, admin + 12 sample events
npm run dev             # nodemon, http://localhost:5000
```

Required `.env` values (see `server/.env.example`):
- `PORT` — server port (default `5000`)
- `NODE_ENV` — `development` or `production`
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `JWT_EXPIRE` — token expiry (default `7d`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — for image uploads
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — for booking confirmations, password resets, and reminders (a Gmail app password works)
- `CLIENT_URL` — used for CORS and reset-password links (default `http://localhost:5173`)
- `STRIPE_SECRET_KEY` — optional; enables Stripe Checkout payments

> Email sending is automatically skipped when SMTP placeholders are still set, so the app runs without a mail server for local development.

### 2. Frontend

```bash
cd client
npm install
npm run dev             # http://localhost:5173, proxies /api to :5000
```

### Seed accounts

Running `npm run seed:events` creates:
- **Organizer:** `organizer@eventra.local` / `DemoPass123`
- **Admin:** `admin@eventra.local` / `AdminPass123`

## Roles & access

| Role       | Can do |
|------------|--------|
| User       | browse/search/filter events, book & cancel tickets, download confirmation, favorites, reviews (if attended), edit profile, change password |
| Organizer  | everything a User can, plus create/edit/delete/duplicate own events after approval, draft/publish, close registration, view attendees, export attendees CSV, revenue dashboard, QR check-in |
| Admin      | manage users (block/unblock), approve organizers, remove any event, view platform-wide stats |

New organizer signups start with `isApproved: false` and need admin approval
before they can create, edit, delete, duplicate, publish, or close registrations
for events. Bookings include unique ticket codes and QR codes, and send
confirmation emails when SMTP settings are configured.

## API overview

**Auth:** `POST /api/auth/register|login|logout`, `GET /api/auth/me`,
`POST /api/auth/forgot-password`, `PUT /api/auth/reset-password/:token`,
`PUT /api/auth/change-password`

**Events:** `GET /api/events` (search/filter/sort/paginate via query params),
`GET /api/events/:id`, `POST|PUT|DELETE /api/events/:id` (organizer/admin),
`GET /api/events/organizer/mine`, `GET /api/events/organizer/revenue`,
`GET /api/events/organizers/:organizerId`, `GET /api/events/:id/attendees`,
`GET /api/events/:id/attendees/export` (CSV), `PUT /api/events/:id/close-registration`,
`POST /api/events/:id/duplicate`, `PUT /api/events/:id/publish`,
`POST /api/events/:id/reviews`

**Bookings:** `POST /api/bookings`, `GET /api/bookings`, `GET/DELETE /api/bookings/:id`,
`POST /api/bookings/check-in` (organizer/admin, QR scan)

**Payments:** `POST /api/payments/create-session` (Stripe Checkout)

**Users:** `GET/PUT /api/users/profile`, `GET /api/users/favorites`,
`POST /api/users/favorites/:eventId`

**Admin:** `GET /api/admin/stats|users|events`, `PUT /api/admin/users/:id/block`,
`PUT /api/admin/organizers/:id/approve`, `DELETE /api/admin/events/:id`

**Health:** `GET /api/health`

## Notes / next steps

- Stripe Checkout is implemented for card payments (INR). Add a webhook to
  mark bookings `paid` after successful payment for production use.
- Add rate limiting (`express-rate-limit`) and `helmet` for production hardening.
- Frontend bundle is a single chunk; add route-based `React.lazy` code-splitting
  if it grows beyond the current scope.
- Coupons are managed directly in the database (`Coupon` model); an admin UI for
  creating coupons is a natural next step.