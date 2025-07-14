-- Fix Remaining Issues - Коригиране на всички останали проблеми
-- Изпълни това в Supabase Dashboard → SQL Editor

-- 1. Добавяне на admin_id колони в gallery таблиците (ако липсват)
ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE;

-- 2. Обновяване на съществуващи записи с admin_id
UPDATE gallery_sections 
SET admin_id = (SELECT id FROM admin_profile LIMIT 1)
WHERE admin_id IS NULL;

UPDATE gallery 
SET admin_id = (SELECT id FROM admin_profile LIMIT 1)
WHERE admin_id IS NULL;

-- 3. Почистване на дублиращи се admin_settings записи (ако все още има)
DELETE FROM admin_settings 
WHERE id NOT IN (
    SELECT DISTINCT ON (key) id 
    FROM admin_settings 
    ORDER BY key, created_at DESC
);

-- 4. Добавяне/обновяване на основни настройки
INSERT INTO admin_settings (key, value) VALUES
    ('businessPhone', '"+44 7700 123456"'),
    ('businessEmail', '"hristoslavov.ivanov@gmail.com"'),
    ('businessName', '"FixMyLeak Ltd"'),
    ('businessAddress', '"123 Plumbing Street, London, SW1A 1AA"'),
    ('businessCity', '"London"'),
    ('businessPostcode', '"SW1A 1AA"'),
    ('vatNumber', '"GB123456789"'),
    ('registrationNumber', '"12345678"'),
    ('emergencyRate', '"150"'),
    ('standardRate', '"75"'),
    ('workingHoursStart', '"08:00"'),
    ('workingHoursEnd', '"18:00"'),
    ('workingDays', '["monday","tuesday","wednesday","thursday","friday"]'),
    ('dayOffEnabled', 'false'),
    ('dayOffMessage', '"Limited service hours today. Emergency services available 24/7."'),
    ('dayOffStartDate', '""'),
    ('dayOffEndDate', '""'),
    ('emailNotifications', 'true'),
    ('smsNotifications', 'false'),
    ('autoConfirmBookings', 'false'),
    ('vatEnabled', 'false'),
    ('vatRate', '20'),
    ('vatCompanyName', '""'),
    ('dayOffSettings', '{"enabled": false, "message": "We are currently closed for maintenance", "showBanner": false, "startDate": "", "endDate": ""}'),
    ('businessHours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "08:00", "close": "18:00"}}'),
    ('companyInfo', '{"name": "FixMyLeak", "address": "London, UK", "phone": "+44 7700 123456", "email": "info@fixmyleak.com", "website": "https://fixmyleak.com"}'),
    ('googleCalendarIntegration', '{"enabled": false, "calendarId": "", "clientId": "", "clientSecret": ""}'),
    ('vatSettings', '{"enabled": false, "rate": 20.0, "registrationNumber": "GB123456789", "companyName": "FixMyLeak Ltd"}')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- 5. Обновяване на admin_profile с правилни default стойности за terms и privacy
UPDATE admin_profile 
SET 
    terms_and_conditions = COALESCE(terms_and_conditions, 'Our standard terms and conditions apply. All work is guaranteed for 12 months.'),
    privacy_policy = COALESCE(privacy_policy, 'We respect your privacy and handle your data in accordance with GDPR regulations.')
WHERE terms_and_conditions IS NULL OR privacy_policy IS NULL;

-- Success message
SELECT 'All remaining issues fixed successfully!' as result; 