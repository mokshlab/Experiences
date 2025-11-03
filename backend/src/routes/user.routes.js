import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import validate from '../middleware/validate.js'
import { updateProfileSchema, changePasswordSchema, deleteAccountSchema } from '../schemas/user.schema.js'
import { getUserProfile, updateUserProfile, changePassword, deleteAccount } from '../controllers/user.controller.js'

const router = express.Router()

/**
 * All routes require authentication
 */
router.use(authenticate)

/**
 * GET /api/v1/user/profile
 * Get current user profile
 */
router.get('/profile', getUserProfile)

/**
 * PUT /api/v1/user/profile
 * Update user profile (name, image, isPublic)
 */
router.put('/profile', validate(updateProfileSchema), updateUserProfile)

/**
 * PUT /api/v1/user/password
 * Change user password
 */
router.put('/password', validate(changePasswordSchema), changePassword)

/**
 * DELETE /api/v1/user/account
 * Delete user account (requires password confirmation)
 */
router.delete('/account', validate(deleteAccountSchema), deleteAccount)

export default router
