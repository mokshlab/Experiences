import { ZodError } from 'zod';

/**
 * Zod validation middleware
 * Validates request data (body, query, params) against a Zod schema
 * 
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => async (req, res, next) => {
  try {
    // Parse and validate request data
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // If validation passes, continue to next middleware
    next();
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errors = error.issues?.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })) || [];

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Pass other errors to error handler middleware
    next(error);
  }
};

export default validate;
