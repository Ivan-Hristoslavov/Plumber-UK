-- Add image_attachments column to invoices table for storing attached images
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS image_attachments JSONB; 