-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  icon TEXT NOT NULL,
  service_type TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON services 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default services
INSERT INTO services (admin_id, name, description, price, icon, service_type, "order") 
SELECT 
  ap.id as admin_id,
  sd.service_name,
  sd.service_description,
  sd.service_price,
  sd.service_icon,
  sd.service_type,
  sd.service_order
FROM admin_profile ap,
(VALUES 
  ('Call-out & Hourly Labour Rates', 'Flexible hourly bookings for urgent or short jobs. See pricing section for full details.', 'See table', '🔧', 'hourly', 1),
  ('Full-Day Booking Rates', 'Book a full day for larger or planned works. See pricing section for full details.', 'See table', '📅', 'daily', 2),
  ('Free Consultation', '10 minutes free consultation to discuss your plumbing needs', 'Free', '📞', 'consultation', 3)
) AS sd(service_name, service_description, service_price, service_icon, service_type, service_order)
WHERE ap.id IS NOT NULL
LIMIT 1; 