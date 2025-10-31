import prisma from '../utils/prisma.js'

export const getPublicExperiences = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 20
    const category = req.query.category // Get category from query params
    const skip = page * limit

    // Build where clause
    const whereClause = { 
      isPublic: true,
      user: {
        isPublic: true // Only show experiences from users with public profiles
      }
    }
    
    // Add category filter if provided and not 'ALL'
    if (category && category !== 'ALL') {
      whereClause.category = category
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { reflections: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.experience.count({ where: whereClause }),
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