/**
 * Image utility functions for handling various image formats including HEIC
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  convertedFile?: File;
  originalType: string;
  detectedType: string;
}

/**
 * Check if file is an image (including HEIC/HEIF)
 */
export function isImageFile(file: File): boolean {
  // Standard image types
  if (file.type.startsWith('image/')) {
    return true;
  }
  
  // Check file extension for HEIC/HEIF
  const fileName = file.name.toLowerCase();
  const heicExtensions = ['.heic', '.heif', '.heics', '.heifs'];
  
  return heicExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Get detected image type from file
 */
export function getImageType(file: File): string {
  // If browser recognizes the type
  if (file.type.startsWith('image/')) {
    return file.type;
  }
  
  // Check file extension for HEIC/HEIF
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.heic') || fileName.endsWith('.heics')) {
    return 'image/heic';
  }
  
  if (fileName.endsWith('.heif') || fileName.endsWith('.heifs')) {
    return 'image/heif';
  }
  
  // Unknown type
  return file.type || 'application/octet-stream';
}

/**
 * Validate image file with HEIC support
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): ImageValidationResult {
  const result: ImageValidationResult = {
    isValid: false,
    originalType: file.type,
    detectedType: getImageType(file)
  };
  
  // Check if it's an image file
  if (!isImageFile(file)) {
    result.error = `File "${file.name}" is not a supported image format. Supported formats: JPEG, PNG, WebP, GIF, HEIC, HEIF`;
    return result;
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    result.error = `File "${file.name}" is too large. Maximum size: ${maxSizeMB}MB`;
    return result;
  }
  
  // Check for empty file
  if (file.size === 0) {
    result.error = `File "${file.name}" is empty`;
    return result;
  }
  
  result.isValid = true;
  return result;
}

/**
 * Convert HEIC file to JPEG using heic2any library
 */
export async function convertHeicToJpeg(file: File): Promise<File | null> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('heic2any requires browser environment');
      return null;
    }
    
    console.log('Converting HEIC file to JPEG:', file.name);
    
    // Dynamic import to avoid server-side issues
    const heic2any = (await import('heic2any')).default;
    
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8
    }) as Blob; // Explicitly type as Blob
    
    // Create new file with converted data
    const convertedFile = new File([convertedBlob], 
      file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
      { type: 'image/jpeg' }
    );
    
    console.log('HEIC conversion successful:', {
      original: file.name,
      converted: convertedFile.name,
      originalSize: file.size,
      convertedSize: convertedFile.size
    });
    
    return convertedFile;
  } catch (error) {
    console.error('Error converting HEIC to JPEG:', error);
    return null;
  }
}

/**
 * Process image file (convert HEIC if needed)
 */
export async function processImageFile(file: File, maxSizeMB: number = 10): Promise<{
  file: File;
  wasConverted: boolean;
  originalType: string;
  finalType: string;
}> {
  const validation = validateImageFile(file, maxSizeMB);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  let processedFile = file;
  let wasConverted = false;
  
  // Check if it's a HEIC file that needs conversion
  const fileName = file.name.toLowerCase();
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
  
  if (isHeic) {
    console.log('Detected HEIC file, attempting conversion:', file.name);
    const convertedFile = await convertHeicToJpeg(file);
    if (convertedFile) {
      processedFile = convertedFile;
      wasConverted = true;
    } else {
      console.warn('HEIC conversion failed, using original file:', file.name);
    }
  }
  
  return {
    file: processedFile,
    wasConverted,
    originalType: validation.originalType,
    finalType: processedFile.type
  };
}

/**
 * Get supported image formats for file input
 */
export function getSupportedImageFormats(): string {
  return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,.heic,.heif';
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsText(): string {
  return 'JPEG, PNG, WebP, GIF, HEIC, HEIF up to 10MB';
} 