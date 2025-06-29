import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'gallery');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists or couldn't be created
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
      const filePath = join(uploadsDir, filename);
      
      // Save file
      await writeFile(filePath, buffer);
      
      // Return public URL
      results.beforeUrl = `/uploads/gallery/${filename}`;
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
      const filePath = join(uploadsDir, filename);
      
      // Save file
      await writeFile(filePath, buffer);
      
      // Return public URL
      results.afterUrl = `/uploads/gallery/${filename}`;
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