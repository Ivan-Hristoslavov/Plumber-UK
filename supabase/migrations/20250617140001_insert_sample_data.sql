-- Insert sample customers
INSERT INTO customers (name, email, phone, address, customer_type) VALUES
('John Smith', 'john.smith@email.com', '+44 7700 900123', '123 Main Street, London, SW1A 1AA', 'individual'),
('Sarah Johnson', 'sarah.j@email.com', '+44 7700 900456', '456 Oak Avenue, Manchester, M1 1AA', 'individual'),
('Michael Brown', 'mike.brown@email.com', '+44 7700 900789', '789 Pine Road, Birmingham, B1 1AA', 'individual'),
('Emily White', 'emily.white@email.com', '+44 7700 900012', '321 Elm Street, Liverpool, L1 1AA', 'individual'),
('ABC Plumbing Ltd', 'contact@abcplumbing.co.uk', '+44 20 7946 0958', '100 Business Park, London, EC1A 1BB', 'company');

-- Update the last customer with company details
UPDATE customers 
SET 
  company_name = 'ABC Plumbing Ltd',
  vat_number = 'GB123456789',
  contact_person = 'David Wilson',
  contact_email = 'david@abcplumbing.co.uk',
  contact_phone = '+44 20 7946 0959'
WHERE email = 'contact@abcplumbing.co.uk';

-- Insert sample bookings
INSERT INTO bookings (customer_name, customer_email, customer_phone, service, date, time, status, payment_status, amount, address, notes, customer_id) VALUES
('John Smith', 'john.smith@email.com', '+44 7700 900123', 'Emergency Leak Repair', '2025-06-15', '10:00', 'completed', 'paid', 120.00, '123 Main Street, London, SW1A 1AA', 'Fixed kitchen sink leak', (SELECT id FROM customers WHERE email = 'john.smith@email.com')),
('Sarah Johnson', 'sarah.j@email.com', '+44 7700 900456', 'Bathroom Installation', '2025-06-14', '14:00', 'completed', 'paid', 520.00, '456 Oak Avenue, Manchester, M1 1AA', 'Full bathroom renovation', (SELECT id FROM customers WHERE email = 'sarah.j@email.com')),
('Michael Brown', 'mike.brown@email.com', '+44 7700 900789', 'Boiler Service', '2025-06-13', '09:00', 'completed', 'paid', 85.00, '789 Pine Road, Birmingham, B1 1AA', 'Annual boiler maintenance', (SELECT id FROM customers WHERE email = 'mike.brown@email.com')),
('Emily White', 'emily.white@email.com', '+44 7700 900012', 'Pipe Replacement', '2025-06-12', '16:00', 'scheduled', 'pending', 180.00, '321 Elm Street, Liverpool, L1 1AA', 'Replace old copper pipes', (SELECT id FROM customers WHERE email = 'emily.white@email.com'));

-- Update existing bookings to link with customers (this will be empty now since we create them above)
UPDATE bookings 
SET customer_id = (SELECT id FROM customers WHERE email = 'john.smith@email.com')
WHERE customer_email = 'john.smith@email.com' AND customer_id IS NULL;

-- Insert sample payments
INSERT INTO payments (booking_id, customer_id, amount, payment_method, payment_status, payment_date, reference) 
SELECT 
  b.id,
  b.customer_id,
  b.amount,
  CASE 
    WHEN b.customer_name = 'John Smith' THEN 'card'
    WHEN b.customer_name = 'Michael Brown' THEN 'cash'
    ELSE 'bank_transfer'
  END,
  CASE 
    WHEN b.payment_status = 'paid' THEN 'paid'
    ELSE 'pending'
  END,
  b.date,
  CASE 
    WHEN b.customer_name = 'John Smith' THEN 'CARD-2024-001'
    WHEN b.customer_name = 'Michael Brown' THEN 'CASH-2024-001'
    ELSE 'BACS-2024-001'
  END
FROM bookings b
WHERE b.customer_id IS NOT NULL;

-- Insert sample invoices
INSERT INTO invoices (
  booking_id, 
  customer_id, 
  invoice_number, 
  invoice_date, 
  due_date,
  subtotal, 
  vat_rate, 
  vat_amount, 
  total_amount,
  status,
  company_name,
  company_address,
  company_phone,
  company_email,
  company_vat_number
)
SELECT 
  b.id,
  b.customer_id,
  'IVN-' || LPAD(ROW_NUMBER() OVER (ORDER BY b.created_at)::TEXT, 4, '0'),
  b.date,
  b.date + INTERVAL '30 days',
  ROUND(b.amount / 1.2, 2),
  20.00,
  ROUND(b.amount - (b.amount / 1.2), 2),
  b.amount,
  CASE 
    WHEN b.payment_status = 'paid' THEN 'paid'
    ELSE 'sent'
  END,
  'FixMyLeak Ltd',
  'London, UK',
  '+44 7700 123456',
  'admin@fixmyleak.com',
  'GB987654321'
FROM bookings b
WHERE b.customer_id IS NOT NULL;

-- Insert sample day off periods
INSERT INTO day_off_periods (title, description, start_date, end_date, show_banner, banner_message) VALUES
('Christmas Break', 'Annual Christmas holiday period', '2024-12-23', '2024-12-27', true, 'We are closed for Christmas. Emergency services available on call.'),
('Summer Holiday', 'Annual summer vacation', '2024-08-15', '2024-08-25', true, 'Closed for summer holidays. Back on 26th August.');

-- Update invoice sent dates for paid invoices
UPDATE invoices 
SET sent_date = invoice_date + INTERVAL '1 day',
    paid_date = CASE WHEN status = 'paid' THEN invoice_date + INTERVAL '7 days' ELSE NULL END
WHERE status IN ('sent', 'paid'); 