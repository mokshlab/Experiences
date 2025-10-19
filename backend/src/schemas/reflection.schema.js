import { z } from 'zod';

// Create reflection validation schema
const createReflectionSchema = z.object({
  params: z.object({
    experienceId: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Content is required')
      .max(5000, 'Content cannot exceed 5000 characters'),
  }),
});

// Update reflection validation schema  
const updateReflectionSchema = z.object({
  params: z.object({
    experienceId: z.string().min(1, 'Invalid ID'),
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Content is required')
      .max(5000, 'Content cannot exceed 5000 characters'),
  }),
});

// Get reflections validation schema
const getReflectionsSchema = z.object({
  params: z.object({
    experienceId: z.string().min(1, 'Invalid ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .optional(),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(val => val <= 100, 'Limit cannot exceed 100')
      .optional(),
  }).optional(),
});

// Delete reflection validation schema
const deleteReflectionSchema = z.object({
  params: z.object({
    experienceId: z.string().min(1, 'Invalid ID'),
    reflectionId: z.string().min(1, 'Invalid ID'),
  }),
});

export {
  createReflectionSchema,
  updateReflectionSchema,
  getReflectionsSchema,
  deleteReflectionSchema,
};
