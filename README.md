# Leadflow — Full Stack Lead Manager

A responsive, multi-user lead management application built for the Meru Technosoft Full Stack Developer screening assignment. It includes the six required workflows plus authentication, per-user data isolation, a status dashboard, server-side pagination/sorting, CSV export, and API tests.

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, express-validator
- **Database:** MongoDB
- **Security:** password hashing, authenticated routes, per-user ownership filters, Helmet, CORS, JSON body limit, auth rate limiting
- **Tests:** Jest, Supertest, mongodb-memory-server

## Features

- Sign up and sign in with JWT authentication
- Each account can only access its own leads
- Create, view, edit and delete leads (delete requires confirmation)
- Lead fields: name, email, phone, company, source and status
- Frontend and API validation
- Search by name, email or company; filter by status and source
- Dashboard counts for total, New, Contacted, Qualified and Lost leads
- Server-side pagination and sorting
- Export the currently displayed page to CSV
- Responsive layout for desktop, tablet and mobile
- API health endpoint at `/api/health`

## Run locally

### Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- MongoDB running locally, or a MongoDB Atlas connection string
- npm

### 1. Configure the backend

```bash
cd backend
cp .env.example .env
```

Set `MONGODB_URI` and replace `JWT_SECRET` with a long random secret. Keep `.env` private.

```bash
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default.

### 2. Configure the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## API reference

All lead endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account and return token |
| POST | `/api/auth/login` | Authenticate and return token |
| GET | `/api/auth/me` | Current authenticated user |
| GET | `/api/leads` | List/search/filter/sort/paginate owned leads |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update owned lead |
| DELETE | `/api/leads/:id` | Delete owned lead |
| GET | `/api/leads/dashboard` | Status counts for current user |
| GET | `/api/health` | API health check |

### List query parameters

`page` (default 1), `limit` (default 8, maximum 50), `search`, `status`, `source`, `sortBy` (`createdAt`, `name`, `status`, `company`) and `order` (`asc` or `desc`).

### Example lead payload

```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "phone": "+91 98765 43210",
  "company": "Acme Systems",
  "source": "Website",
  "status": "New"
}
```

Valid sources: `Website`, `Referral`, `Social Media`, `Cold Call`, `Advertisement`, `Other`.

Valid statuses: `New`, `Contacted`, `Qualified`, `Lost`.

## Run API tests

```bash
cd backend
npm install
npm test
```

The test suite starts an ephemeral MongoDB instance using `mongodb-memory-server`. The first run may download the MongoDB binary; an internet connection is required for that initial download.

## Deployment

### MongoDB Atlas

1. Create a cluster and database user in MongoDB Atlas.
2. Add your deployment host/IP to the Atlas network access allowlist.
3. Copy the Atlas connection string and set it as `MONGODB_URI` in the backend environment.

### Backend (Render or Railway)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL=<your-frontend-origin>`

### Frontend (Vercel or Netlify)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-backend-host>/api`
- Configure SPA rewrites so all app routes serve `index.html`.

After deployment, set the backend `CLIENT_URL` to the exact frontend origin and redeploy the backend.

## Assumptions and design decisions

- A lead belongs to exactly one user; ownership is enforced in every read/update/delete query, not just in the UI.
- Email is required and validated, but it is not globally unique because different users may independently manage the same contact.
- Lead source and status use fixed enumerations to keep filtering and reporting consistent.
- The dashboard aggregates the authenticated user's leads only.
- Pagination is performed by the API to avoid loading an unbounded lead list into the browser.
- CSV export exports the currently displayed page, matching the visible filtered/sorted table.

## What I would improve with more time

- Add refresh-token rotation and secure HttpOnly cookie-based sessions.
- Add audit history, notes, reminders and follow-up dates to each lead.
- Add configurable pipeline stages, bulk actions and export-all support.
- Add stronger integration coverage for update/delete, ownership isolation, sorting and pagination.
- Add accessibility review, end-to-end browser tests and structured production logging.

## Submission note

The trickiest design decision was ensuring multi-user data isolation consistently across list, dashboard, update and delete operations. I kept ownership in the database query itself so a user cannot access another user's lead simply by guessing an ID.
