-- Fix company name in admin settings
-- Remove "Ltd" from businessName setting

UPDATE admin_settings 
SET value = '"FixMyLeak"'
WHERE key = 'businessName';

-- Also update the admin profile company_name to ensure consistency
UPDATE admin_profile 
SET company_name = 'FixMyLeak',
    updated_at = NOW()
WHERE company_name LIKE '%Ltd%' OR company_name LIKE '%Ivan%';

-- Check the current values
SELECT 'admin_profile' as table_name, company_name, name FROM admin_profile;

SELECT 'admin_settings' as table_name, key, value FROM admin_settings WHERE key = 'businessName'; 