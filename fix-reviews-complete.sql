-- Complete Fix for Reviews Rating System
-- This script ensures the reviews table supports 0-6 ratings

-- Step 1: Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'rating';

-- Step 2: Check current constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND conname LIKE '%rating%';

-- Step 3: Drop existing rating constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Step 4: Add new constraint for 0-6 range
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
CHECK (rating >= 0 AND rating <= 6);

-- Step 5: Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reviews'::regclass 
AND conname = 'reviews_rating_check';

-- Step 6: Test with valid ratings
DO $$
BEGIN
    -- Test rating 0
    INSERT INTO reviews (customer_name, rating, comment, is_approved) 
    VALUES ('Test User 0', 0, 'Test review with rating 0', false);
    
    -- Test rating 6
    INSERT INTO reviews (customer_name, rating, comment, is_approved) 
    VALUES ('Test User 6', 6, 'Test review with rating 6', false);
    
    RAISE NOTICE 'Test inserts successful - constraint is working correctly';
    
    -- Clean up test data
    DELETE FROM reviews WHERE customer_name IN ('Test User 0', 'Test User 6');
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Step 7: Show final table structure
SELECT 'Reviews table updated successfully!' as status; 