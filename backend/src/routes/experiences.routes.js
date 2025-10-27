import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { createLimiter, readLimiter } from '../middleware/rateLimiter.js'
import {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experiences.controller.js'
import validate from '../middleware/validate.js'
import {
  createExperienceSchema,
  updateExperienceSchema,
  getExperienceSchema,
  deleteExperienceSchema,
  queryExperiencesSchema,
} from '../schemas/experience.schema.js'

const router = express.Router()

router.get('/', authenticate, readLimiter, validate(queryExperiencesSchema), getExperiences)
router.get('/:id', authenticate, readLimiter, validate(getExperienceSchema), getExperience)
router.post('/', authenticate, createLimiter, validate(createExperienceSchema), createExperience)
router.put('/:id', authenticate, validate(updateExperienceSchema), updateExperience)
router.delete('/:id', authenticate, validate(deleteExperienceSchema), deleteExperience)

export default router
