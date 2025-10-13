import { z } from 'zod';

/**
 * Environment variables validation schema
 * Validates all required environment variables on application startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string()
    .url('DATABASE_URL must be a valid URL')
    .min(1, 'DATABASE_URL is required'),

  // JWT Secrets
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .max(256, 'JWT_SECRET cannot exceed 256 characters'),
  
  JWT_REFRESH_SECRET: z.string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
    .max(256, 'JWT_REFRESH_SECRET cannot exceed 256 characters')
    .optional()
    .default(process.env.JWT_SECRET || ''),

  // JWT Expiration
  JWT_EXPIRES_IN: z.string()
    .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must be in format: 15m, 1h, 7d, etc.')
    .optional()
    .default('15m'),
  
  JWT_REFRESH_EXPIRES_IN: z.string()
    .regex(/^\d+[smhd]$/, 'JWT_REFRESH_EXPIRES_IN must be in format: 15m, 1h, 7d, etc.')
    .optional()
    .default('7d'),

  // Server Configuration
  PORT: z.string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional()
    .default('4000'),

  NODE_ENV: z.enum(['development', 'production', 'test'])
    .optional()
    .default('development'),

  // CORS Configuration
  ALLOWED_ORIGINS: z.string()
    .transform((val) => val.split(',').map(origin => origin.trim()))
    .optional()
    .default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string()
    .transform(Number)
    .pipe(z.number().min(1000))
    .optional()
    .default('900000'), // 15 minutes

  RATE_LIMIT_MAX_REQUESTS: z.string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .optional()
    .default('info'),
});

/**
 * Validates environment variables on startup
 * Exits process if validation fails
 * 
 * @returns {Object} Validated environment configuration
 */
const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    console.log('Environment validated');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    console.error('');
    
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err) => {
        console.error(`  ❌ ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  ❌ ${error.message}`);
    }
    
    console.error('');
    console.error('Please check your .env file and ensure all required variables are set correctly.');
    console.error('Refer to .env.example for the complete list of required variables.');
    
    process.exit(1);
  }
};

// Export the validation function (not the result)
// This allows dotenv.config() to run before validation
export default validateEnv;
