import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const searchTags = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: searchTerm }) => {
    const supabase = getSupabaseServerClient();

    if (!searchTerm.trim()) {
      const { data, error } = await supabase
        .schema("public")
        .from("tags")
        .select("*")
        .order("name")
        .limit(100);

      if (error) {
        console.error("Error fetching tags:", error);
        throw new Error("Error fetching tags");
      }

      return data || [];
    }

    const { data, error } = await supabase
      .schema("public")
      .from("tags")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name")
      .limit(100);

    if (error) {
      console.error("Error searching tags:", error);
      throw new Error("Error searching tags");
    }

    return data || [];
  });

export const createTag = createServerFn({ method: "POST" })
  .validator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const slug = slugify(data.name);

    const { data: newTag, error } = await supabase
      .schema("public")
      .from("tags")
      .insert({
        name: data.name.trim(),
        slug,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A tag with this name already exists");
      }
      console.error("Error creating tag:", error);
      throw new Error("Error creating tag");
    }

    return newTag;
  });

export const getOrCreateTag = createServerFn({ method: "POST" })
  .validator((d: { name: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { data: existingTag, error: findError } = await supabase
      .schema("public")
      .from("tags")
      .select("*")
      .eq("name", data.name.trim())
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding tag:", findError);
      throw new Error("Error finding tag");
    }

    if (existingTag) {
      return existingTag;
    }

    const slug = slugify(data.name);
    const { data: newTag, error: createError } = await supabase
      .schema("public")
      .from("tags")
      .insert({
        name: data.name.trim(),
        slug,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating tag:", createError);
      throw new Error("Error creating tag");
    }

    return newTag;
  });

export const fetchAllTags = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .schema("public")
      .from("tags")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching all tags:", error);
      throw new Error("Error fetching tags");
    }

    return data || [];
  }
);

export const deleteTag = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: tagId }) => {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .schema("public")
      .from("tags")
      .delete()
      .eq("id", tagId);

    if (error) {
      console.error("Error deleting tag:", error);
      throw new Error("Error deleting tag");
    }

    return { success: true };
  });
