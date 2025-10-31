import prisma from '../utils/prisma.js'

export const getReflections = async (req, res, next) => {
  try {
    const { experienceId } = req.params
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 20
    const skip = page * limit

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' })
    }

    if (!experience.isPublic && req.user && experience.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const [reflections, total] = await Promise.all([
      prisma.reflection.findMany({
        where: { experienceId },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reflection.count({ where: { experienceId } }),
    ])

    res.json({
      reflections,
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

export const createReflection = async (req, res, next) => {
  try {
    const { experienceId } = req.params
    const userId = req.user.id
    const { content, feeling } = req.body

    if (!content && !feeling) {
      return res.status(400).json({ message: 'Content or feeling is required' })
    }

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' })
    }

    if (!experience.isPublic) {
      return res.status(403).json({ message: 'Cannot reflect on private experience' })
    }

    const reflection = await prisma.reflection.create({
      data: {
        content,
        feeling,
        experienceId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    res.status(201).json({
      message: 'Reflection created successfully',
      reflection,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteReflection = async (req, res, next) => {
  try {
    const { experienceId, reflectionId } = req.params
    const userId = req.user.id

    const reflection = await prisma.reflection.findUnique({
      where: { id: reflectionId },
    })

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' })
    }

    if (reflection.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reflections' })
    }

    if (reflection.experienceId !== experienceId) {
      return res.status(400).json({ message: 'Reflection does not belong to this experience' })
    }

    await prisma.reflection.delete({
      where: { id: reflectionId },
    })

    res.json({ message: 'Reflection deleted successfully' })
  } catch (error) {
    next(error)
  }
}