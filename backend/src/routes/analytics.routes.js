import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { getAnalytics } from '../controllers/analytics.controller.js'

const router = express.Router()

/**
 * All analytics routes require authentication
 */
router.use(authenticate)

/**
 * GET /api/v1/analytics
 * Get analytics data for the current user
 */
router.get('/', getAnalytics)

export default router
