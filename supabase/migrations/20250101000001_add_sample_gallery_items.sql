-- Add sample gallery items to make sections visible
INSERT INTO gallery_items (
  admin_id, 
  title, 
  description, 
  before_image_url, 
  after_image_url, 
  project_type, 
  location, 
  completion_date, 
  section_id, 
  "order", 
  is_featured
) 
SELECT 
  ap.id,
  'Emergency Leak Repair',
  'Fixed a major pipe leak in kitchen ceiling causing water damage. Replaced damaged pipes and restored ceiling.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
  'Emergency Repair',
  'Clapham, London',
  '2024-01-15',
  gs.id,
  1,
  true
FROM admin_profile ap, gallery_sections gs 
WHERE gs.name = 'Leak Repair'
LIMIT 1;

INSERT INTO gallery_items (
  admin_id, 
  title, 
  description, 
  before_image_url, 
  after_image_url, 
  project_type, 
  location, 
  completion_date, 
  section_id, 
  "order", 
  is_featured
) 
SELECT 
  ap.id,
  'Complete Bathroom Renovation',
  'Full bathroom renovation including new tiles, fixtures, and modern plumbing system.',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop',
  'Renovation',
  'Chelsea, London',
  '2024-02-20',
  gs.id,
  1,
  true
FROM admin_profile ap, gallery_sections gs 
WHERE gs.name = 'Bathroom Renovation'
LIMIT 1;

INSERT INTO gallery_items (
  admin_id, 
  title, 
  description, 
  before_image_url, 
  after_image_url, 
  project_type, 
  location, 
  completion_date, 
  section_id, 
  "order", 
  is_featured
) 
SELECT 
  ap.id,
  'Kitchen Sink Installation',
  'Installed new kitchen sink with modern faucet and improved drainage system.',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
  'Installation',
  'Battersea, London',
  '2024-03-10',
  gs.id,
  1,
  false
FROM admin_profile ap, gallery_sections gs 
WHERE gs.name = 'Kitchen Plumbing'
LIMIT 1;

INSERT INTO gallery_items (
  admin_id, 
  title, 
  description, 
  before_image_url, 
  after_image_url, 
  project_type, 
  location, 
  completion_date, 
  section_id, 
  "order", 
  is_featured
) 
SELECT 
  ap.id,
  'New Boiler Installation',
  'Replaced old boiler with energy-efficient modern system. Improved heating and hot water.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
  'Installation',
  'Wandsworth, London',
  '2024-03-25',
  gs.id,
  1,
  true
FROM admin_profile ap, gallery_sections gs 
WHERE gs.name = 'Boiler Installation'
LIMIT 1; 