const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndCreateStorageBucket() {
  try {
    console.log('Checking storage buckets...');
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', buckets.map(b => b.name));
    
    // Check if gallery bucket exists
    const galleryBucket = buckets.find(b => b.name === 'gallery');
    
    if (!galleryBucket) {
      console.log('Gallery bucket not found. Creating...');
      
      const { data, error } = await supabase.storage.createBucket('gallery', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('Error creating gallery bucket:', error);
        return;
      }
      
      console.log('Gallery bucket created successfully:', data);
    } else {
      console.log('Gallery bucket already exists');
    }
    
    // Test upload permissions with a minimal image (1x1 pixel PNG)
    console.log('Testing upload permissions...');
    const minimalPNG = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload('test.png', minimalPNG, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload test failed:', uploadError);
    } else {
      console.log('Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('gallery')
        .remove(['test.png']);
      
      if (deleteError) {
        console.error('Error cleaning up test file:', deleteError);
      } else {
        console.log('Test file cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndCreateStorageBucket(); 