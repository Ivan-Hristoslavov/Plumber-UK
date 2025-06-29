-- Insert sample customers
INSERT INTO customers (name, email, phone, address, customer_type) VALUES
('John Smith', 'john.smith@email.com', '+44 7700 900123', '123 High Street, London, SW1A 1AA', 'individual'),
('Sarah Johnson', 'sarah.johnson@email.com', '+44 7700 900456', '456 Oak Avenue, Chelsea, SW3 2BB', 'individual'),
('Michael Brown', 'michael.brown@email.com', '+44 7700 900789', '789 Pine Road, Wandsworth, SW18 3CC', 'individual'),
('ABC Plumbing Ltd', 'admin@abcplumbing.com', '+44 7700 900012', '321 Business Park, Clapham, SW4 4DD', 'company')
ON CONFLICT (email) DO NOTHING;

-- Insert sample bookings (linking to customers)
WITH customer_ids AS (
  SELECT id, email FROM customers WHERE email IN (
    'john.smith@email.com',
    'sarah.johnson@email.com', 
    'michael.brown@email.com',
    'admin@abcplumbing.com'
  )
)
INSERT INTO bookings (
  customer_id, 
  customer_name, 
  customer_email, 
  customer_phone, 
  service, 
  date, 
  time, 
  status, 
  payment_status, 
  amount, 
  address, 
  notes
) 
SELECT 
  c.id,
  'John Smith',
  'john.smith@email.com',
  '+44 7700 900123',
  'Emergency leak repair',
  DATE '2024-01-15',
  TIME '09:00',
  'completed',
  'paid',
  120.00,
  '123 High Street, London, SW1A 1AA',
  'Kitchen sink leak - urgent repair needed'
FROM customer_ids c WHERE c.email = 'john.smith@email.com'

UNION ALL

SELECT 
  c.id,
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '+44 7700 900456',
  'Boiler service and maintenance',
  DATE '2024-01-20',
  TIME '14:00',
  'completed',
  'pending',
  250.00,
  '456 Oak Avenue, Chelsea, SW3 2BB',
  'Annual boiler service'
FROM customer_ids c WHERE c.email = 'sarah.johnson@email.com'

UNION ALL

SELECT 
  c.id,
  'Michael Brown',
  'michael.brown@email.com',
  '+44 7700 900789',
  'Bathroom plumbing installation',
  DATE '2024-01-25',
  TIME '10:00',
  'completed',
  'paid',
  480.00,
  '789 Pine Road, Wandsworth, SW18 3CC',
  'New bathroom suite installation'
FROM customer_ids c WHERE c.email = 'michael.brown@email.com'

UNION ALL

SELECT 
  c.id,
  'ABC Plumbing Ltd',
  'admin@abcplumbing.com',
  '+44 7700 900012',
  'Commercial pipe repair',
  DATE '2024-01-30',
  TIME '08:00',
  'completed',
  'pending',
  680.00,
  '321 Business Park, Clapham, SW4 4DD',
  'Main water pipe repair for office building'
FROM customer_ids c WHERE c.email = 'admin@abcplumbing.com'

ON CONFLICT DO NOTHING; 