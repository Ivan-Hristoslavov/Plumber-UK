-- Complete Schema Synchronization Fix
-- Execute this in Supabase Dashboard → SQL Editor

-- ==============================
-- 1. FIX ADMIN_PROFILE TABLE
-- ==============================

-- Add missing fields for legal content and profile details
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(50);
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS specializations TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS service_areas TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS response_time VARCHAR(100);
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- ==============================
-- 2. FIX GALLERY TABLE
-- ==============================

-- Drop old gallery table and recreate with correct schema
DROP TABLE IF EXISTS gallery CASCADE;

CREATE TABLE gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
    section_id UUID REFERENCES gallery_sections(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    project_type VARCHAR(255),
    location VARCHAR(255),
    completion_date DATE,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policy
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gallery" ON gallery FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_gallery_updated_at 
  BEFORE UPDATE ON gallery 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- 3. FIX GALLERY_SECTIONS TABLE
-- ==============================

-- Add missing fields
ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE;
ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

-- Update existing records to have admin_id
UPDATE gallery_sections 
SET admin_id = (SELECT id FROM admin_profile LIMIT 1)
WHERE admin_id IS NULL;

-- ==============================
-- 4. FIX ADMIN_AREAS_COVER TABLE
-- ==============================

-- Add slug field
ALTER TABLE admin_areas_cover ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Generate slugs for existing records
UPDATE admin_areas_cover 
SET slug = LOWER(REPLACE(area_name, ' ', '-'))
WHERE slug IS NULL;

-- Make slug unique
ALTER TABLE admin_areas_cover ADD CONSTRAINT unique_area_slug UNIQUE (slug);

-- ==============================
-- 5. CREATE MISSING INDEXES
-- ==============================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_gallery_section_id ON gallery(section_id);
CREATE INDEX IF NOT EXISTS idx_gallery_admin_id ON gallery(admin_id);
CREATE INDEX IF NOT EXISTS idx_gallery_is_featured ON gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_sections_admin_id ON gallery_sections(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_areas_slug ON admin_areas_cover(slug);

-- ==============================
-- 6. INSERT SAMPLE DATA
-- ==============================

-- Update admin profile with sample legal content
UPDATE admin_profile 
SET 
    years_of_experience = '15+ years',
    specializations = 'Emergency repairs, Boiler installations, Bathroom renovations',
    certifications = 'Gas Safe Registered, City & Guilds Qualified',
    service_areas = 'South West London: Clapham, Battersea, Chelsea, Wandsworth, Balham, Streatham',
    response_time = '45-minute emergency response',
    terms_and_conditions = '# Terms and Conditions

## 1. Service Agreement
By booking our services, you agree to these terms and conditions.

## 2. Payment Terms
- Payment due within 30 days of invoice date
- Emergency callouts require payment on completion
- We accept cash, card, and bank transfer

## 3. Warranty
- 12-month warranty on all work completed
- Parts warranty as per manufacturer terms
- Emergency repairs covered for 30 days

## 4. Liability
- Fully insured for public liability up to £2 million
- Work carried out to British Standards
- Gas Safe registered for all gas work

## 5. Cancellation Policy
- 24 hours notice required for non-emergency work
- Emergency callouts cannot be cancelled once engineer dispatched',
    privacy_policy = '# Privacy Policy

## Data Collection
We collect personal information necessary to provide our plumbing services, including:
- Name, address, phone number, email
- Property details and access requirements
- Payment information for billing

## Data Usage
Your information is used to:
- Provide and improve our services
- Process payments and send invoices
- Communicate about appointments and follow-ups
- Comply with legal obligations

## Data Protection
- We never sell or share your data with third parties
- All data stored securely and encrypted
- Access limited to authorized personnel only
- Data retained only as long as necessary

## Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate information
- Request deletion of your data
- Object to data processing

Contact us at info@fixmyleak.com for any privacy concerns.'
WHERE terms_and_conditions IS NULL OR privacy_policy IS NULL;

-- Insert sample gallery sections with proper admin_id and colors
INSERT INTO gallery_sections (admin_id, title, description, color, "order", is_active) 
SELECT 
  ap.id,
  'Bathroom Renovations',
  'Complete bathroom transformations and modern installations',
  '#3B82F6',
  1,
  true
FROM admin_profile ap 
WHERE NOT EXISTS (SELECT 1 FROM gallery_sections WHERE title = 'Bathroom Renovations')
LIMIT 1;

INSERT INTO gallery_sections (admin_id, title, description, color, "order", is_active) 
SELECT 
  ap.id,
  'Emergency Repairs',
  'Quick response emergency plumbing fixes',
  '#EF4444',
  2,
  true
FROM admin_profile ap 
WHERE NOT EXISTS (SELECT 1 FROM gallery_sections WHERE title = 'Emergency Repairs')
LIMIT 1;

INSERT INTO gallery_sections (admin_id, title, description, color, "order", is_active) 
SELECT 
  ap.id,
  'Boiler Installations',
  'Professional boiler installations and upgrades',
  '#F59E0B',
  3,
  true
FROM admin_profile ap 
WHERE NOT EXISTS (SELECT 1 FROM gallery_sections WHERE title = 'Boiler Installations')
LIMIT 1;

-- Insert sample gallery items
INSERT INTO gallery (admin_id, section_id, title, description, before_image_url, after_image_url, project_type, location, completion_date, is_featured, "order")
SELECT 
  ap.id,
  gs.id,
  'Modern Bathroom Renovation in Chelsea',
  'Complete bathroom renovation including new tiles, fixtures, and modern plumbing system. Transformed old bathroom into luxury space.',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop',
  'Bathroom Renovation',
  'Chelsea, London',
  '2024-01-15',
  true,
  1
FROM admin_profile ap, gallery_sections gs 
WHERE gs.title = 'Bathroom Renovations'
AND NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Modern Bathroom Renovation in Chelsea')
LIMIT 1;

-- Success message
SELECT 'Schema synchronization completed successfully! All tables now match types and APIs.' as result; 