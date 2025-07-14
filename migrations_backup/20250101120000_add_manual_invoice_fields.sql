-- Add manual invoice fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS manual_description TEXT,
ADD COLUMN IF NOT EXISTS manual_service TEXT,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Add comment to describe the purpose of these fields
COMMENT ON COLUMN invoices.manual_description IS 'Additional details for manually created invoices';
COMMENT ON COLUMN invoices.manual_service IS 'Service description for manually created invoices';
COMMENT ON COLUMN invoices.customer_name IS 'Customer name for manual invoices (when no customer_id)';
COMMENT ON COLUMN invoices.customer_email IS 'Customer email for manual invoices (when no customer_id)';
COMMENT ON COLUMN invoices.customer_address IS 'Customer address for manual invoices (when no customer_id)'; 