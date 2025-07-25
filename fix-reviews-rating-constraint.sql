-- Fix Reviews Rating Constraint
-- This script updates the reviews table to support ratings from 0 to 6

-- First, let's check the current constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND conname = 'reviews_rating_check';

-- Drop the existing constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Add the new constraint that supports 0-6 range
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 0 AND rating <= 6);

-- Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND conname = 'reviews_rating_check';

-- Test the constraint with valid values
INSERT INTO reviews (customer_name, rating, comment, is_approved) 
VALUES ('Test User', 6, 'Test review with rating 6', false)
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM reviews WHERE customer_name = 'Test User';

-- Show the updated table structure
\d reviews 