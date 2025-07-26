import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Upload before and after images for gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const beforeImage = formData.get('beforeImage') as File | null;
    const afterImage = formData.get('afterImage') as File | null;
    
    if (!beforeImage && !afterImage) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const results: { beforeUrl?: string; afterUrl?: string } = {};

    // Process before image
    if (beforeImage && beforeImage.size > 0) {
      // Validate file type
      if (!beforeImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "Before image must be an image file" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (beforeImage.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Before image must be under 10MB" },
          { status: 400 }
        );
      }

      const bytes = await beforeImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = beforeImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `before_${timestamp}_${originalName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filename, buffer, {
          contentType: beforeImage.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json(
          { error: "Failed to upload before image" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filename);

      results.beforeUrl = urlData.publicUrl;
    }

    // Process after image
    if (afterImage && afterImage.size > 0) {
      // Validate file type
      if (!afterImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "After image must be an image file" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit)
      if (afterImage.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "After image must be under 10MB" },
          { status: 400 }
        );
      }

      const bytes = await afterImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = afterImage.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `after_${timestamp}_${originalName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filename, buffer, {
          contentType: afterImage.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json(
          { error: "Failed to upload after image" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filename);

      results.afterUrl = urlData.publicUrl;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 