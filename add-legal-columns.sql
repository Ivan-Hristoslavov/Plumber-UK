-- Add legal content columns to admin_profile table
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- Update existing admin profile with default legal content
UPDATE admin_profile 
SET 
  terms_and_conditions = COALESCE(terms_and_conditions, '# Terms and Conditions\n\nPlease update this content with your terms and conditions.'),
  privacy_policy = COALESCE(privacy_policy, '# Privacy Policy\n\nPlease update this content with your privacy policy.')
WHERE terms_and_conditions IS NULL OR privacy_policy IS NULL; 