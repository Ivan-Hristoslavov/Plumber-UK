-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 6),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: allow insert for all (public can submit)
CREATE POLICY "Allow insert for all" ON reviews FOR INSERT WITH CHECK (true);

-- Policy: allow select only approved for public
CREATE POLICY "Allow select approved" ON reviews FOR SELECT USING (is_approved);

-- Policy: allow all for admin (to be refined if needed)
CREATE POLICY "Allow all for admin" ON reviews FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 