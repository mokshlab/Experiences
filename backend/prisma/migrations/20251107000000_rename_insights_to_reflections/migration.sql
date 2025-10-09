-- AlterTable: Rename insights table to reflections
ALTER TABLE "insights" RENAME TO "reflections";

-- Update relation field names (Prisma will handle this automatically via the @map directive)
