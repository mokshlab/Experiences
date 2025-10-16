/**
 * Global error handler — safe error responses in production, full details in development.
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details (server-side only, never sent to client)
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    error: err.message,
    stack: err.stack,
  }
  
  // In production, log to file/service. In dev, console is fine
  if (process.env.NODE_ENV === 'production') {
    // Production: Log errors to console (can be forwarded to CloudWatch, etc.)
    console.error('Production Error:', JSON.stringify(errorLog))
  } else {
    console.error('Development Error:', errorLog)
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500
  
  // Generic message for production (don't leak internal details)
  let message = err.message || 'Internal server error'
  
  // In production, hide sensitive error messages
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.'
  }
  
  // Validation errors should show details (not sensitive)
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    message = err.message
  }
  
  // Prevent response if headers already sent (avoid crashes)
  if (res.headersSent) {
    return next(err)
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    }),
  })
}

/**
 * Async error wrapper - Prevents unhandled promise rejections
 * Usage: router.get('/', asyncHandler(async (req, res) => {...}))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
