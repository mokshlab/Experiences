import express from 'express'
import { readLimiter } from '../middleware/rateLimiter.js'
import { getPublicExperiences } from '../controllers/explore.controller.js'

const router = express.Router()

router.get('/', readLimiter, getPublicExperiences)

export default router