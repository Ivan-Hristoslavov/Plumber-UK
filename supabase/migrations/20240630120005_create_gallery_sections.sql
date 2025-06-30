-- Create gallery_sections table
CREATE TABLE gallery_sections (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Default blue color
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery_sections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on gallery_sections" ON gallery_sections FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_gallery_sections_updated_at 
  BEFORE UPDATE ON gallery_sections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add section_id to gallery_items table
ALTER TABLE gallery_items ADD COLUMN section_id INTEGER REFERENCES gallery_sections(id) ON DELETE SET NULL; 