import { z } from 'zod';

// Create link validation schema
const createLinkSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name cannot exceed 200 characters'),
    description: z.string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .nullable(),
    color: z.string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be hex color)')
      .optional(),
    experienceIds: z.array(
      z.string().min(1, 'Invalid ID')
    ).optional().default([]),
  }),
});

// Update link validation schema
const updateLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(200, 'Name cannot exceed 200 characters')
      .optional(),
    description: z.string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .nullable(),
    color: z.string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be hex color)')
      .optional(),
  }),
});

// Query links validation schema
const queryLinksSchema = z.object({
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
    experienceId: z.string().min(1, 'Invalid ID').optional(),
  }).optional(),
});

// Get single link validation schema
const getLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
});

// Delete link validation schema
const deleteLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
});

// Add experience to link validation schema
const addExperienceToLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid ID'),
  }),
  body: z.object({
    experienceId: z.string().min(1, 'Invalid ID')
  }),
});

export {
  createLinkSchema,
  updateLinkSchema,
  queryLinksSchema,
  getLinkSchema,
  deleteLinkSchema,
  addExperienceToLinkSchema,
};
