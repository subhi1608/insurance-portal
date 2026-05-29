# Insurance Portal

A full-stack insurance management application built as a portfolio showcase. Manages clients, policies, and claims with async claim processing via a background job queue.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (with soft deletes + auto `updated_at` trigger) |
| Queue | BullMQ + Redis (async claim processing) |
| Auth | JWT (access + refresh token rotation) |
| CI | GitHub Actions |

---

## Architecture

```
Browser
  └── React SPA (Vite, port 5173)
        └── REST API (Express, port 8000)
              ├── PostgreSQL  (clients, policies, claims)
              └── Redis
                    └── BullMQ worker (async claim status updates)
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+

---

## Environment Setup

Create `server/.env`:

```env
PORT=8000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB=insurance_db

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

REDIS_URL=redis://localhost:6379
```

No `.env` is needed for the client — the Vite dev server proxies `/api` to `http://localhost:8000`.

---

## Running Locally

**1. Database — run migrations**

```bash
cd server
npm ci
npm run migrate
```

**2. Server**

```bash
cd server
npm run dev
# Listening on http://localhost:8000
```

**3. Background worker** (separate terminal)

```bash
cd server
npm run worker
```

**4. Client**

```bash
cd client
npm ci
npm run dev
# Open http://localhost:5173
```

---

## Running Tests

**Server** (unit + integration tests):

```bash
cd server
npm test
```

**Client** (component tests):

```bash
cd client
npx vitest run
```

**CI** runs both automatically on every push.
