import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { createLimiter, readLimiter } from '../middleware/rateLimiter.js'
import { getReflections, createReflection, deleteReflection } from '../controllers/reflections.controller.js'
import validate from '../middleware/validate.js'
import {
  createReflectionSchema,
  getReflectionsSchema,
  deleteReflectionSchema,
} from '../schemas/reflection.schema.js'

const router = express.Router({ mergeParams: true })

router.get('/', readLimiter, validate(getReflectionsSchema), getReflections)
router.post('/', authenticate, createLimiter, validate(createReflectionSchema), createReflection)
router.delete('/:reflectionId', authenticate, validate(deleteReflectionSchema), deleteReflection)

export default router