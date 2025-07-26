const fs = require('fs');
const path = require('path');

// Create a minimal test image (1x1 pixel PNG)
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
  0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
  0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

async function testGalleryUpload() {
  try {
    console.log('Testing gallery upload API...');
    
    // Create FormData-like object for testing
    const formData = new FormData();
    
    // Create a File object from the buffer
    const beforeImage = new File([minimalPNG], 'test-before.png', { type: 'image/png' });
    const afterImage = new File([minimalPNG], 'test-after.png', { type: 'image/png' });
    
    formData.append('beforeImage', beforeImage);
    formData.append('afterImage', afterImage);
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/gallery/upload-images', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Gallery upload test successful!');
      console.log('Before URL:', result.beforeUrl);
      console.log('After URL:', result.afterUrl);
    } else {
      console.log('❌ Gallery upload test failed!');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Note: This test requires the development server to be running
console.log('Make sure your development server is running on http://localhost:3000');
console.log('Then run this test...');

// Uncomment the line below to run the test
// testGalleryUpload(); 