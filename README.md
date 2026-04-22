# Scalable REST API with Authentication, RBAC, and React Test UI

This project includes:
- A **Node.js + Express + MongoDB backend** with JWT authentication
- **Role-based access control** (`user`, `admin`)
- **Task CRUD APIs** with validation and centralized error handling
- **API versioning** (`/api/v1`)
- **Swagger API docs**
- A **React + JSX frontend** to test registration, login, protected routes, and task operations

---

## Project Structure

```text
BACKEND/
  backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      utils/
    .env
    .env.example
    package.json
  frontend/
    src/
      App.jsx
      main.jsx
      style.css
    index.html
    vite.config.js
    package.json
  README.md
```

---

## Tech Stack

### Backend
- Express
- Mongoose (MongoDB)
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `express-validator` for input validation
- `helmet`, `cors`, `express-rate-limit` for basic security
- `swagger-ui-express` + `swagger-jsdoc` for API documentation

### Frontend
- React (JSX)
- Vite

---

## Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB Atlas URI or local MongoDB instance

---

## Environment Variables (Backend)

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=change_this_in_production
REDIS_URL=redis://localhost:6379
```

> Database name in your URI should be `BACKEND` as requested.

---

## Installation

From project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## Run the Project

Use **two terminals**.

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: usually `http://localhost:5173`

---

## API Documentation

Swagger UI:

`http://localhost:5000/api-docs`

Health route:

`http://localhost:5000/`

---

## API Base URL and Versioning

All versioned routes are under:

`/api/v1`

Example:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/tasks`

---

## Authentication & Authorization

### JWT Authentication
- On successful register/login, API returns a token.
- Send token in Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### RBAC
- Roles: `user`, `admin`
- Standard task routes are protected for authenticated users.
- Admin-specific route:
  - `GET /api/v1/tasks/admin/all` (admin only)

---

## Task CRUD Endpoints

- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get one task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

Task statuses:
- `pending`
- `in_progress`
- `done`

---

## Frontend Testing Flow

Use the React UI to:
- Register a user (role can be `user` or `admin`)
- Login and store JWT in localStorage
- Fetch protected profile (`/auth/me`)
- Create, list, update, and delete tasks
- View success/error messages from API responses

---

## Sample Test Users

You can register using examples like:

- User:
  - Name: `Aditya Test User`
  - Email: `aditya.user1@example.com`
  - Password: `Test@12345`
  - Role: `user`

- Admin:
  - Name: `Aditya Admin`
  - Email: `aditya.admin1@example.com`
  - Password: `Admin@12345`
  - Role: `admin`

---

## Build Commands

Frontend production build:

```bash
cd frontend
npm run build
```

Backend production start:

```bash
cd backend
npm start
```

---

## Security Notes

- Change `JWT_SECRET` in production.
- Never commit real secrets to a public repository.
- Consider using HTTP-only cookies for token handling in production.
- Add stricter CORS origin policies before deployment.

---

## Redis Caching

- Read endpoints for tasks are cached using Redis:
  - `GET /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
- Cache keys are role/user scoped to avoid data leakage.
- Cache TTL is set to 120 seconds.
- On task create/update/delete, related user/admin task cache keys are invalidated.
- If Redis is unavailable or `REDIS_URL` is not set, the API continues to work without caching.

### Run Redis Locally

Use any one option:

```bash
# If Redis is installed locally
redis-server
```

```bash
# With Docker
docker run --name backend-redis -p 6379:6379 -d redis
```

### Verify Cache Is Working

1. Start backend with `REDIS_URL=redis://localhost:6379`.
2. Call `GET /api/v1/tasks` twice with the same authenticated user.
3. The second response should include:

```json
{
  "meta": { "cached": true }
}
```

