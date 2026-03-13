import express from 'express'
import { authLimiter } from '../middleware/rateLimiter.js'
import { register, login, logout, getMe, refresh } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../schemas/user.schema.js'

const router = express.Router()

// Disable rate limiting in development for testing
const rateLimiter = process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next()

router.post('/register', rateLimiter, validate(registerSchema), register)
router.post('/login', rateLimiter, validate(loginSchema), login)
router.post('/logout', logout)
router.post('/refresh', refresh)
router.get('/me', authenticate, getMe)

export default router
