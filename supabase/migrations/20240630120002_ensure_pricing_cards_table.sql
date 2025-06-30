-- Ensure pricing_cards table exists
CREATE TABLE IF NOT EXISTS pricing_cards (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  table_rows JSONB NOT NULL DEFAULT '[]',
  notes JSONB NOT NULL DEFAULT '[]',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pricing_cards'
  ) THEN
    ALTER TABLE pricing_cards ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all operations on pricing_cards" ON pricing_cards FOR ALL USING (true);
  END IF;
END $$;

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