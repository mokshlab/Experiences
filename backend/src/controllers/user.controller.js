import prisma from '../utils/prisma.js'
import bcrypt from 'bcryptjs'

/**
 * Get user profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: {
            experiences: true,
            links: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
}

/**
 * Update user profile (name, image)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, image, isPublic } = req.body

    // Build update data object
    const updateData = {}
    
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Name is required' })
      }
      if (name.length > 100) {
        return res.status(400).json({ message: 'Name must be less than 100 characters' })
      }
      updateData.name = name.trim()
    }
    
    if (image !== undefined) {
      updateData.image = image
    }
    
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isPublic: true,
      },
    })

    res.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body
    // Validation handled by Zod schema (8+ chars, complexity, confirmPassword match)

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete user account (cascade deletes all user data)
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Password is required' })
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password is incorrect' })
    }

    // Delete user (cascade deletes all experiences, links, reflections)
    await prisma.user.delete({
      where: { id: userId },
    })

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    next(error)
  }
}
