# SupportDesk — B2B SaaS Helpdesk & Support Ticket Management System

SupportDesk is a production-grade, enterprise-ready Support Ticket Management System converted from Google Stitch design templates into a full-stack web application. It combines high-signal operational telemetry, split-pane ticket triage, role-based authorization, and an event-driven immutable activity audit trail.

---

## 1. Key Features

### User Capabilities (Customer Portal)
- **Account Registration & Authentication**: Secure sign up with workspace affiliation and bcrypt password hashing.
- **My Tickets Dashboard**: Real-time view of active support requests, response time metrics, and SLA compliance health.
- **Ticket Submission**: Interactive ticket creation with live character counter, severity priority selectors, Markdown formatting toolbar, and file drop-zone.
- **Conversation Thread**: Two-way customer-to-agent communication thread with instant updates.
- **Self-Service Ticket Management**: Search, status/priority filtering, ticket editing, and deletion.

### Administrator Capabilities (Operations Console)
- **Support Overview Dashboard**: Real-time operational telemetry (Total Volume, Open Queue, Avg First Response, SLA Compliance, Resolved Today).
- **Interactive Analytics**: Daily incoming volume vs resolution trend chart, tickets by priority breakdown, and status distribution.
- **Support Queue & Split-Pane Workspace**: 3-pane split interface allowing admins to scan the active queue, participate in conversation threads, and manipulate ticket properties in real time.
- **Internal Notes**: Amber-tinted private notes visible strictly to support personnel and invisible to customers.
- **In-Place Quick Triage**: Change ticket status, priority, or assignee directly from tables or detail views without page reloads.
- **Activity & Security Audit Trail**: Immutable chronological log of all mutations, status transitions, comments, and system events with CSV export.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (configured with the exact Google Stitch color tokens and typography)
- **Routing**: React Router v6 with ProtectedRoute and RoleRoute guards
- **API Client**: Axios with centralized request/response interceptors
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Security**: JWT authentication, bcryptjs password hashing, Helmet HTTP security headers, CORS protection, express-rate-limit brute-force protection
- **Input Validation**: express-validator schemas
- **Event Engine**: Node.js EventEmitter paired with an asynchronous persistence service
- **Testing**: Jest and Supertest

---

## 3. System Architecture

```
Support Ticket Management System/
├── backend/
│   ├── src/
│   │   ├── config/database.js          # Mongoose setup with automated MongoMemoryServer fallback
│   │   ├── models/
│   │   │   ├── User.js                 # Users & credentials with bcrypt hooks
│   │   │   ├── Ticket.js               # Tickets with sequential TKT-XXXX generator
│   │   │   ├── Comment.js              # Thread comments & internal notes
│   │   │   └── ActivityLog.js          # Immutable event audit log
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, me endpoints
│   │   │   ├── ticketController.js     # User ticket CRUD & detail
│   │   │   ├── commentController.js    # Thread conversation & private notes
│   │   │   └── adminController.js      # Telemetry, bulk actions & audit
│   │   ├── routes/                     # Modular express route definitions
│   │   ├── middleware/                 # JWT auth, role authorization, centralized error handling
│   │   ├── services/                   # Business logic and event subscribers
│   │   ├── events/                     # Typed EventEmitter definitions
│   │   ├── validators/                 # express-validator request rules
│   │   └── utils/                      # Token generation, seed data, API response helpers
│   ├── tests/api.test.js               # Jest & Supertest automated test suite
│   ├── server.js                       # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js               # Centralized Axios instance with bearer token interceptor
│   │   ├── context/AuthContext.jsx     # Global authentication state & demo logins
│   │   ├── components/
│   │   │   ├── common/                 # Navbar, Sidebar, Badges, Header
│   │   │   └── layout/                 # AppLayout (User) and AdminLayout (Admin)
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx            # Sign In, Create Account & 1-click Demo credentials
│   │   │   ├── UserTicketsPage.jsx     # Customer tickets list, metrics & filters
│   │   │   ├── SubmitTicketPage.jsx    # Ticket creator, guidelines & attachments
│   │   │   ├── TicketDetailPage.jsx    # 3-pane split workspace & conversation
│   │   │   ├── AdminDashboardPage.jsx  # Operations overview, telemetry & trend charts
│   │   │   ├── AdminTicketsPage.jsx    # All tickets data table & quick triage
│   │   │   └── AdminActivityLogsPage.jsx # Audit stream & CSV export
│   │   ├── App.jsx                     # Route declarations
│   │   └── index.css                   # Custom scrollbars and Tailwind directives
│   ├── tailwind.config.js              # Exact Google Stitch theme tokens
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 4. Database Schema Design

### User Collection
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Auto-generated identifier |
| `name` | String | Required, Trim | User's full name |
| `email` | String | Required, Unique, Indexed | User email address |
| `password` | String | Required, Hashed | bcrypt salted hash (never returned in responses) |
| `role` | String | Enum: `['user', 'admin']` | Role for RBAC authorization |
| `organization` | String | Default: `'Acme Support Ops'` | Workspace name |
| `createdAt` | Date | Timestamp | Account creation timestamp |

### Ticket Collection
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Auto-generated identifier |
| `ticketId` | String | Unique, Indexed | Sequential code (e.g. `TKT-1042`) |
| `title` | String | Required, Max 120 | Ticket subject |
| `description` | String | Required | Full issue description |
| `category` | String | Enum: `['technical', 'billing', 'feature', 'api', 'general']` | Category classification |
| `priority` | String | Enum: `['low', 'medium', 'high', 'urgent']`, Indexed | SLA severity tier |
| `status` | String | Enum: `['open', 'in_progress', 'resolved', 'closed']`, Indexed | Lifecycle state |
| `createdBy` | ObjectId | Ref: `User`, Indexed | Ticket author reference |
| `assignedTo` | ObjectId | Ref: `User`, Nullable | Assigned agent/admin |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last mutation timestamp |

### Comment Collection
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Comment identifier |
| `ticketId` | ObjectId | Ref: `Ticket`, Indexed | Associated ticket |
| `userId` | ObjectId | Ref: `User` | Comment author |
| `message` | String | Required, Trim | Comment message body |
| `isInternal` | Boolean | Default: `false` | True for private admin notes |
| `createdAt` | Date | Timestamp | Post timestamp |

### ActivityLog Collection
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Log identifier |
| `ticketId` | ObjectId | Ref: `Ticket`, Nullable, Indexed | Associated ticket |
| `actorId` | ObjectId | Ref: `User`, Nullable, Indexed | User or admin who triggered the event |
| `eventType` | String | Indexed | e.g. `ticket.created`, `ticket.status_changed`, `comment.added` |
| `description` | String | Required | Human-readable audit description |
| `metadata` | Mixed Object | Default: `{}` | State diffs, previous values, IP |
| `createdAt` | Date | Indexed (descending) | Event timestamp |

---

## 5. Event Handling & Activity Tracking

Whenever a state mutation occurs in the application, the service layer emits typed events through the `ticketEvents` EventEmitter:
- `ticket.created`: Triggered on new ticket submission.
- `ticket.updated`: Triggered on subject, category, or description changes.
- `ticket.status_changed`: Triggered on transition between open, in_progress, resolved, or closed.
- `ticket.priority_changed`: Triggered on priority adjustments.
- `ticket.assigned`: Triggered when an admin claims or assigns a ticket.
- `comment.added`: Triggered when public replies or internal notes are created.

The `EventService` subscribes to these events and persists audit records to the `ActivityLog` collection, ensuring that critical audit information is reliably stored and rendered in the ticket timeline.

---

## 6. Authentication & Authorization (RBAC)

1. **Authentication**: Users register or log in via `/api/auth/register` or `/api/auth/login`. Upon verification, the backend issues a signed JWT containing the user's `id`, `email`, and `role`.
2. **Authorization**:
   - `authMiddleware`: Verifies the Bearer token and attaches the authenticated `req.user`.
   - `roleMiddleware`: Guards admin endpoints (`/api/admin/*`) by ensuring `req.user.role === 'admin'`. Non-admins receive `403 Forbidden`.
   - **Ticket Isolation**: Regular users can only query, view, update, or comment on tickets where `createdBy === req.user._id`.
   - **Internal Note Privacy**: Comments marked with `isInternal: true` are filtered out of all responses for regular customer accounts.

---

## 7. Demo Credentials

Quick-fill credentials are built directly into the login screen:

| Role | Email | Password | Intended Views |
| :--- | :--- | :--- | :--- |
| **Customer User** | `user@company.com` | `Password123!` | `/tickets`, `/tickets/new`, `/tickets/:id` |
| **Support Admin** | `admin@company.com` | `Password123!` | `/admin/dashboard`, `/admin/tickets`, `/admin/activity`, `/tickets/:id` |

---

## 8. Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or pnpm
- MongoDB (or allow the automatic in-memory MongoDB fallback)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/supportdesk.git
cd "Support Ticket Management System"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```
The backend server will start on `http://localhost:5000`. It will automatically seed the demo user, support admin, and initial tickets matching the Stitch templates.

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
pnpm install
pnpm run dev
```
Open `http://localhost:5173` in your browser.

---

## 9. API Reference

### Authentication Endpoints
- `POST /api/auth/register`: Register new customer account
- `POST /api/auth/login`: Authenticate and receive JWT token
- `GET /api/auth/me`: Get profile of authenticated user

### Ticket Endpoints
- `POST /api/tickets`: Create new support ticket
- `GET /api/tickets`: Get current user's tickets (query: `status`, `priority`, `search`, `page`, `limit`)
- `GET /api/tickets/:id`: Get ticket details (verifies ownership or admin role)
- `PUT /api/tickets/:id`: Update ticket subject, category, or description
- `DELETE /api/tickets/:id`: Delete ticket
- `GET /api/tickets/:id/activity`: Get activity history timeline for ticket

### Comment Endpoints
- `GET /api/tickets/:id/comments`: Get ticket conversation thread (hides internal notes for customers)
- `POST /api/tickets/:id/comments`: Add reply (supports `isInternal: true` for admins)

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/dashboard`: Live computed telemetry and 7-day trend statistics
- `GET /api/admin/tickets`: All tickets with status, priority, and assignee filters
- `PATCH /api/admin/tickets/:id/status`: Update ticket lifecycle status
- `PATCH /api/admin/tickets/:id/priority`: Update ticket severity priority
- `PATCH /api/admin/tickets/:id/assign`: Assign ticket to an agent or admin
- `GET /api/admin/activity`: Global chronological audit stream with filters

---

## 10. Automated Testing

The backend includes a comprehensive Jest and Supertest test suite testing all 12 required scenarios:
1. User registration and login
2. Invalid credentials handling
3. Protected routes without JWT
4. User attempting to access another user's ticket (403 Forbidden)
5. User attempting to access admin endpoints (403 Forbidden)
6. Ticket creation validation
7. Ticket updates
8. Admin status and priority transitions
9. Comment creation and internal note privacy
10. Event-driven activity log generation
11. Search, filtering, and pagination query engine
12. Dashboard statistics calculations

To run the automated tests:
```bash
cd backend
pnpm test
```

---

## 11. Deployment Guide

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (`0.0.0.0/0` or Render outbound IPs).
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/supportdesk?retryWrites=true&w=majority`.

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app`

### Frontend (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Build Settings will auto-detect Vite:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Deploy! All SPA routing is pre-configured via `frontend/vercel.json`.
