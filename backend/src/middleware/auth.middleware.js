import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'

/**
 * Token blacklist backed by PostgreSQL.
 * Expired tokens are cleaned up probabilistically on logout.
 */

/**
 * Add token to blacklist (used during logout)
 */
export const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token)
    if (decoded && decoded.exp) {
      const jti = decoded.jti || token.substring(0, 20)
      const expiresAt = new Date(decoded.exp * 1000)

      await prisma.blacklistedToken.upsert({
        where: { jti },
        update: { expiresAt },
        create: { jti, expiresAt },
      })

      // Cleanup expired tokens periodically (1 in 20 chance per logout)
      if (Math.random() < 0.05) {
        prisma.blacklistedToken.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        }).catch(() => {})  // Fire-and-forget cleanup
      }
    }
  } catch (error) {
    console.error('Error blacklisting token:', error.message)
  }
}

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = async (token) => {
  try {
    const decoded = jwt.decode(token)
    const jti = decoded?.jti || token.substring(0, 20)
    const entry = await prisma.blacklistedToken.findUnique({ where: { jti } })
    return !!entry
  } catch {
    return false
  }
}

/**
 * Authentication middleware — verifies JWT from cookie or Authorization header,
 * checks against token blacklist, attaches user to request.
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      })
    }

    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({ 
        success: false,
        message: 'Token has been revoked. Please login again.' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '7d',
    })
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token structure' 
      })
    }
    
    req.user = { 
      id: decoded.userId,
      tokenIssuedAt: decoded.iat,
    }
    req.token = token
    
    next()
  } catch (error) {
    let message = 'Invalid or expired token'
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please login again.'
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid authentication token.'
    }
    
    return res.status(401).json({ 
      success: false,
      message 
    })
  }
}
