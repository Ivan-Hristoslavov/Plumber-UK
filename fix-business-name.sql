-- Fix business name inconsistency
-- Update admin_settings.businessName to match admin_profile.company_name

UPDATE admin_settings 
SET value = '"FixMyLeak"'
WHERE key = 'businessName';

-- Also update the vatSettings companyName if it exists
UPDATE admin_settings 
SET value = jsonb_set(value::jsonb, '{companyName}', '"FixMyLeak"')
WHERE key = 'vatSettings' AND value::jsonb ? 'companyName';

-- Update companyInfo setting if it exists
UPDATE admin_settings 
SET value = jsonb_set(value::jsonb, '{name}', '"FixMyLeak"')
WHERE key = 'companyInfo' AND value::jsonb ? 'name'; 