-- Add table_headers column to pricing_cards table
ALTER TABLE pricing_cards ADD COLUMN IF NOT EXISTS table_headers JSONB NOT NULL DEFAULT '["Column 1", "Column 2", "Column 3"]'; 