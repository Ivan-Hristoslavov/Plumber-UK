-- Insert sample gallery sections
INSERT INTO gallery_sections (admin_id, name, description, color, "order", is_active) 
SELECT 
  id,
  'Bathroom Renovation',
  'Complete bathroom transformations and renovations',
  '#3B82F6',
  1,
  true
FROM admin_profile 
LIMIT 1;

INSERT INTO gallery_sections (admin_id, name, description, color, "order", is_active) 
SELECT 
  id,
  'Leak Repair',
  'Emergency leak repairs and water damage restoration',
  '#EF4444',
  2,
  true
FROM admin_profile 
LIMIT 1;

INSERT INTO gallery_sections (admin_id, name, description, color, "order", is_active) 
SELECT 
  id,
  'Kitchen Plumbing',
  'Kitchen installations and plumbing upgrades',
  '#10B981',
  3,
  true
FROM admin_profile 
LIMIT 1;

INSERT INTO gallery_sections (admin_id, name, description, color, "order", is_active) 
SELECT 
  id,
  'Boiler Installation',
  'Boiler installations and heating system upgrades',
  '#F59E0B',
  4,
  true
FROM admin_profile 
LIMIT 1; 