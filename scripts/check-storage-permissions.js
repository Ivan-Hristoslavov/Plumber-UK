const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStoragePermissions() {
  try {
    console.log('Checking storage permissions...');
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Check gallery bucket specifically
    const galleryBucket = buckets.find(b => b.name === 'gallery');
    
    if (galleryBucket) {
      console.log('Gallery bucket details:', {
        name: galleryBucket.name,
        public: galleryBucket.public,
        fileSizeLimit: galleryBucket.fileSizeLimit,
        allowedMimeTypes: galleryBucket.allowedMimeTypes
      });
      
      // Test bucket access
      const { data: files, error: filesError } = await supabase.storage
        .from('gallery')
        .list();
      
      if (filesError) {
        console.error('Error listing files in gallery bucket:', filesError);
      } else {
        console.log('Files in gallery bucket:', files?.length || 0);
      }
      
      // Test bucket policies
      console.log('Testing bucket policies...');
      
      // Try to get bucket info
      const { data: bucketInfo, error: bucketError } = await supabase.storage
        .from('gallery')
        .list('', { limit: 1 });
      
      if (bucketError) {
        console.error('Error accessing gallery bucket:', bucketError);
      } else {
        console.log('Gallery bucket is accessible');
      }
      
    } else {
      console.log('Gallery bucket not found');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkStoragePermissions(); 