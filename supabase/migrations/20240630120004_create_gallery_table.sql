-- Create gallery_items table
CREATE TABLE gallery_items (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  project_type TEXT, -- e.g., "Bathroom", "Kitchen", "Leak Repair"
  location TEXT, -- e.g., "Clapham", "Battersea"
  completion_date DATE,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on gallery_items" ON gallery_items FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_gallery_items_updated_at 
  BEFORE UPDATE ON gallery_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 