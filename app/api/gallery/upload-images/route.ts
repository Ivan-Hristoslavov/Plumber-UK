import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// POST - Upload before and after images for gallery
export async function POST(request: NextRequest) {
  try {
    console.log('Gallery upload API called');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Missing');
    
    // Check if environment variables are properly set
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: "Server configuration error - missing environment variables" },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    
    const beforeImage = formData.get('beforeImage') as File | null;
    const afterImage = formData.get('afterImage') as File | null;
    
    console.log('Form data received:', {
      beforeImage: beforeImage ? { name: beforeImage.name, size: beforeImage.size, type: beforeImage.type } : null,
      afterImage: afterImage ? { name: afterImage.name, size: afterImage.size, type: afterImage.type } : null
    });
    
    if (!beforeImage && !afterImage) {
      console.log('No images provided');
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const results: { beforeUrl?: string; afterUrl?: string } = {};

    // Process before image
    if (beforeImage && beforeImage.size > 0) {
      console.log('Processing before image:', beforeImage.name);
      
      // Validate file type
      if (!beforeImage.type.startsWith('image/')) {
        console.log('Invalid before image type:', beforeImage.type);
        return NextResponse.json(
          { error: "Before image must be an image file" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (beforeImage.size > 10 * 1024 * 1024) {
        console.log('Before image too large:', beforeImage.size);
        return NextResponse.json(
          { error: "Before image must be under 10MB" },
          { status: 400 }
        );
      }

      try {
        const bytes = await beforeImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = beforeImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `before_${timestamp}_${originalName}`;
        
        console.log('Uploading before image as:', filename);
        
        // Test bucket access first
        const { data: bucketTest, error: bucketError } = await supabase.storage
          .from('gallery')
          .list('', { limit: 1 });
        
        if (bucketError) {
          console.error('Bucket access test failed:', bucketError);
          return NextResponse.json(
            { error: `Storage bucket access error: ${bucketError.message}` },
            { status: 500 }
          );
        }
        
        console.log('Bucket access test successful');
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('gallery')
          .upload(filename, buffer, {
            contentType: beforeImage.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error for before image:', error);
          return NextResponse.json(
            { error: `Failed to upload before image: ${error.message}` },
            { status: 500 }
          );
        }

        console.log('Before image uploaded successfully:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filename);

        results.beforeUrl = urlData.publicUrl;
        console.log('Before image URL:', results.beforeUrl);
      } catch (uploadError) {
        console.error('Error processing before image:', uploadError);
        return NextResponse.json(
          { error: `Failed to process before image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Process after image
    if (afterImage && afterImage.size > 0) {
      console.log('Processing after image:', afterImage.name);
      
      // Validate file type
      if (!afterImage.type.startsWith('image/')) {
        console.log('Invalid after image type:', afterImage.type);
        return NextResponse.json(
          { error: "After image must be an image file" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (afterImage.size > 10 * 1024 * 1024) {
        console.log('After image too large:', afterImage.size);
        return NextResponse.json(
          { error: "After image must be under 10MB" },
          { status: 400 }
        );
      }

      try {
        const bytes = await afterImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = afterImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `after_${timestamp}_${originalName}`;
        
        console.log('Uploading after image as:', filename);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('gallery')
          .upload(filename, buffer, {
            contentType: afterImage.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error for after image:', error);
          return NextResponse.json(
            { error: `Failed to upload after image: ${error.message}` },
            { status: 500 }
          );
        }

        console.log('After image uploaded successfully:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filename);

        results.afterUrl = urlData.publicUrl;
        console.log('After image URL:', results.afterUrl);
      } catch (uploadError) {
        console.error('Error processing after image:', uploadError);
        return NextResponse.json(
          { error: `Failed to process after image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    console.log('Upload completed successfully:', results);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 