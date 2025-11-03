import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { createLimiter, readLimiter } from '../middleware/rateLimiter.js'
import {
  getLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
  addExperienceToLink,
  removeExperienceFromLink,
} from '../controllers/links.controller.js'
import validate from '../middleware/validate.js'
import {
  createLinkSchema,
  updateLinkSchema,
  getLinkSchema,
  deleteLinkSchema,
  queryLinksSchema,
} from '../schemas/link.schema.js'

const router = express.Router()

router.get('/', authenticate, readLimiter, validate(queryLinksSchema), getLinks)
router.get('/:id', authenticate, readLimiter, validate(getLinkSchema), getLink)
router.post('/', authenticate, createLimiter, validate(createLinkSchema), createLink)
router.put('/:id', authenticate, validate(updateLinkSchema), updateLink)
router.delete('/:id', authenticate, validate(deleteLinkSchema), deleteLink)
router.post('/:id/experiences', authenticate, addExperienceToLink)
router.delete('/:id/experiences/:expId', authenticate, removeExperienceFromLink)

export default router