import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

export async function uploadAvatar(file: File, userId: string) {
  try {
    // Compress image before upload
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Delete any existing avatar first
    const { data: existingFiles } = await supabase.storage
      .from('peakly')
      .list(userId);

    if (existingFiles?.length) {
      await supabase.storage
        .from('peakly')
        .remove(existingFiles.map(f => `${userId}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from('peakly')
      .upload(filePath, compressedFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('peakly')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}