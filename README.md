# Eventra â€” MERN Event Management Portal

Full-stack event management platform: discover events, book tickets, and run
events, with three roles (User, Organizer, Admin).

## Stack

- **Frontend:** React 18 (Vite), React Router, Tailwind CSS, Axios, React Toastify, Recharts
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, Multer + Cloudinary, Nodemailer, express-validator

## Project structure

```
event-portal/
â”œâ”€â”€ server/
â”‚   â”œâ”€â”€ config/        # db.js, cloudinary.js
â”‚   â”œâ”€â”€ models/        # User, Event, Booking
â”‚   â”œâ”€â”€ controllers/    # auth, user, event, booking, admin
â”‚   â”œâ”€â”€ routes/          # matching route files
â”‚   â”œâ”€â”€ middleware/    # auth (JWT), role (RBAC), upload (multer), validate, errorHandler
â”‚   â”œâ”€â”€ utils/          # generateToken, sendEmail, cloudinaryUpload
â”‚   â””â”€â”€ server.js
â””â”€â”€ client/
    â””â”€â”€ src/
        â”œâ”€â”€ api/axios.js         # axios instance with auth interceptor
        â”œâ”€â”€ context/AuthContext.jsx
        â”œâ”€â”€ components/          # Navbar, Footer, EventCard, ProtectedRoute, etc.
        â”œâ”€â”€ pages/                # one file per route
        â””â”€â”€ App.jsx
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, SMTP_*
npm run seed:events     # optional: add demo organizer + sample events
npm run dev             # nodemon, http://localhost:5000
```

Required `.env` values:
- `MONGO_URI` â€” MongoDB Atlas connection string
- `JWT_SECRET` â€” any long random string
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` â€” for image uploads
- `SMTP_*` â€” for password-reset emails (a Gmail app password works)
- `CLIENT_URL` â€” used for CORS and reset-password links (default `http://localhost:5173`)

### 2. Frontend

```bash
cd client
npm install
npm run dev             # http://localhost:5173, proxies /api to :5000
```

## Roles & access

| Role       | Can do |
|------------|--------|
| User       | browse/search/filter events, book & cancel tickets, download ticket confirmation, favorites, reviews, edit profile |
| Organizer  | everything a User can, plus create/edit/delete own events after approval, view attendees & revenue, close registration |
| Admin      | manage users (block/unblock), approve organizers, remove any event, view platform-wide stats |

New organizer signups start with `isApproved: false` and need admin approval
before they can create, edit, delete, or close registrations for events.
Bookings include unique ticket codes and send confirmation emails when SMTP settings are configured.

## API overview

Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`,
`POST /api/auth/forgot-password`, `PUT /api/auth/reset-password/:token`,
`PUT /api/auth/change-password`

Events: `GET /api/events` (search/filter/sort/paginate via query params),
`GET /api/events/:id`, `POST|PUT|DELETE /api/events/:id` (organizer/admin),
`GET /api/events/organizer/mine`, `GET /api/events/organizer/revenue`,
`GET /api/events/:id/attendees`, `PUT /api/events/:id/close-registration`,
`POST /api/events/:id/reviews`

Bookings: `POST /api/bookings`, `GET /api/bookings`, `GET/DELETE /api/bookings/:id`

Users: `GET/PUT /api/users/profile`, `GET /api/users/favorites`,
`POST /api/users/favorites/:eventId`

Admin: `GET /api/admin/stats|users|events`, `PUT /api/admin/users/:id/block`,
`PUT /api/admin/organizers/:id/approve`, `DELETE /api/admin/events/:id`

## Notes / next steps

- Payments are marked `paid` on booking creation â€” plug in a real gateway
  (Razorpay/Stripe) in `bookingController.createBooking` before going live.
- Add rate limiting (`express-rate-limit`) and `helmet` for production hardening.
- Frontend bundle is a single chunk (~190kB gzipped) â€” fine for this scope;
  add route-based `React.lazy` code-splitting if it grows.
- Both `server` and `client` were verified to install and build/run cleanly
  (`vite build` succeeds; the API boots and only fails on the placeholder
  Mongo URI in `.env.example`, as expected).
