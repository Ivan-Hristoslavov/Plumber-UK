-- Insert sample admin settings including working hours
INSERT INTO admin_settings (key, value) VALUES
('workingHoursStart', '"08:00"'),
('workingHoursEnd', '"18:00"'),
('workingDays', '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]'),
('emergencyRate', '"150"'),
('standardRate', '"75"'),
('businessName', '"Fix My Leak"'),
('businessEmail', '"info@fixmyleak.com"'),
('businessPhone', '"+44 7541777225"'),
('businessAddress', '"London, UK"')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value; 