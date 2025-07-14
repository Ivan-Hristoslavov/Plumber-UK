-- Add legal content columns to admin_profile table
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- Update existing admin profile with default legal content
UPDATE admin_profile 
SET 
  terms_and_conditions = COALESCE(terms_and_conditions, '# Terms and Conditions

Please update this content with your terms and conditions.

## 1. Introduction

These terms and conditions apply to your use of our plumbing services.

## 2. Services

We provide professional plumbing services including repairs, installations, and maintenance.

## 3. Contact

For questions about these terms, please contact us.'),
  privacy_policy = COALESCE(privacy_policy, '# Privacy Policy

Please update this content with your privacy policy.

## 1. Information We Collect

We collect information necessary to provide our plumbing services.

## 2. How We Use Information

We use your information to schedule appointments and provide services.

## 3. Contact

For questions about this privacy policy, please contact us.')
WHERE terms_and_conditions IS NULL OR privacy_policy IS NULL; 