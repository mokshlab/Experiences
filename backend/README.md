# Backend API

Express.js REST API with JWT authentication and PostgreSQL.

## Quick Start

```bash
npm install
# Create .env — see Environment Variables below
npx prisma generate
npx prisma migrate deploy
npm run dev  # http://localhost:4000
```

## Features

- 25 REST API endpoints
- httpOnly cookie authentication
- Bcrypt password hashing
- Zod validation on all inputs
- Helmet security headers + CORS + rate limiting
- PostgreSQL with Prisma ORM

## API Endpoints

**Base:** `http://localhost:4000/api/v1`

**Auth:** `/auth`
- POST `/register` - Create account
- POST `/login` - Sign in (sets httpOnly cookie)
- POST `/logout` - Sign out (blacklists token)
- GET `/me` - Get current user

**User:** `/user` (requires auth)
- GET `/profile` - Get profile
- PUT `/profile` - Update name/image
- PUT `/password` - Change password

**Experiences:** `/experiences` (requires auth)
- GET `/` - List user experiences
- POST `/` - Create experience
- GET `/:id` - Get single experience
- PUT `/:id` - Update experience
- DELETE `/:id` - Delete experience

**Reflections:** `/reflections`
- GET `/` - List reflections for experience
- POST `/` - Add reflection (requires auth)
- DELETE `/:id` - Delete own reflection (requires auth)

**Links:** `/links` (requires auth)
- GET `/` - List links
- POST `/` - Create link
- GET `/:id` - Get link with experiences
- PUT `/:id` - Update link
- DELETE `/:id` - Delete link
- POST `/:id/experiences` - Add experience to link
- DELETE `/:id/experiences/:expId` - Remove experience from link

**Explore:** `/explore` (public)
- GET `/` - Public experiences (optional `?category=`)

**Analytics:** `/analytics` (requires auth)
- GET `/` - Dashboard statistics

## Development

```bash
npm run dev                          # Start dev server
npx prisma studio                    # Database GUI
npx prisma migrate dev --name desc   # Create migration
npx prisma migrate deploy            # Apply migrations
```

## Structure

```
src/
├── controllers/  # Business logic
├── routes/       # Endpoint definitions
├── middleware/    # Auth, validation, security
├── schemas/      # Zod validation schemas
├── config/       # Environment validation
└── server.js     # Entry point
```

## Tech Stack

- Express 4.18
- Prisma 6.19 + PostgreSQL
- Zod 3.23.8 (validation)
- JWT 9.0 + Bcrypt (auth)
- Helmet 7.1 (security)

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/experiences
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_EXPIRES_IN=15m
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
PORT=4000
```

**Generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```