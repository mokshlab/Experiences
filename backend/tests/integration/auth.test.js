import request from 'supertest'
import app from '../../src/server.js'
import prisma from '../../src/utils/prisma.js'

// Simple test to verify the auth endpoints return the expected status codes
describe('Authentication API Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123'
  }

  let cookieString = '' // To store session cookies

  beforeAll(async () => {
    // Ensure database connection is clean
    await prisma.$connect()
  })

  afterAll(async () => {
    // Clean up created user to avoid conflicts
    try {
      await prisma.user.delete({
        where: { email: testUser.email }
      })
    } catch (e) {
      // Ignore if user isn't found
    }
    await prisma.$disconnect()
  })

  it('should register a newly created user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
    
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toEqual(testUser.email)
    
    // Check if cookies are set
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.includes('token='))).toBeTruthy()
    expect(cookies.some(c => c.includes('refreshToken='))).toBeTruthy()
  })

  it('should login an existing user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('user')
    
    // Save cookies for the next request
    cookieString = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
  })

  it('should fetch the current user profile (protected route)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookieString)
    
    expect(res.statusCode).toEqual(200)
    expect(res.body.user.email).toEqual(testUser.email)
  })

  it('should refresh the authentication token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieString)
    
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message', 'Token refreshed successfully')
    
    // Ensure a new access token was issued via set-cookie
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some(c => c.includes('token='))).toBeTruthy()
  })
})
