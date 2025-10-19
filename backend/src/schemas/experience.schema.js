import { z } from 'zod';

// Valid experience categories - must match Prisma schema enum
const ExperienceCategory = z.enum([
  'DAILY_JOURNAL',
  'SOMETHING_NEW',
  'PERSONAL_GROWTH',
  'DREAMS_GOALS',
  'RELATIONSHIPS',
  'FAMILY',
  'HOBBIES',
  'SPORTS',
  'TRAVEL_ADVENTURE',
  'NATURE_OUTDOORS',
  'CHALLENGES',
  'WORK_CAREER',
  'EDUCATION',
  'ACHIEVEMENTS',
  'HEALTH_WELLNESS',
  'OTHER',
]);

// Valid mood types - accepting any string for flexibility
const MoodType = z.string().optional().nullable();

// Create experience validation schema
const createExperienceSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    content: z.string()
      .min(1, 'Content is required')
      .max(10000, 'Content cannot exceed 10000 characters')
      .trim(),
    category: ExperienceCategory,
    date: z.string()
      .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
      .or(z.date())
      .optional(),
    location: z.string()
      .max(200, 'Location cannot exceed 200 characters')
      .trim()
      .optional()
      .nullable(),
    tags: z.array(z.string().trim())
      .max(20, 'Cannot have more than 20 tags')
      .optional()
      .default([]),
    mood: MoodType,
    isPublic: z.boolean()
      .default(false),
  }),
});

// Update experience validation schema
const updateExperienceSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Invalid experience ID format'),
  }),
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim()
      .optional(),
    content: z.string()
      .min(1, 'Content cannot be empty')
      .max(10000, 'Content cannot exceed 10000 characters')
      .trim()
      .optional(),
    category: ExperienceCategory.optional(),
    date: z.string()
      .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
      .or(z.date())
      .optional(),
    location: z.string()
      .max(200, 'Location cannot exceed 200 characters')
      .trim()
      .optional()
      .nullable(),
    tags: z.array(z.string().trim())
      .max(20, 'Cannot have more than 20 tags')
      .optional(),
    mood: MoodType,
    isPublic: z.boolean().optional(),
  }),
});

// Get single experience validation schema
const getExperienceSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Invalid experience ID format'),
  }),
});

// Delete experience validation schema
const deleteExperienceSchema = z.object({
  params: z.object({
    id: z.string()
      .min(1, 'Invalid experience ID format'),
  }),
});

// Query experiences validation schema
const queryExperiencesSchema = z.object({
  query: z.object({
    category: ExperienceCategory.optional(),
    mood: MoodType.optional(),
    startDate: z.string()
      .datetime({ message: 'Invalid start date format' })
      .optional(),
    endDate: z.string()
      .datetime({ message: 'Invalid end date format' })
      .optional(),
    search: z.string()
      .max(100, 'Search query too long')
      .trim()
      .optional(),
    tags: z.string()
      .transform(val => val.split(',').map(t => t.trim()))
      .optional(),
    isPrivate: z.string()
      .transform(val => val === 'true')
      .optional(),
    page: z.string()
      .transform(Number)
      .pipe(z.number().min(1))
      .optional()
      .default('1'),
    limit: z.string()
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .optional()
      .default('10'),
    sortBy: z.enum(['date', 'createdAt', 'title'])
      .optional()
      .default('date'),
    sortOrder: z.enum(['asc', 'desc'])
      .optional()
      .default('desc'),
  }),
});

export {
  createExperienceSchema,
  updateExperienceSchema,
  getExperienceSchema,
  deleteExperienceSchema,
  queryExperiencesSchema,
  ExperienceCategory,
  MoodType,
};
