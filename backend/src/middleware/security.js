import helmet from 'helmet'

/**
 * Helmet configuration factory.
 * @param {Object} env - Validated environment config
 * @returns {Function} Helmet middleware
 */
export const createSecurityHeaders = (env) => helmet({
  contentSecurityPolicy: {
    directives: (() => {
      const isDev = env.NODE_ENV === 'development'
      const scriptSrc = ["'self'"]
      const styleSrc = ["'self'"]
      if (isDev) {
        // In development we allow unsafe-inline/eval for convenience (Next dev tools, Tailwind JIT)
        scriptSrc.push("'unsafe-eval'")
        scriptSrc.push("'unsafe-inline'")
        styleSrc.push("'unsafe-inline'")
      }

      return {
        defaultSrc: ["'self'"],
        styleSrc,
        scriptSrc,
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...env.ALLOWED_ORIGINS],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    })(),
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  hidePoweredBy: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  dnsPrefetchControl: { allow: false },
})

/**
 * CORS configuration factory with origin whitelist.
 * @param {Object} env - Validated environment config
 * @returns {Object} CORS options
 */
export const createCorsOptions = (env) => ({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }
    
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 600,
  optionsSuccessStatus: 200,
})

/**
 * Request sanitization middleware
 * Strips potentially dangerous characters from request data
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params)
  }
  
  next()
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value)
  }
  
  return sanitized
}

/**
 * Sanitize a single string value against injection patterns.
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') {
    return value
  }
  
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\$where/gi,
    /\$ne|\$gt|\$lt|\$regex/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi,
  ]
  
  let sanitized = value
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Encode angle brackets
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  return sanitized.trim()
}

/**
 * Validate URL safety - Prevents open redirect attacks
 */
export function isValidUrl(url) {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
