# E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with React, Node.js, MongoDB, Redis, Stripe, and Socket.IO.

---

## Architecture

```
Frontend (React + Vite)
       │
API Gateway (Express)
       │
  ─────────────────────
  │       │       │
Auth  Products  Orders
  │       │       │
Redis Cache + BullMQ Queues
       │
     MongoDB
       │
  Socket.IO Server
```

---

## Roles

| Role | Access |
|------|--------|
| **User** | Browse, cart, checkout, track orders, reviews |
| **Vendor** | Dashboard, product management, orders, coupons, analytics |
| **Delivery** | Assigned orders, GPS simulation, status updates |
| **Admin** | Full platform — users, vendors, orders, products |

---

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS (IBM Plex font system)
- Redux Toolkit — auth, cart, notifications
- TanStack Query — server state
- React Router v6 — role-based routing
- Socket.IO Client — live tracking
- Chart.js — dashboards
- Framer Motion — animations

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis (Upstash) — caching + rate limiting
- Socket.IO — real-time events
- Stripe — payments + webhooks
- Cloudinary — image storage
- BullMQ — job queues
- Nodemailer — transactional email

---

## Project Structure

```
ecommerce/
├── backend/
│   └── src/
│       ├── config/          # db, redis, socket, stripe, cloudinary
│       ├── controllers/     # auth, product, order, vendor, admin, delivery
│       ├── middleware/       # auth, role, error, upload, rateLimiter
│       ├── models/          # User, Product, Order, Vendor, DeliveryPartner, Review, Notification, Coupon
│       ├── routes/          # all route files
│       ├── services/        # email, AI (Phase 5)
│       ├── sockets/         # orderSocket, notificationSocket
│       ├── utils/           # jwt, otp, apiHelpers
│       ├── app.js
│       └── server.js
│
└── frontend/
    └── src/
        ├── api/             # axios + all API modules
        ├── app/             # Redux store
        ├── components/      # UI, product, layout components
        ├── constants/       # roles, order status, query keys
        ├── features/        # auth, cart, notifications slices
        ├── layouts/         # User, Vendor, Admin, Delivery
        ├── pages/           # all pages by role
        ├── routes/          # AppRouter + ProtectedRoute guards
        ├── services/        # socket.js, queryClient.js
        ├── utils/           # formatCurrency, formatDate, cn, etc.
        └── main.jsx
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd ecommerce
npm run install:all
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in all values (MongoDB, Redis, Stripe, Cloudinary, Google OAuth, SMTP)
```

```env
# Frontend — create frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run

```bash
# Terminal 1 — backend
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- Health:   http://localhost:5000/health

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with role |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET  | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/categories` | Public |
| POST | `/api/products` | Vendor/Admin |
| PUT | `/api/products/:id` | Vendor/Admin |
| DELETE | `/api/products/:id` | Vendor/Admin |

### Orders
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/orders/checkout` | User |
| POST | `/api/orders/webhook` | Stripe |
| GET | `/api/orders/my` | User |
| GET | `/api/orders/vendor` | Vendor |
| GET | `/api/orders/:id` | Owner/Admin/Delivery |
| PUT | `/api/orders/:id/status` | Admin/Vendor/Delivery |

### Vendor
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/vendors/dashboard` | Vendor |
| GET/PUT | `/api/vendors/profile` | Vendor |
| GET | `/api/vendors/products` | Vendor |
| GET/POST | `/api/vendors/coupons` | Vendor |
| DELETE | `/api/vendors/coupons/:id` | Vendor |

### Admin
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/admin/dashboard` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/vendors/:id/approve` | Admin |
| PUT | `/api/admin/delivery/:id/approve` | Admin |
| GET | `/api/admin/orders` | Admin |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `orderPlaced` | Server → User | Order confirmed |
| `orderUpdated` | Server → User | Status changed |
| `deliveryLocation` | Server → User | GPS coordinates |
| `notification` | Server → User | Push notification |
| `newOrder` | Server → Vendor | New order received |
| `inventoryLow` | Server → Vendor | Stock alert |
| `locationUpdate` | Delivery → Server | GPS broadcast |

---

## Build Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation — Auth, DB, Routing, UI | ✅ Complete |
| 2 | Ecommerce Core — Products, Cart, Checkout, Orders | ✅ Complete |
| 3 | Vendor System — Dashboard, Products, Coupons | ✅ Complete |
| 4 | Real-Time — Socket.IO, Tracking, Notifications | ✅ Complete |
| 5 | AI Features — Recommendations, Smart Search | 🔜 Next |
| 6 | Production — Caching, Queues, Security, Deploy | 🔜 Next |

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | MongoDB Atlas |
| Cache / Queues | Upstash (Redis) |
| Media | Cloudinary |

### Vercel (Frontend)
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel — set VITE_* env vars in dashboard
```

### Render (Backend)
```
Build Command: npm install
Start Command: node src/server.js
# Set all .env vars in Render dashboard
```

---

## Security

- JWT access tokens (15min) + refresh tokens (7d)
- Bcrypt password hashing (salt 12)
- Rate limiting — login (5/15min), OTP (3/10min), API (100/min)
- Helmet HTTP headers
- CORS whitelist
- Role-based access control (RBAC) on every protected route
- Stripe webhook signature verification
- Input validation via Zod (Phase 6)
- Multer file type + size validation (5MB max)

---

## Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
REDIS_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=
VITE_GOOGLE_CLIENT_ID=
```
