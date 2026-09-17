# TravelWithMe

A MERN-stack social app for solo travelers: a verified-identity feed of posts, nearby travelers,
and public meetups, with real-time chat and anonymous post-meetup trust ratings.

Built from a Claude design (`TravelWithMe.dc.html`) covering a landing page and 8 mobile screens:
sign up/login, tiered identity verification, main feed, traveler profile, meetup detail, chat,
post-meetup rating, and notifications.

## Tech stack

- **Client**: React 19 + TypeScript, Vite, React Router, Axios, Socket.IO client
- **Server**: Node.js, Express 5, Mongoose (MongoDB), Socket.IO, JWT auth, bcrypt password hashing
- **Database**: MongoDB (tested against MongoDB Atlas)

## Project structure

```
travel_app/
├── client/                  # React + TypeScript SPA (Vite)
│   ├── public/images/       # Static assets: avatars, posts, meetups, landing, placeholders
│   └── src/
│       ├── api/             # axios client (client.ts) + socket.io client (socket.ts)
│       ├── components/      # Avatar, Placeholder, EmptyState, TopBar, StarRating, TierBadge, ProtectedRoute
│       ├── context/         # AuthContext (JWT session, login/signup/logout)
│       ├── pages/           # One file per screen (Landing, SignUp, Login, Verify, Feed, Profile, MeetupDetail, ChatList, ChatThread, Rating, Notifications)
│       ├── styles/          # global.css — design tokens (colors, fonts) and shared classes
│       └── types/           # Shared TypeScript types matching the API's response shapes
├── server/
│   └── src/
│       ├── models/          # Mongoose schemas: User, Post, Meetup, Conversation, Message, Rating, Notification
│       ├── routes/          # auth, users, feed, posts, meetups, messages, notifications
│       ├── middleware/auth.js  # JWT verification middleware
│       ├── db.js             # MongoDB connection
│       ├── index.js          # Express app + Socket.IO server + global error handler
│       └── seed.js           # Demo data seeder
└── images/                   # Original source images (not served directly — copied into client/public/images)
```

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/travelwithme?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
CLIENT_ORIGIN=http://localhost:5173
```

`MONGO_URI` can point at a local MongoDB instance or a MongoDB Atlas cluster (Atlas: create a free
M0 cluster, a database user, allow your IP under Network Access, then copy the connection string
from **Connect → Drivers**).

Seed demo data (4 travelers, 10 posts, 5 meetups, all with real photos from `client/public/images`):

```bash
npm run seed
```

This prints a demo login: **`demo@example.com` / `password123`**.

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start        # plain node
```

Server runs on `http://localhost:5000`, exposing REST endpoints under `/api/*` and a Socket.IO
server on the same port.

### 2. Client

```bash
cd client
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api (default is already this)
npm run dev
```

Client runs on `http://localhost:5173`. Open it in a browser and log in with the demo account, or
sign up fresh to walk through the tier 1→2→3 verification flow.

## Data model

| Model | Purpose |
|---|---|
| `User` | Account, verification `tier` (1=email, 2=+phone, 3=+government ID), bio/interests, aggregate `ratingAvg`/`ratingCount`/`ratingTagCounts` |
| `Post` | A feed post: author, photo, caption, location |
| `Meetup` | A public meetup: host, place, time, capacity, `minTier` (who can join), `attendees[]` |
| `Conversation` | Direct (2 participants) or group (tied to a `Meetup`) chat thread |
| `Message` | A message within a conversation |
| `Rating` | One traveler's anonymous star rating + trust tags for another, scoped to a specific meetup (unique per `meetup`+`rater`+`ratee`) |
| `Notification` | In-app notifications (verification, message, rating prompt/update, meetup join) |

## API overview

All routes except `/api/auth/signup` and `/api/auth/login` require `Authorization: Bearer <jwt>`.

| Route | Notes |
|---|---|
| `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` | Auth; passwords hashed with bcrypt, JWT valid for 7 days |
| `GET/PATCH /api/users/me`, `POST /api/users/me/verify` | Profile + tier upgrades (`{tier: 2, phone}` or `{tier: 3}`) |
| `GET /api/users/:id` | Public profile + shared-meetup count |
| `GET /api/feed?type=all\|posts\|travelers\|meetups` | Mixed, time-sorted feed |
| `POST /api/posts` | Create a post |
| `POST /api/meetups`, `GET /api/meetups/:id`, `POST /api/meetups/:id/join` | Meetup CRUD/RSVP; join is blocked below `minTier` or at capacity |
| `GET /api/meetups/:id/rating-queue`, `POST /api/meetups/:id/ratings` | Post-meetup rating; restricted to attendees, blocks self-rating and rating non-attendees |
| `GET /api/conversations`, `POST /api/conversations/direct`, `POST /api/conversations/meetup/:meetupId` | List/start conversations |
| `GET/POST /api/conversations/:id/messages` | Read/send messages; restricted to conversation participants |
| `GET /api/notifications`, `POST /api/notifications/mark-all-read` | Notifications |

### Realtime

The Socket.IO handshake requires the same JWT (`io(url, { auth: { token } })`); connections without
a valid token are rejected. Clients `emit("conversation:join", conversationId)` to join a room —
the server verifies the connecting user is actually a participant before allowing the join — and
receive new messages via a `message:new` event, broadcast by the server whenever
`POST /api/conversations/:id/messages` succeeds.

## Error handling

- Every mutating route validates required fields and returns a clean `4xx` with a `{ message }`
  body — never a raw stack trace.
- A global Express error handler (`server/src/index.js`) catches Mongoose validation errors and
  malformed JSON bodies and maps them to `400`s; anything unexpected falls back to a generic `500`
  with no internal details leaked.
- Authorization is enforced server-side beyond just "is logged in": conversation messages are
  restricted to participants, and meetup ratings are restricted to attendees (no self-rating, no
  rating someone who didn't attend).
- On the client, every user-triggered action (join meetup, send message, message a traveler, open
  a group chat, submit a rating) surfaces the server's actual error message inline, not just to the
  console. A global `401` response anywhere in the app clears the session and redirects to `/login`.

## Verification status

This app has been checked end-to-end against a live MongoDB Atlas cluster: bcrypt password
hashing, JWT issuance/expiry/rejection, duplicate-signup and login-error handling, per-write
persistence (post/meetup/join/message/rating all confirmed via direct database reads, not just API
responses), tier-gated join enforcement, input validation, authorization (no cross-conversation or
non-attendee access), and real-time Socket.IO delivery including disconnect/reconnect — all
passing as of the last verification pass.

## Known limitations

- No password reset / email verification flow (email "tier 1" is granted at signup without an
  actual confirmation email).
- No file upload — `photoUrl`/`avatarUrl` are plain string fields; the seed data points them at
  static files in `client/public/images/`.
- No automated test suite (Jest/Vitest) — verification so far has been manual/scripted against a
  live database rather than a checked-in test suite.
- `react` and `react-dom` are installed in `client/` only as a transitive peer dependency of
  `react-router-dom` (not declared directly in `client/package.json`). This works with npm's
  default peer-auto-install behavior but would be worth declaring explicitly for robustness with
  other package managers.
