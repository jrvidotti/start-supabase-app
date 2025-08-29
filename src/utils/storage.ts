import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

// NOTE: Bucket creation and RLS policies are handled through database migrations
// See drizzle/migrations/0006_storage_rls_policies.sql

// Note: Image upload is handled client-side in PostForm component
// The authentication context is managed through the authenticated supabase client

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
