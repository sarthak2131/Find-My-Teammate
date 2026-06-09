# Find My Teammate

A full-stack MERN collaboration platform where students, developers, and freelancers discover teammates, publish projects, manage join requests, and chat in real time.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## Overview

Finding the right teammate for hackathons, college projects, or early-stage ideas is often scattered across chats and social groups. **Find My Teammate** brings discovery, coordination, and communication into one place: skill-based profiles, structured project posts, request workflows, live messaging, and notifications.

### Highlights

- **JWT authentication** with bcrypt password hashing
- **Rich profiles** — skills, interests, bio, GitHub link, profile image (Cloudinary or image URL)
- **Project hub** — create, browse, filter, edit, and delete your listings
- **Team workflows** — send join requests, receive invites, accept or reject from one place
- **Real-time chat** — direct messages and typing indicators via Socket.io
- **Notifications** — activity feed with read / unread state
- **Admin dashboard** — platform overview for admin users
- **Modern UI** — responsive React + Tailwind layout with light / dark mode

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, Lucide React |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Realtime | Socket.io |
| Media (optional) | Cloudinary, Multer |

---

## Project Structure

```text
find-my-teammate/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # UI, layout, shared widgets
│       ├── context/        # Auth, socket, theme
│       ├── hooks/
│       ├── pages/          # Route-level screens
│       ├── services/       # API helpers
│       └── utils/
├── server/                 # Express API + Socket.io
│   ├── config/             # DB, CORS, demo seed
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── sockets/
└── package.json            # Root scripts (concurrently)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

### 1. Clone and install

```bash
git clone https://github.com/sarthak2131/find-my-teammate.git
cd find-my-teammate

npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment variables

Copy the server example env file and edit values:

```bash
cp server/.env.example server/.env
```

**`server/.env`**

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/find-my-teammate
JWT_SECRET=your_long_random_secret_here
CLIENT_URL=http://localhost:5173,http://localhost:5174

# Optional — profile image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**`client/.env`** (optional)

```env
VITE_API_URL=http://localhost:5000/api
```

> Without Cloudinary, you can still set a profile picture using a direct image URL on the profile page.

### 3. Run the app

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API health | http://localhost:5000/api/health |

### Other scripts

```bash
npm run server    # Backend only (nodemon)
npm run client    # Frontend only (Vite)
npm run build     # Production build (client)
```

---

## Demo Accounts

On first startup, the server seeds demo users (password for all: **`demo12345`**):

| Role | Email |
|------|--------|
| Project lead | `lead.demo@fmt.com` |
| Developer | `builder.demo@fmt.com` |
| Admin | `admin.demo@fmt.com` |

Use these to explore feeds, requests, chat, and the admin panel without registering manually.

---

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login, receive JWT |
| `GET` | `/auth/me` | Current user (protected) |
| `GET/PUT` | `/users/...` | Profiles and user actions |
| `GET/POST/PUT/DELETE` | `/projects/...` | Project CRUD and discovery |
| `POST/PUT` | `/requests/...` | Join requests and invites |
| `GET/POST` | `/messages/...` | Conversations and DMs |
| `GET/PUT` | `/notifications/...` | Notification feed |

Socket events power live chat and typing indicators on top of this REST API.

---

## Main App Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/feed` | Home feed |
| `/explore` | Browse projects |
| `/projects/new`, `/projects/:id` | Create / view project |
| `/profile`, `/profile/:id` | User profile |
| `/dashboard` | Your workspace |
| `/chat` | Messages |
| `/notifications` | Alerts |
| `/admin` | Admin dashboard |

---

## Deployment Notes

- Set `MONGO_URI` to your Atlas cluster in production.
- Use a strong `JWT_SECRET` and restrict `CLIENT_URL` to your deployed frontend origin(s).
- Build the client with `npm run build` and serve `client/dist` via Vercel, Netlify, or similar.
- Run the server on Render, Railway, or a VPS; ensure WebSocket support for Socket.io.

---

## Future Enhancements

- AI-based teammate recommendations from skills and interests
- Email / push notifications for requests and messages
- GitHub integration and team workspaces
- Mobile app or PWA

---

## Author

**Sarthak Baderiya** — Full-stack developer (MERN)

- Portfolio: [sarthakbaderiya.me](https://www.sarthakbaderiya.me/)
- LinkedIn: [sarthak-baderiya](https://www.linkedin.com/in/sarthak-baderiya/)
- GitHub: [@sarthak2131](https://github.com/sarthak2131)

---

## License

This project is for academic and portfolio use. Contact the author before commercial redistribution.
