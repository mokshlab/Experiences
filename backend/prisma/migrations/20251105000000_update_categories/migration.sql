-- Step 1: Create new enum type with updated values
CREATE TYPE "Category_new" AS ENUM (
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
  'OTHER'
);

-- Step 2: Add temporary column with new enum type
ALTER TABLE "experiences" ADD COLUMN "category_new" "Category_new";

-- Step 3: Migrate data with category mapping
UPDATE "experiences" SET "category_new" = 
  CASE "category"::text
    WHEN 'NEW_DAY' THEN 'SOMETHING_NEW'::"Category_new"
    WHEN 'ADVENTURE' THEN 'TRAVEL_ADVENTURE'::"Category_new"
    WHEN 'NATURE' THEN 'NATURE_OUTDOORS'::"Category_new"
    WHEN 'WORK' THEN 'WORK_CAREER'::"Category_new"
    WHEN 'HEALTH' THEN 'HEALTH_WELLNESS'::"Category_new"
    WHEN 'FOOD' THEN 'HOBBIES'::"Category_new"
    WHEN 'ENTERTAINMENT' THEN 'HOBBIES'::"Category_new"
    WHEN 'MEMORIES' THEN 'DAILY_JOURNAL'::"Category_new"
    WHEN 'SOCIAL_EVENTS' THEN 'RELATIONSHIPS'::"Category_new"
    WHEN 'CREATIVE' THEN 'HOBBIES'::"Category_new"
    WHEN 'TECHNOLOGY' THEN 'HOBBIES'::"Category_new"
    ELSE "category"::text::"Category_new"
  END;

-- Step 4: Drop old category column
ALTER TABLE "experiences" DROP COLUMN "category";

-- Step 5: Rename new column to category
ALTER TABLE "experiences" RENAME COLUMN "category_new" TO "category";

-- Step 6: Drop old enum type
DROP TYPE "Category";

-- Step 7: Rename new enum type
ALTER TYPE "Category_new" RENAME TO "Category";

-- Step 8: Set NOT NULL constraint
ALTER TABLE "experiences" ALTER COLUMN "category" SET NOT NULL;

