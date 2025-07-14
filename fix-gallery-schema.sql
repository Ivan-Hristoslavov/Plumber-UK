-- Fix Gallery Schema - Ensure proper gallery table structure
-- Execute this in Supabase Dashboard → SQL Editor

-- 1. Check if gallery table exists and has correct structure
DO $$
BEGIN
    -- Update gallery table to use proper field names if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_items') THEN
        -- Rename gallery_items to gallery if it exists
        ALTER TABLE gallery_items RENAME TO gallery;
    END IF;
    
    -- Ensure gallery table has correct structure
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES gallery_sections(id) ON DELETE SET NULL;
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE;
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS before_image_url TEXT;
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS after_image_url TEXT;
    
    -- Drop old image_url column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery' AND column_name = 'image_url') THEN
        ALTER TABLE gallery DROP COLUMN image_url;
    END IF;
    
    -- Drop alt_text column if it exists (not needed for before/after gallery)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery' AND column_name = 'alt_text') THEN
        ALTER TABLE gallery DROP COLUMN alt_text;
    END IF;
    
    -- Add missing columns for gallery items
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS project_type VARCHAR(255);
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS location VARCHAR(255);
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS completion_date DATE;
    ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    
    -- Ensure gallery_sections table has correct structure
    ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE;
    ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
    
    -- Update existing records to have admin_id
    UPDATE gallery 
    SET admin_id = (SELECT id FROM admin_profile LIMIT 1)
    WHERE admin_id IS NULL;
    
    UPDATE gallery_sections 
    SET admin_id = (SELECT id FROM admin_profile LIMIT 1)
    WHERE admin_id IS NULL;
    
    -- Ensure proper constraints
    ALTER TABLE gallery ALTER COLUMN title SET NOT NULL;
    
END $$; 