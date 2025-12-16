# Frontend

Next.js 16 app with React 19 and Tailwind CSS v4.

## Quick Start

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev  # http://localhost:3000
```

## Features

- Next.js 16 App Router + React Server Components
- httpOnly cookie authentication
- CRUD for experiences, reflections, links
- Public explore feed with category filtering
- Tailwind CSS v4 responsive design
- Centralized API client with automatic cookies

## Scripts

```bash
npm run dev    # Development server
npm run build  # Production build
npm start      # Production server
npm run lint   # ESLint
```

## Structure

```
src/
├── app/              # App Router pages
│   ├── auth/         # Signin/Signup
│   ├── dashboard/    # User dashboard
│   ├── experiences/  # Experience CRUD
│   ├── explore/      # Public feed
│   ├── links/        # Link management
│   └── profile/      # User profile
├── components/
│   ├── common/       # Shared components
│   ├── features/     # Feature-specific
│   └── layout/       # Layout components
├── contexts/         # AuthContext
├── hooks/            # Custom hooks
├── lib/              # API client, constants
└── utils/            # Helpers
```

## Tech Stack

- Next.js 16.0.1
- React 19.2.0
- Tailwind CSS 4.1.16
- React Icons (Feather)

## Authentication

- httpOnly cookies from backend (no localStorage)
- AuthContext manages user state
- `credentials: 'include'` on all API requests
- Middleware protects routes

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Key Files

- `lib/api-client.js` - Centralized API calls
- `contexts/AuthContext.jsx` - Auth state management
- `middleware.js` - Route protection
