import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteImage, extractImagePath } from "~/utils/storage";
import { getSupabaseServerClient } from "~/utils/supabase";
import { Database } from "~/utils/supabase-types.gen";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostWithTags = Post & {
  tags: string[];
  posts_tags?: undefined;
};
type PostCreateWithTags = Database["public"]["Tables"]["posts"]["Insert"] & {
  tags?: string[];
};

const POSTS_BUCKET_NAME = "post-images";

export const fetchPost = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }): Promise<PostWithTags> => {
    console.info(`Fetching post with id ${postId}...`);
    if (process.env.NODE_ENV === "development") {
      console.info("fetchPost", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const supabase = getSupabaseServerClient();

    const { data: post, error } = await supabase
      .schema("public")
      .from("posts")
      .select(
        `
				*,
				posts_tags (
					tags (*)
				)
			`
      )
      .eq("id", postId)
      .single();

    if (error) {
      console.log("Error fetching post:", error);
      throw new Error("Error fetching post");
    }

    if (!post) {
      throw notFound();
    }

    return {
      ...post,
      posts_tags: undefined,
      tags: post.posts_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [],
    };
  });

export const fetchPublicPost = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }) => {
    console.info(`Fetching public post with id ${postId}...`);
    if (process.env.NODE_ENV === "development") {
      console.info("fetchPublicPost", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const supabase = getSupabaseServerClient();

    const { data: post, error } = await supabase
      .schema("public")
      .from("posts")
      .select(
        `
				*,
				posts_tags (
					tags (*)
				)
			`
      )
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (error) {
      console.log("Error fetching public post:", error);
      throw notFound();
    }

    if (!post) {
      throw notFound();
    }

    const tags =
      post.posts_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
    return { ...post, posts_tags: undefined, tags } as PostWithTags;
  });

export const fetchMyPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    if (process.env.NODE_ENV === "development") {
      console.info("fetchMyPosts", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      throw notFound();
    }

    const { data, error } = await supabase
      .schema("public")
      .from("posts")
      .select(
        `
				*,
				posts_tags (
					tags (*)
				)
			`
      )
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Error fetching posts");
    }

    return (
      data?.map((post) => ({
        ...post,
        posts_tags: undefined,
        tags: post.posts_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [],
      })) || ([] as PostWithTags[])
    );
  }
);

export const countMyPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    if (process.env.NODE_ENV === "development") {
      console.info("countMyPosts", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      throw notFound();
    }

    const { count, error } = await supabase
      .schema("public")
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Error counting posts:", error);
      throw new Error("Error counting posts");
    }

    return count || 0;
  }
);

export const fetchPublicPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    if (process.env.NODE_ENV === "development") {
      console.info("fetchPublicPosts", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .schema("public")
      .from("posts")
      .select(
        `
				*,
				posts_tags (
					tags (*)
				)
			`
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Error fetching posts");
    }

    return (
      data?.map((post) => ({
        ...post,
        tags:
          post.posts_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) ||
          [],
      })) || ([] as PostWithTags[])
    );
  }
);

export const createPost = createServerFn({ method: "POST" })
  .validator((d: PostCreateWithTags) => d)
  .handler(async ({ data }) => {
    if (process.env.NODE_ENV === "development") {
      console.info("createPost", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.info("Creating new post...");
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      throw notFound();
    }

    const { data: newPost, error } = await supabase
      .schema("public")
      .from("posts")
      .insert({
        title: data.title,
        body: data.body,
        user_id: userData.user.id,
        status: data.status || "draft",
        featured_image: data.featured_image,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      throw new Error("Error creating post");
    }

    if (data.tags && data.tags.length > 0) {
      const tagPromises = data.tags.map(async (tagName) => {
        const slug = tagName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const { data: existingTag } = await supabase
          .from("tags")
          .select("*")
          .eq("name", tagName.trim())
          .single();

        if (existingTag) {
          return existingTag;
        }

        const { data: newTag } = await supabase
          .schema("public")
          .from("tags")
          .insert({
            name: tagName.trim(),
            slug,
          })
          .select()
          .single();

        return newTag;
      });

      const tags = await Promise.all(tagPromises);

      if (tags.length > 0) {
        const postTagsToInsert = tags
          .filter((tag) => tag && tag.id)
          .map((tag) => ({
            post_id: newPost.id,
            tag_id: tag?.id || "",
          }));

        await supabase
          .schema("public")
          .from("posts_tags")
          .insert(postTagsToInsert);
      }
    }

    return newPost;
  });

export const updatePost = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      title?: string;
      body?: string;
      status?: string;
      tags?: string[];
      featured_image?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    if (process.env.NODE_ENV === "development") {
      console.info("updatePost", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.info(`Updating post with id ${data.id}...`);
    const supabase = getSupabaseServerClient();

    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured_image !== undefined)
      updateData.featured_image = data.featured_image;

    const { data: updatedPost, error } = await supabase
      .schema("public")
      .from("posts")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      throw new Error("Error updating post");
    }

    if (!updatedPost) {
      throw notFound();
    }

    if (data.tags !== undefined) {
      await supabase
        .schema("public")
        .from("posts_tags")
        .delete()
        .eq("post_id", data.id);

      if (data.tags.length > 0) {
        const tagPromises = data.tags.map(async (tagName) => {
          const slug = tagName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

          const { data: existingTag } = await supabase
            .schema("public")
            .from("tags")
            .select("*")
            .eq("name", tagName.trim())
            .single();

          if (existingTag) {
            return existingTag;
          }

          const { data: newTag } = await supabase
            .schema("public")
            .from("tags")
            .insert({
              name: tagName.trim(),
              slug,
            })
            .select()
            .single();

          return newTag;
        });

        const tags = await Promise.all(tagPromises);

        if (tags.length > 0) {
          const postTagsToInsert = tags
            .filter((tag) => tag && tag.id)
            .map((tag) => ({
              post_id: data.id,
              tag_id: tag?.id || "",
            }));

          await supabase
            .schema("public")
            .from("posts_tags")
            .insert(postTagsToInsert);
        }
      }
    }

    return updatedPost;
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }) => {
    console.info(`Deleting post with id ${postId}...`);

    if (process.env.NODE_ENV === "development") {
      console.info("deletePost", "development mode (2s delay)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const supabase = getSupabaseServerClient();

    // First get the post to check if it has an image
    const { data: existingPost } = await supabase
      .schema("public")
      .from("posts")
      .select("featured_image")
      .eq("id", postId)
      .single();

    const { data: deletedPost, error } = await supabase
      .schema("public")
      .from("posts")
      .delete()
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Error deleting post:", error);
      throw new Error("Error deleting post");
    }

    if (!deletedPost) {
      throw notFound();
    }

    // Delete associated image if exists
    if (existingPost?.featured_image) {
      try {
        const imagePath = extractImagePath(
          existingPost.featured_image,
          POSTS_BUCKET_NAME
        );
        await deleteImage({
          data: { imagePath, bucketName: POSTS_BUCKET_NAME },
        });
      } catch (imageError) {
        console.error("Error deleting associated image:", imageError);
        // Don't fail the post deletion if image deletion fails
      }
    }

    return { success: true };
  });
