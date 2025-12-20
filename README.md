# Experiences Platform

A full-stack journaling and memory management application. Users document life experiences with rich metadata (categories, moods, tags, locations), connect related memories through themed links, reflect on public experiences from other users, and track personal patterns through real-time analytics.

Built with Express.js, Next.js (App Router with SSR), PostgreSQL, and JWT authentication via httpOnly cookies.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express.js 4.18, Prisma 6.19, PostgreSQL, Zod 3.23 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Recharts 2 |
| **Auth** | JWT (httpOnly cookies), bcryptjs, token blacklist |
| **Security** | Helmet, CORS whitelist, tiered rate limiting |

---

## Features

| Feature | Description |
|---------|-------------|
| **Experiences** | CRUD journal entries with 16 categories, 23 moods, tags, location, privacy toggle |
| **Memory Links** | Connect related experiences into themed collections with color coding and ordering |
| **Reflections** | Comment on public experiences with 6 feeling types (social layer) |
| **Explore** | Browse public experiences with category filtering |
| **Analytics** | Real-time dashboards — category/mood distribution, streaks, timeline, weekday patterns, top tags |
| **Profile** | Achievement tiers, inline editing, password change, account deletion with cascade |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend
```bash
cd backend
npm install
# Create .env with: DATABASE_URL, JWT_SECRET (32+ chars), JWT_REFRESH_SECRET, ALLOWED_ORIGINS
npx prisma generate
npx prisma migrate deploy
npm run dev                 # http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev                 # http://localhost:3000
```

---

## API Endpoints (25 total)

Base URL: `http://localhost:4000/api/v1`

### Authentication — 4 endpoints
| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| POST | `/auth/register` | Create account | 5/15min |
| POST | `/auth/login` | Login (sets httpOnly cookie) | 5/15min |
| POST | `/auth/logout` | Logout (blacklists token) | — |
| GET | `/auth/me` | Get current user | 100/15min |

### User Profile — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/user/profile` | Get profile |
| PUT | `/user/profile` | Update name/bio/image |
| PUT | `/user/password` | Change password |

### Experiences — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/experiences` | List (paginated, filtered) |
| POST | `/experiences` | Create (10/min limit) |
| GET | `/experiences/:id` | Get single |
| PUT | `/experiences/:id` | Update (owner only) |
| DELETE | `/experiences/:id` | Delete (owner only) |

### Reflections — 3 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/reflections` | List for experience |
| POST | `/reflections` | Create (on public experiences) |
| DELETE | `/reflections/:id` | Delete (own only) |

### Memory Links — 7 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/links` | List all links |
| POST | `/links` | Create link |
| GET | `/links/:id` | Get link with experiences |
| PUT | `/links/:id` | Update link |
| DELETE | `/links/:id` | Delete link |
| POST | `/links/:id/experiences` | Add experience to link |
| DELETE | `/links/:id/experiences/:expId` | Remove experience |

### Explore — 1 endpoint
| Method | Path | Description |
|--------|------|-------------|
| GET | `/explore` | Public experiences (?category=) |

### Analytics — 2 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics` | Dashboard stats (authenticated) |

All endpoints except `/explore` and `/auth/register|login` require authentication.

---

## Architecture

### SSR Strategy
Next.js App Router with Server Components. Two API layers:
- **`server-api.js`** — Server-side fetching with cookie forwarding (SSR)
- **`api-client.js`** — Client-side fetching with `credentials: 'include'`

### Database Schema (5 models)
```
User ──┬── Experience ──┬── Reflection
       │                └── ExperienceLink ──── Link
       ├── Reflection
       └── Link
```
All relations cascade on user deletion. 16-value `Category` enum, indexed on `userId`, `date`, `category`, `isPublic`.

### Project Structure
```
backend/
├── src/
│   ├── server.js              # Entry point, middleware chain
│   ├── config/env.js          # Zod-validated environment
│   ├── controllers/           # Business logic (6 controllers)
│   ├── middleware/             # auth, validation, security, rate limiting, errors
│   ├── routes/                # Route definitions (7 route files)
│   ├── schemas/               # Zod request validation
│   └── utils/                 # Prisma client
├── prisma/schema.prisma       # Database schema
frontend/
├── src/
│   ├── app/                   # Pages (App Router, SSR)
│   ├── components/            # Reusable UI (common/, features/, layout/)
│   ├── contexts/AuthContext.js # Auth state management
│   ├── hooks/                 # useForm, useExperience, useDropdown
│   ├── lib/                   # API clients, constants
│   └── utils/                 # Formatters, validators, security
```

---

## Security

### Authentication
- JWT tokens stored in **httpOnly cookies** (not localStorage — immune to XSS theft)
- `sameSite` set to `none` + `secure: true` in production for cross-origin deployments, `lax` in development
- bcryptjs password hashing (10 rounds)
- PostgreSQL-backed token blacklist on logout
- Password requirements: 8+ characters, uppercase, lowercase, digit

### Input Validation
- Zod schemas validate every request body before controllers execute
- Parameterized queries via Prisma (SQL injection prevention)
- XSS sanitization on text inputs

### HTTP Security
- **Helmet.js**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **CORS**: Whitelist-based origin validation via `ALLOWED_ORIGINS` env var
- **Rate limiting** (production only):
  - Auth endpoints: 5 requests / 15 minutes
  - Create endpoints: 10 requests / minute
  - Read endpoints: 100 requests / 15 minutes

### Authorization
- All queries filtered by `userId` — users can only access their own data
- Ownership verification on every update/delete (`403 Forbidden` if not owner)
- Public/private toggle on experiences controls visibility in Explore feed
- Cascading deletes at database level prevent orphaned records

### Error Handling
- Generic error messages in production (no stack traces, no credential exposure)
- Detailed logging server-side only
- Unhandled rejections caught — server never crashes

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/experiences
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
PORT=4000
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

All `.env` files are gitignored. Never commit secrets.

---

## Development Commands

```bash
# Backend
cd backend
npm run dev                          # Dev server (hot reload)
npm start                            # Production
npx prisma studio                    # Visual DB editor
npx prisma migrate dev --name desc   # Create migration
npx prisma migrate deploy            # Apply pending migrations

# Frontend
cd frontend
npm run dev                          # Dev server (Turbopack)
npm run build                        # Production build
npm start                            # Serve production build
npm run lint                         # ESLint
```

---

## License

Private project — All rights reserved
