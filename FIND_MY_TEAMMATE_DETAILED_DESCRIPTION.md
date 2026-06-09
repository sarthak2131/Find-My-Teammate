# Find My Teammate: Detailed Project Description

## 1. Project Overview

**Find My Teammate** is a full-stack MERN collaboration platform built to help students, developers, hackathon participants, and early-stage builders find the right teammates for a project.

The core idea of the platform is simple:

- users create a profile with skills, interests, bio, availability, and gender
- project leads post project opportunities
- other users discover those projects in the feed
- users can send a **join request**
- project leads can directly **invite teammates**
- after approval, users can coordinate through **real-time chat**
- notifications and dashboard views help track activity

This project turns informal team formation, which usually happens through WhatsApp groups, personal contacts, or class announcements, into a structured digital workflow.

---

## 2. What Problem This Project Solves

In real college and hackathon environments, people often have ideas but struggle with:

- finding teammates with the right skill set
- knowing who is actually available
- managing project join requests manually
- keeping conversations tied to the project itself
- tracking who has joined, who is pending, and who was invited

**Find My Teammate** solves this by combining:

- profile discovery
- project posting
- request and invite workflows
- role-based project management
- one-to-one chat
- notifications
- admin visibility

---

## 3. Main Features

### User and Profile Features

- register and login with JWT authentication
- edit profile with:
  - name
  - bio
  - availability
  - gender
  - skills
  - interests
  - GitHub link
  - profile image

### Project Features

- create project posts
- add title, description, required skills, deadline, status
- define teammate preference:
  - anyone
  - male teammates only
  - female teammates only
- write a custom note like:
  - "Need a female presenter"
  - "Need a backend developer"
- upload project poster/media
- edit or delete owned project

### Team Formation Features

- request to join a project
- invite a teammate from Explore page
- accept or reject incoming requests
- remove a teammate from a project
- hide own projects from the public feed by default

### Communication Features

- direct user-to-user messaging
- typing indicators
- online presence
- notifications for:
  - join requests
  - invite updates
  - new messages

### Feed and Discovery Features

- search projects by title, description, skills
- filter projects by:
  - status
  - gender preference
- explore teammate profiles
- bookmark/save projects

### Admin Features

- admin dashboard overview
- counts for users, projects, requests, and notifications
- recent user and project visibility

---

## 4. Technology Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS
- Lucide React icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- multer
- Cloudinary

---

## 5. High-Level Architecture

The project follows a standard **client-server architecture**:

1. **Client** handles UI, routing, forms, dashboards, feed, profile, and chat screens.
2. **Server** exposes REST APIs for auth, users, projects, requests, messages, and notifications.
3. **MongoDB** stores persistent data using Mongoose schemas.
4. **Socket.IO** handles real-time online state, typing indicators, and message/notification push events.
5. **Cloudinary** is used for media upload when configured.

### Request Flow Example

1. User opens frontend.
2. Frontend sends API request using Axios.
3. Axios automatically adds JWT token from local storage.
4. Express route receives request.
5. Auth middleware verifies token.
6. Controller performs business logic.
7. Mongoose reads/writes MongoDB.
8. If needed, Socket.IO emits live update to another user.
9. Response returns to frontend and UI updates.

---

## 6. Project Folder Structure

```text
find-my-teammate/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- utils/
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- config/
|   |-- constants/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- sockets/
|   |-- .env
|   `-- server.js
|-- package.json
`-- README.md
```

---

## 7. Frontend Structure

The frontend is a React single-page application.

### Important Pages

- `/` -> landing page
- `/login` -> login page
- `/register` -> register page
- `/feed` -> public project feed
- `/explore` -> teammate discovery page
- `/projects/new` -> create project page
- `/projects/:id` -> full project details
- `/projects/:id/edit` -> edit project
- `/profile` -> own profile
- `/profile/:id` -> public teammate profile
- `/dashboard` -> project/request management
- `/likes` -> bookmarked projects
- `/chat` -> direct chat
- `/notifications` -> notification page
- `/admin` -> admin panel

### Important Frontend Layers

- `context/AuthContext.jsx`
  - stores auth token and logged-in user
  - keeps local auth in `localStorage`
- `context/SocketContext.jsx`
  - manages socket connection and online users
- `services/api.js`
  - Axios instance
  - auto-attaches `Authorization: Bearer <token>`
- `components/shared/`
  - reusable UI pieces like `ProjectCard`, `UserCard`, `Avatar`, `EmptyState`

---

## 8. Backend Structure

The backend is an Express application with route-controller-model separation.

### Main Backend Files

- `server/server.js`
  - loads environment variables
  - connects MongoDB
  - creates Express app and HTTP server
  - initializes Socket.IO
  - mounts API routes

- `server/config/db.js`
  - connects Mongoose to MongoDB using `MONGO_URI`

- `server/sockets/socketServer.js`
  - handles online presence
  - typing start/stop events
  - room-based delivery for realtime updates

### Controller Groups

- `authController.js`
- `userController.js`
- `projectController.js`
- `requestController.js`
- `messageController.js`
- `notificationController.js`

---

## 9. Environment Variables

The backend uses the following environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/find-my-teammate
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173,http://localhost:5174
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### What Each Variable Does

- `PORT`
  - port on which backend server runs
  - current default: `5000`

- `MONGO_URI`
  - MongoDB connection string
  - used inside `server/config/db.js`

- `JWT_SECRET`
  - used to sign and verify JWT tokens
  - required for auth

- `CLIENT_URL`
  - comma-separated list of allowed client origins
  - used in CORS origin validation

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
  - used only if Cloudinary upload is enabled
  - if missing, app still works with limited fallback behavior

### Frontend Environment Variable

```env
VITE_API_URL=http://localhost:5000/api
```

- this tells the frontend where the backend API is running

---

## 10. How Client and Server Connect

This is one of the most important technical parts of the project.

### REST API Connection

In the frontend, `client/src/services/api.js` creates an Axios instance:

- base URL comes from `VITE_API_URL`
- if no env is set, fallback is:
  - `http://localhost:5000/api`

So when frontend calls:

```js
api.get("/projects")
```

the real request becomes:

```text
http://localhost:5000/api/projects
```

### Auth Token Connection

After login or register:

- token and user are stored in `localStorage`
- storage key:
  - `fmt-auth`

On every future request:

- Axios request interceptor reads that token
- adds:

```text
Authorization: Bearer <token>
```

This is how protected backend routes know which user is making the request.

### Socket Connection

The frontend derives socket base URL from the API URL by removing `/api`.

Example:

- API URL: `http://localhost:5000/api`
- socket base URL: `http://localhost:5000`

So REST and realtime traffic point to the same backend server.

---

## 11. CORS and Local Development Behavior

The backend validates incoming origins using:

- `server/config/corsOptions.js`
- local regex for `localhost` and `127.0.0.1`
- `CLIENT_URL` allowlist from env

This means:

- frontend dev server at `5173` or `5174` can talk to backend
- browser preflight requests are handled in `server.js`
- backend responds with allowed methods and headers

---

## 12. Authentication Flow

### Register

Route:

- `POST /api/auth/register`

What happens:

1. user sends name, email, password, and gender
2. backend checks if email already exists
3. password is hashed using `bcryptjs`
4. JWT token is generated
5. frontend stores token + user

### Login

Route:

- `POST /api/auth/login`

What happens:

1. user sends email and password
2. backend looks up the user
3. password is compared using `comparePassword`
4. JWT token is returned

### Current User

Route:

- `GET /api/auth/me`

What happens:

- frontend uses saved token
- backend verifies it through middleware
- current user object is returned

---

## 13. Data Models

### User

Main fields:

- `name`
- `email`
- `password`
- `skills`
- `interests`
- `bio`
- `profileImage`
- `githubLink`
- `availability`
- `gender`
- `role`
- `bookmarks`

### Project

Main fields:

- `title`
- `description`
- `requiredSkills`
- `preferredGender`
- `preferredTeammateNote`
- `posterUrl`
- `createdBy`
- `teamLead`
- `members`
- `status`
- `deadline`
- `bookmarkedBy`

### Request

Main fields:

- `sender`
- `receiver`
- `projectId`
- `requestType`
  - `join`
  - `invite`
- `status`
  - `pending`
  - `accepted`
  - `rejected`
- `note`

### Message

Main fields:

- `sender`
- `receiver`
- `message`
- `projectId`
- `readAt`

### Notification

Main fields:

- `userId`
- `text`
- `type`
- `isRead`
- `referenceId`
- `referenceModel`

---

## 14. API Modules

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User Routes

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/update`
- `PUT /api/users/bookmarks/:projectId`
- `GET /api/users/admin/overview`

### Project Routes

- `POST /api/projects/create`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `DELETE /api/projects/:id/members/:memberId`

### Request Routes

- `GET /api/requests`
- `POST /api/requests/send`
- `PUT /api/requests/accept`
- `PUT /api/requests/reject`

### Message Routes

- `GET /api/messages`
- `GET /api/messages/:id`
- `POST /api/messages/send`

### Notification Routes

- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`

---

## 15. Real-Time Features

Socket.IO is used for lightweight real-time collaboration.

### Supported Realtime Events

- `presence:online`
  - marks a user as online
- `online-users`
  - broadcasts current online user list
- `typing:start`
  - tells other user someone is typing
- `typing:stop`
  - clears typing state
- `message:new`
  - pushed when a new message is sent
- `notification:new`
  - pushed when a request or message notification is created

### How It Works

- each connected user joins a socket room using their user ID
- backend emits to that room when needed
- this allows direct targeted updates instead of broadcasting everything to everyone

---

## 16. Gender Preference Logic

This project now has backend-enforced teammate preference logic.

### On Profile Side

Every user can store gender as:

- `male`
- `female`
- `prefer-not-to-say`

### On Project Side

A project can define:

- `any`
- `male`
- `female`

plus a free text note like:

- "Need a female frontend presenter"
- "Need a male actor for product demo"

### Enforcement Rule

If a project is set to `female`:

- male users cannot send join request
- male users cannot be invited
- old pending invite also cannot be accepted if it violates the rule

Same idea applies to `male` projects.

This validation is done both:

- in frontend UI
- in backend controllers

So it is not just cosmetic.

---

## 17. Media Upload Behavior

The project supports:

- profile image upload
- project poster/media upload

### If Cloudinary Is Configured

- files upload to Cloudinary
- profile images go to:
  - `find-my-teammate`
- project posters go to:
  - `find-my-teammate/posters`

### If Cloudinary Is Not Configured

- profile image upload through file is blocked
- image URL fallback can still be used
- project poster can fall back to request body URL or encoded data path logic

---

## 18. Startup Sequence

When backend starts:

1. `.env` is loaded
2. MongoDB connection is established
3. demo users are ensured
4. Express server starts
5. Socket.IO attaches to the same HTTP server

When frontend starts:

1. Vite serves the React app
2. routes load inside React Router
3. `AuthProvider` restores saved session if token exists
4. protected pages use current auth state
5. `SocketProvider` connects after auth

---

## 19. How to Run the Project

### Install Dependencies

At root:

```bash
npm install
```

Backend:

```bash
npm install --prefix server
```

Frontend:

```bash
npm install --prefix client
```

### Start Both Client and Server Together

```bash
npm run dev
```

This root script runs:

- backend dev server using `nodemon`
- frontend dev server using `vite`

### Run Separately

Backend only:

```bash
npm run server
```

Frontend only:

```bash
npm run client
```

### Production Build

```bash
npm run build
```

---

## 20. Demo Accounts

The backend seeds demo accounts on startup.

Typical demo accounts include:

- `lead.demo@fmt.com`
- `builder.demo@fmt.com`
- `admin.demo@fmt.com`

Password:

```text
demo12345
```

These accounts are useful for testing:

- team lead flow
- normal user flow
- admin panel flow

---

## 21. Current Strengths of the Project

- full-stack end-to-end architecture
- proper auth flow
- clear route separation
- real-time messaging and notifications
- structured team request system
- gender-restricted project preference support
- bookmark and dashboard support
- admin overview panel
- media upload integration

---

## 22. Possible Future Improvements

- AI-based teammate recommendation
- group chat instead of direct-only chat
- task boards and project milestones
- email notifications
- push notifications
- advanced search ranking
- project analytics dashboard
- mobile app
- faculty approval workflow for academic projects

---

## 23. Short One-Line Description

**Find My Teammate is a MERN-based team formation and collaboration platform where users create profiles, post projects, discover teammates, manage join requests and invites, and communicate in real time through chat and notifications.**

