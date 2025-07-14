-- Create FAQ table
CREATE TABLE faq_items (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on faq_items" ON faq_items FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_faq_items_updated_at 
  BEFORE UPDATE ON faq_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default FAQ items
INSERT INTO faq_items (admin_id, question, answer, "order") 
SELECT 
  id as admin_id,
  question,
  answer,
  row_number() OVER (ORDER BY question) as "order"
FROM admin_profile,
(VALUES 
  ('What areas do you cover in London?', 'We provide plumbing services across South West London, including Clapham, Balham, Chelsea, Battersea, Wandsworth, and Streatham. We aim to arrive within 45 minutes for emergency callouts in these areas.'),
  ('Are your plumbers qualified?', 'Yes, we are fully qualified and Gas Safe registered with over 10 years of experience. We maintain professional qualifications and have worked on high-end properties including Claridge''s Hotel in Mayfair.'),
  ('How quickly can you respond to emergencies?', 'We offer same-day emergency plumbing services with response times of up to 45 minutes for our main coverage areas in South West London. Available 24/7 for urgent plumbing issues.'),
  ('What are your payment terms?', 'We accept all major credit cards, bank transfers, and cash payments. We provide transparent pricing with no hidden costs - you pay exactly what we quote. Payment is due upon completion of work.'),
  ('Do you provide warranties on your work?', 'Yes, we provide comprehensive warranties on all our work. Parts come with manufacturer warranties, and our workmanship is guaranteed for 12 months.'),
  ('What services do you offer?', 'We offer a full range of plumbing services including emergency repairs, boiler installations, bathroom plumbing, leak detection, pipe repairs, and water regulations compliance.')
) AS faq_data(question, answer)
WHERE admin_profile.id IS NOT NULL
LIMIT 1; 