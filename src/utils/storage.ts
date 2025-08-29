import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

// NOTE: Bucket creation and RLS policies are handled through database migrations
// See drizzle/migrations/0006_storage_rls_policies.sql

// Upload image to Supabase storage
export const uploadImage = createServerFn({ method: "POST" })
  .validator((d: { 
    base64: string; 
    fileName: string; 
    mimeType: string 
  }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      throw new Error("User not authenticated");
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(data.base64, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fullFileName = `${userData.user.id}/${timestamp}-${data.fileName}`;
    
    // Upload to storage
    const { error } = await supabase.storage
      .from("post-images")
      .upload(fullFileName, buffer, {
        contentType: data.mimeType,
        cacheControl: "3600",
        upsert: false
      });
      
    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fullFileName);
      
    return { publicUrl: publicUrlData.publicUrl };
  });

// Delete image from Supabase storage
export const deleteImage = createServerFn({ method: "POST" })
  .validator((d: { imagePath: string; bucketName: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.storage
      .from(data.bucketName)
      .remove([data.imagePath]);

    if (error) {
      console.error("Error deleting image:", error);
      throw new Error("Error deleting image");
    }

    return { message: "Image deleted successfully" };
  });

// Get public URL for an image path
export const getImageUrl = (imagePath: string, bucketName: string): string => {
  if (!imagePath) return "";

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Otherwise construct the public URL
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
};

// Extract image path from full URL for storage operations
export const extractImagePath = (
  imageUrl: string,
  bucketName: string
): string => {
  if (!imageUrl) return "";

  if (imageUrl.includes(`/storage/v1/object/public/${bucketName}/`)) {
    return imageUrl.split(`/storage/v1/object/public/${bucketName}/`)[1];
  }

  return imageUrl; // Assume it's already a path
};
