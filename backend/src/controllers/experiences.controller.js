import prisma from '../utils/prisma.js'

export const getExperiences = async (req, res, next) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 20
    const skip = page * limit

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where: { userId },
        include: {
          _count: {
            select: { reflections: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.experience.count({ where: { userId } }),
    ])

    res.json({
      experiences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getExperience = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { reflections: true },
        },
      },
    })

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' })
    }

    if (!experience.isPublic && experience.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    res.json(experience)
  } catch (error) {
    next(error)
  }
}

export const createExperience = async (req, res, next) => {
  try {
    // Debug info to help trace creation failures in production
    console.info('[createExperience] incoming request', {
      origin: req.headers.origin || req.headers.host,
      user: req.user ? { id: req.user.id } : null,
      bodyKeys: Object.keys(req.body || {}),
    })

    const userId = req.user.id
    const { title, content, date, category, isPublic, tags, mood, location } = req.body || {}

    if (!title || !content || !category) {
      console.warn('[createExperience] validation failed - missing fields', { title, content, category })
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const experience = await prisma.experience.create({
      data: {
        title,
        content,
        date: date || new Date().toISOString(),
        category,
        isPublic: isPublic || false,
        tags: tags || [],
        mood,
        location,
        userId,
      },
    })

    res.status(201).json({
      message: 'Experience created successfully',
      experience,
    })
  } catch (error) {
    next(error)
  }
}

export const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const existing = await prisma.experience.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Experience not found' })
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // Only allow specific fields to be updated (prevent mass assignment)
    const { title, content, date, category, isPublic, tags, mood, location } = req.body
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (date !== undefined) updateData.date = date
    if (category !== undefined) updateData.category = category
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (tags !== undefined) updateData.tags = tags
    if (mood !== undefined) updateData.mood = mood
    if (location !== undefined) updateData.location = location
    
    const experience = await prisma.experience.update({
      where: { id },
      data: updateData,
    })

    res.json({
      message: 'Experience updated successfully',
      experience,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const existing = await prisma.experience.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Experience not found' })
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await prisma.experience.delete({ where: { id } })

    res.json({ message: 'Experience deleted successfully' })
  } catch (error) {
    next(error)
  }
}
