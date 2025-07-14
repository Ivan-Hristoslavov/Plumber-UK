-- Insert sample pricing cards for testing
DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Get the admin profile ID
    SELECT id INTO admin_uuid FROM admin_profile LIMIT 1;
    
    -- If admin_profile doesn't exist, create one
    IF admin_uuid IS NULL THEN
        INSERT INTO admin_profile (name, email, phone, company_name, company_address, gas_safe_number) 
        VALUES ('Plamen Zhelev', 'admin@fixmyleak.com', '+44 7700 123456', 'FixMyLeak Ltd', 'London, UK', 'GS123456')
        RETURNING id INTO admin_uuid;
    END IF;
    
    -- Add table_headers column if it doesn't exist
    ALTER TABLE pricing_cards ADD COLUMN IF NOT EXISTS table_headers JSONB NOT NULL DEFAULT '["Service", "Price", "Duration"]';
    
    -- Insert sample pricing cards
    INSERT INTO pricing_cards (admin_id, title, subtitle, table_headers, table_rows, notes, "order") VALUES
    (admin_uuid, 'Emergency Call-Out', 'Urgent plumbing repairs - Available 24/7', 
     '["Service Type", "Call-out Fee", "Labour Rate"]'::jsonb,
     '[
       {"Service Type": "Emergency (24/7)", "Call-out Fee": "£120", "Labour Rate": "£80-£100/hr"},
       {"Service Type": "Same Day", "Call-out Fee": "£80", "Labour Rate": "£60-£80/hr"}
     ]'::jsonb,
     '[
       {"icon": "⚡", "text": "45-minute response guarantee", "color": "green"},
       {"icon": "🔧", "text": "Professional certified plumbers", "color": "blue"},
       {"icon": "💰", "text": "No hidden fees - transparent pricing", "color": "green"}
     ]'::jsonb,
     1),
     
    (admin_uuid, 'Standard Plumbing Services', 'Regular plumbing maintenance and repairs',
     '["Service", "Price Range", "Typical Duration"]'::jsonb,
     '[
       {"Service": "Leak Repair", "Price Range": "£60-£150", "Typical Duration": "1-2 hours"},
       {"Service": "Tap Installation", "Price Range": "£80-£120", "Typical Duration": "1 hour"},
       {"Service": "Toilet Repair", "Price Range": "£90-£180", "Typical Duration": "1-3 hours"},
       {"Service": "Drain Unblocking", "Price Range": "£100-£200", "Typical Duration": "1-2 hours"}
     ]'::jsonb,
     '[
       {"icon": "✓", "text": "Fixed-price quotes available", "color": "green"},
       {"icon": "🛠️", "text": "All parts and materials included", "color": "blue"},
       {"icon": "🕐", "text": "Flexible scheduling Mon-Sat", "color": "orange"}
     ]'::jsonb,
     2),
     
    (admin_uuid, 'Boiler & Heating Services', 'Central heating and boiler specialists',
     '["Service", "Starting From", "Notes"]'::jsonb,
     '[
       {"Service": "Boiler Service", "Starting From": "£120", "Notes": "Annual maintenance"},
       {"Service": "Boiler Repair", "Starting From": "£150", "Notes": "Diagnosis + repair"},
       {"Service": "New Boiler Install", "Starting From": "£2,500", "Notes": "Inc. removal of old"},
       {"Service": "Power Flush", "Starting From": "£400", "Notes": "Full system clean"}
     ]'::jsonb,
     '[
       {"icon": "🏠", "text": "Gas Safe registered engineers", "color": "green"},
       {"icon": "📋", "text": "Free quotes for installations", "color": "blue"},
       {"icon": "🔥", "text": "Emergency heating repairs", "color": "red"}
     ]'::jsonb,
     3);
     
END $$; 