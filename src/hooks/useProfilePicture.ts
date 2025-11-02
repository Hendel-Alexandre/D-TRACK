import { useState } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { toast } from 'sonner';

export function useProfilePicture() {
  const [uploading, setUploading] = useState(false);

  const uploadProfilePicture = async (file: File, userId: string) => {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return null;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed');
      return null;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting timestamp
      const timestamp = new Date().getTime();
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const cachedUrl = `${publicUrl}?t=${timestamp}`;

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: cachedUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully!');
      return cachedUrl;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async (userId: string) => {
    setUploading(true);

    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Profile picture removed');
      return true;
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      toast.error(error.message || 'Failed to delete profile picture');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfilePicture,
    deleteProfilePicture,
    uploading
  };
}
