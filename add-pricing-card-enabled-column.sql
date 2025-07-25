-- Add is_enabled column to pricing_cards table
ALTER TABLE pricing_cards 
ADD COLUMN is_enabled BOOLEAN DEFAULT true;

-- Update existing pricing cards to be enabled by default
UPDATE pricing_cards 
SET is_enabled = true 
WHERE is_enabled IS NULL;

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_pricing_cards_updated_at'
  ) THEN
    CREATE TRIGGER update_pricing_cards_updated_at 
      BEFORE UPDATE ON pricing_cards 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 