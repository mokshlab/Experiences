import rateLimit from 'express-rate-limit'

// Authentication rate limiter - stricter limits for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
})

// Create operation rate limiter
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 create requests per minute
  message: { 
    success: false,
    error: 'Too many create requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Read operation rate limiter
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: 100, // 100 read requests per minute
  message: { 
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiter - applies to all routes
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes default
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests default
  message: {
    success: false,
    error: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
    })
  },
})
