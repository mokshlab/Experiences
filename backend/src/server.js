import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables BEFORE any other imports that use them
// Point to the .env file in the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Now import and validate environment (after dotenv.config())
const { default: validateEnv } = await import('./config/env.js')
const env = validateEnv() // Call the function to validate

// Import routes
import authRoutes from './routes/auth.routes.js'
import experiencesRoutes from './routes/experiences.routes.js'
import reflectionsRoutes from './routes/reflections.routes.js'
import linksRoutes from './routes/links.routes.js'
import exploreRoutes from './routes/explore.routes.js'
import userRoutes from './routes/user.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { createSecurityHeaders, createCorsOptions, sanitizeInput } from './middleware/security.js'
import { apiLimiter } from './middleware/rateLimiter.js'

// Create middleware with validated env
const securityHeaders = createSecurityHeaders(env)
const corsOptions = createCorsOptions(env)

const app = express()
const PORT = env.PORT

// Configure trust proxy. Prefer explicit env `TRUST_PROXY` when provided (e.g., '1' for single proxy).
// This ensures `req.secure` and cookie `secure` behavior are accurate behind load balancers.
const trustProxyValue = process.env.TRUST_PROXY ?? '1'
app.set('trust proxy', trustProxyValue)

// Startup checks for common deployment misconfigurations
try {
  // If running in production, warn if the frontend API origin isn't included in ALLOWED_ORIGINS
  const frontendOrigin = process.env.NEXT_PUBLIC_API_URL
  if (env.NODE_ENV === 'production') {
    if (!frontendOrigin) {
      console.warn('[startup] WARNING: NEXT_PUBLIC_API_URL is not set; ensure frontend origin is configured in production environment variables.')
    } else if (!env.ALLOWED_ORIGINS.includes(frontendOrigin)) {
      console.warn(`[startup] WARNING: FRONTEND origin (${frontendOrigin}) is not present in ALLOWED_ORIGINS. CORS requests from the frontend may be blocked.`)
    }
  }
} catch (e) {
  console.warn('[startup] Warning during environment checks:', e.message || e)
}

// Quick DB sanity check: ensure expected tables/models exist (helps catch missing migrations)
import prisma from './utils/prisma.js'
;(async () => {
  try {
    // Attempt a lightweight query on BlacklistedToken to confirm migration applied
    await prisma.blacklistedToken.findFirst({ where: {}, take: 1 })
  } catch (dbErr) {
    console.warn('[startup] Database schema check failed. This often indicates pending migrations or an incompatible schema.')
    console.warn('[startup] Run `npx prisma migrate deploy` against your production database and verify migrations have been applied.')
    console.warn('[startup] DB error:', dbErr.message || dbErr)
  }
})()

// Middleware
app.use(securityHeaders)
app.use(cors(corsOptions))

if (env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter)
}

app.use(express.json({ 
  limit: '1mb',
  strict: true,
}))

app.use(express.urlencoded({ 
  extended: true,
  limit: '1mb',
  parameterLimit: 100,
}))

app.use(cookieParser())

app.use(sanitizeInput)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/experiences', experiencesRoutes)
app.use('/api/v1/experiences/:experienceId/reflections', reflectionsRoutes)
app.use('/api/v1/links', linksRoutes)
app.use('/api/v1/explore', exploreRoutes)
app.use('/api/v1/analytics', analyticsRoutes)

// Error handling
app.use(errorHandler)

let server
if (env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${env.NODE_ENV}]`)
  })
}

export default app

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...')
  if (server) {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server gracefully...')
  if (server) {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

// Catch unhandled promise rejections (prevent server crashes)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason)
  // Log but don't crash in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Promise:', promise)
  }
})

// Catch uncaught exceptions (last resort - prevent crashes)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // In production, log and gracefully restart
  if (process.env.NODE_ENV === 'production') {
    console.error('Server will restart...')
    process.exit(1)  // Let process manager (PM2, systemd) restart
  }
})
