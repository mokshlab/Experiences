import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'

/**
 * POST /auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    const token = jwt.sign(
      { 
        userId: user.id,
        jti: `${user.id}-${Date.now()}`,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /auth/login
 */
export const login = async (req, res, next) => {
    const _rid = req.headers?.['x-request-id']
      ? `${String(req.headers['x-request-id']).slice(0, 8)}...`
      : `ts:${Date.now()}`
    console.info(`[auth:${_rid}] origin=${req.headers?.origin || 'none'} cookies token=${!!req.cookies?.token} refresh=${!!req.cookies?.refreshToken}`)
  try {
    const { email, password } = req.body

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        jti: `${user.id}-${Date.now()}`,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    })

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res) => {
  const { blacklistToken } = await import('../middleware/auth.middleware.js')
  
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    await blacklistToken(token)
  }
  
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
  
  res.json({ 
    success: true,
    message: 'Logout successful' 
  })
}

export const getMe = async (req, res, next) => {
  const _rid = req.headers?.['x-request-id']
    ? `${String(req.headers['x-request-id']).slice(0, 8)}...`
    : `ts:${Date.now()}`
  console.info(`[auth:${_rid}] origin=${req.headers?.origin || 'none'} cookies token=${!!req.cookies?.token} refresh=${!!req.cookies?.refreshToken}`)
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
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
 * POST /auth/refresh
 * Uses the refreshToken cookie to issue a new access token
 */
export const refresh = async (req, res, next) => {
  const _rid = req.headers?.['x-request-id']
    ? `${String(req.headers['x-request-id']).slice(0, 8)}...`
    : `ts:${Date.now()}`
  console.info(`[auth:${_rid}] origin=${req.headers?.origin || 'none'} cookies token=${!!req.cookies?.token} refresh=${!!req.cookies?.refreshToken}`)
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' })
    }

    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      )

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      // Issue new access token
      const newToken = jwt.sign(
        { 
          userId: user.id,
          jti: `${user.id}-${Date.now()}`,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      )

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })

      res.json({ message: 'Token refreshed successfully' })
    } catch (error) {
      // If refresh token is invalid/expired, clear it with same options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      }
      res.clearCookie('token', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }
  } catch (error) {
    next(error)
  }
}
