import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

export async function uploadAvatar(file: File, userId: string) {
  try {
    // Create a canvas to manually resize the image
    const img = new Image();
    const loadImage = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
    
    await loadImage;
    
    // Calculate new dimensions (max 400px in any direction)
    const maxSize = 400;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = Math.round(height * (maxSize / width));
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = Math.round(width * (maxSize / height));
        height = maxSize;
      }
    }
    
    // Draw smaller version on canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to blob with low quality to ensure it's under 100KB
    const resizedImage = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.5);
    });
    
    console.log(`Resized image size: ${(resizedImage.size / 1024).toFixed(2)} KB`);
    
    // Delete all existing files in the user's folder first
    // Create a policy to allow DELETE operations if you don't have one
    try {
      const { data: existingFiles } = await supabase.storage
        .from('peakly')
        .list(userId);
        
      if (existingFiles?.length) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage
          .from('peakly')
          .remove(filesToDelete);
      }
    } catch (deleteError) {
      console.error('Error deleting existing files:', deleteError);
      // Continue with upload even if delete fails
    }
    
    // Upload the new image with a consistent name
    const fileName = `${userId}.jpg`;  // Always use jpg for consistency
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('peakly')
      .upload(filePath, resizedImage);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL with a cache buster to prevent browser caching
    const timestamp = new Date().getTime();
    const { data: { publicUrl } } = supabase.storage
      .from('peakly')
      .getPublicUrl(`${filePath}?t=${timestamp}`);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}