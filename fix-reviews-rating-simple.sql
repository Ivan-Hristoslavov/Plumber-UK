-- Simple fix for reviews rating constraint
-- Run this script to update the database to support 0-6 ratings

-- Drop the existing constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Add the new constraint that supports 0-6 range
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 0 AND rating <= 6);

-- Verify the change
SELECT 'Reviews rating constraint updated successfully!' as status; 