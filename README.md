# Cooking Assistant

A full‑stack recipe assistant that lets users browse recipes (via TheMealDB), save favorites, manage cooking timers, and use a voice assistant to read instructions hands‑free on the recipe detail page.

- Frontend: React + Vite with a voice assistant powered by Web Speech APIs
- Backend: Node.js + Express + MongoDB (Mongoose) with JWT auth

## Features
- Search recipes and view rich details pulled from TheMealDB API
- Voice assistant on recipe detail page that can read: "Read All", and step-by-step commands (start/pause/continue/next/previous/repeat/stop)
- Favorites: toggle save/remove per user, persisted in MongoDB
- Timers: per-user cooking timers saved to the backend
- Auth: register/login with hashed passwords and JWTs

## Tech Stack
- Frontend
  - React 19, Vite, React Router, React Icons
  - Custom hook `useSpeechAssistant` (Web Speech API: SpeechRecognition + SpeechSynthesis)
- Backend
  - Node.js, Express, MongoDB (Mongoose)
  - JWT authentication, bcryptjs for hashing, CORS, dotenv
- Dev Tooling
  - concurrently (start frontend + backend with one command)

## Project Structure
```
backend/
  app.js
  bin/www                # server bootstrap
  config/db.js           # Mongo connection
  controllers/           # auth, users
  middleware/            # auth middleware
  models/                # user, recipe models
  routes/                # /api/auth, /api/users
frontend/
  src/
    pages/               # Home, RecipeDetail, Login, Signup, etc.
    components/          # UI components (Navbar, RecipeCard, Timer, etc.)
    hooks/useSpeechAssistant.js
    services/apiService.js
  vite.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- MongoDB Atlas account (or a local MongoDB instance)

### Environment Variables
Create a `.env` file in `backend/` with:
```
MONGODB_URI=<your mongodb connection string>
JWT_SECRET=<any-strong-secret>
PORT=3000
```
Notes:
- Frontend calls the backend at `http://127.0.0.1:3000/api` by default (see `frontend/src/services/apiService.js`). Update either the `.env` PORT or the frontend baseURL if you change ports.

### Run (single command)
From the project root:
```powershell
npm run dev
```
This starts:
- Backend on http://127.0.0.1:3000
- Frontend (Vite) on http://127.0.0.1:5173

### Run (separately)
In two terminals:
```powershell
# Terminal 1 (backend)
cd backend
npm start

# Terminal 2 (frontend)
cd frontend
npm run dev
```

## API Reference
Base URL: `http://127.0.0.1:3000/api`

Auth is Bearer JWT except for register/login. Include header:
```
Authorization: Bearer <token>
``