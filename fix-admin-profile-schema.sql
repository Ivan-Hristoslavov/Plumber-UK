-- Fix Admin Profile Schema - Добавяне на липсващи колони
-- Изпълни това в Supabase Dashboard → SQL Editor

-- Добавяне на липсващи колони в admin_profile
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS years_of_experience TEXT DEFAULT '10+';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS specializations TEXT DEFAULT 'Emergency repairs, Boiler installations, Bathroom plumbing';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS certifications TEXT DEFAULT 'Gas Safe Registered, City & Guilds Level 3';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS service_areas TEXT DEFAULT 'Clapham, Balham, Chelsea, Wandsworth, Battersea';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '45 minutes';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- Обновяване на съществуващия запис с default стойности
UPDATE admin_profile 
SET 
  years_of_experience = COALESCE(years_of_experience, '10+'),
  specializations = COALESCE(specializations, 'Emergency repairs, Boiler installations, Bathroom plumbing'),
  certifications = COALESCE(certifications, 'Gas Safe Registered, City & Guilds Level 3'),
  service_areas = COALESCE(service_areas, 'Clapham, Balham, Chelsea, Wandsworth, Battersea'),
  response_time = COALESCE(response_time, '45 minutes');

-- Почистване на дублиращи се admin_settings записи
-- Първо запазваме само най-новите записи за всеки ключ
DELETE FROM admin_settings 
WHERE id NOT IN (
    SELECT DISTINCT ON (key) id 
    FROM admin_settings 
    ORDER BY key, created_at DESC
);

-- Проверяваме дали имаме нужните основни настройки
INSERT INTO admin_settings (key, value) VALUES
    ('dayOffSettings', '{"enabled": false, "message": "We are currently closed for maintenance", "showBanner": false, "startDate": "", "endDate": ""}'),
    ('businessHours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "08:00", "close": "18:00"}}'),
    ('companyInfo', '{"name": "FixMyLeak", "address": "London, UK", "phone": "+44 7700 123456", "email": "info@fixmyleak.com", "website": "https://fixmyleak.com"}'),
    ('googleCalendarIntegration', '{"enabled": false, "calendarId": "", "clientId": "", "clientSecret": ""}'),
    ('vatSettings', '{"enabled": true, "rate": 20.0, "registrationNumber": "GB123456789", "companyName": "FixMyLeak Ltd"}')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- Success message
SELECT 'Admin profile schema fixed and admin_settings cleaned up successfully!' as result; 