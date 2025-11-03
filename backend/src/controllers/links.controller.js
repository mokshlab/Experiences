import prisma from '../utils/prisma.js'

export const getLinks = async (req, res, next) => {
  try {
    const userId = req.user.id
    const includeAllIds = req.query.includeAllIds === 'true'

    const links = await prisma.link.findMany({
      where: { userId },
      include: {
        _count: {
          select: { experienceLinks: true },
        },
        experienceLinks: includeAllIds
          ? {
              // When includeAllIds is true, fetch all experience data for graph/filtering
              orderBy: { order: 'asc' },
              select: {
                experienceId: true,
                experience: {
                  select: {
                    id: true,
                    title: true,
                    category: true,
                    mood: true,
                    date: true,
                  },
                },
              },
            }
          : {
              // Default behavior: preview of first 3 experiences with full details
              take: 3,
              orderBy: { order: 'asc' },
              include: {
                experience: {
                  select: {
                    id: true,
                    title: true,
                    date: true,
                    category: true,
                  },
                },
              },
            },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ links })
  } catch (error) {
    next(error)
  }
}

export const getLink = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const link = await prisma.link.findUnique({
      where: { id },
      include: {
        experienceLinks: {
          include: {
            experience: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { experienceLinks: true },
        },
      },
    })

    if (!link) {
      return res.status(404).json({ message: 'Link not found' })
    }

    if (link.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    res.json({ link })
  } catch (error) {
    next(error)
  }
}

export const createLink = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, description, color, experienceIds } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    // experienceIds is now optional - can create empty link and add experiences later
    if (experienceIds && (!Array.isArray(experienceIds) || experienceIds.length < 2)) {
      return res.status(400).json({ message: 'At least 2 experiences are required when adding experiences' })
    }

    // If experienceIds provided, verify ownership
    if (experienceIds && experienceIds.length > 0) {
      const experiences = await prisma.experience.findMany({
        where: {
          id: { in: experienceIds },
          userId,
        },
      })

      if (experiences.length !== experienceIds.length) {
        return res.status(403).json({ message: 'Some experiences not found or not owned by you' })
      }
    }

    const link = await prisma.link.create({
      data: {
        name,
        description,
        color: color || '#8b5cf6',
        userId,
        experienceLinks: experienceIds && experienceIds.length > 0 
          ? {
              create: experienceIds.map((expId, index) => ({
                experienceId: expId,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        _count: {
          select: { experienceLinks: true },
        },
      },
    })

    res.status(201).json({
      message: 'Link created successfully',
      link,
    })
  } catch (error) {
    next(error)
  }
}

export const updateLink = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { name, description, color } = req.body

    const existing = await prisma.link.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Link not found' })
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const link = await prisma.link.update({
      where: { id },
      data: { name, description, color },
    })

    res.json({
      message: 'Link updated successfully',
      link,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const existing = await prisma.link.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Link not found' })
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await prisma.link.delete({ where: { id } })

    res.json({ message: 'Link deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const addExperienceToLink = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const { experienceId } = req.body

    if (!experienceId) {
      return res.status(400).json({ message: 'Experience ID is required' })
    }

    const link = await prisma.link.findUnique({ where: { id } })
    if (!link) {
      return res.status(404).json({ message: 'Link not found' })
    }
    if (link.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' })
    }
    if (experience.userId !== userId) {
      return res.status(403).json({ message: 'You do not own this experience' })
    }

    const existing = await prisma.experienceLink.findFirst({
      where: { linkId: id, experienceId },
    })
    if (existing) {
      return res.status(400).json({ message: 'Experience already linked' })
    }

    const count = await prisma.experienceLink.count({ where: { linkId: id } })

    const experienceLink = await prisma.experienceLink.create({
      data: {
        linkId: id,
        experienceId,
        order: count,
      },
      include: {
        experience: true,
      },
    })

    res.status(201).json({
      message: 'Experience added to link',
      experienceLink,
    })
  } catch (error) {
    next(error)
  }
}

export const removeExperienceFromLink = async (req, res, next) => {
  try {
    const { id, expId } = req.params
    const userId = req.user.id

    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return res.status(404).json({ message: 'Link not found' })
    }
    if (link.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const experienceLink = await prisma.experienceLink.findFirst({
      where: { linkId: id, experienceId: expId },
    })

    if (!experienceLink) {
      return res.status(404).json({ message: 'Experience link not found' })
    }

    await prisma.experienceLink.delete({ where: { id: experienceLink.id } })

    res.json({ message: 'Experience removed from link' })
  } catch (error) {
    next(error)
  }
}
