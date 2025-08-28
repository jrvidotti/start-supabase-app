import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db, posts, type Post } from "~/db";
import { getSupabaseServerClient } from "~/utils/supabase";

export type PostType = Post;

export const fetchPost = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }) => {
    console.info(`Fetching post with id ${postId}...`);
    try {
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post) {
        throw notFound();
      }

      return post;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

export const fetchPosts = createServerFn({ method: "GET" }).handler(
  async ({ context }) => {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      throw new Error("Unauthorized: User not authenticated");
    }

    console.info("Fetching posts...");
    console.log("context", context);
    console.log("user", data.user);
    return await db.select().from(posts).orderBy(posts.createdAt).limit(10);
  }
);

export const createPost = createServerFn({ method: "POST" })
  .validator((d: { title: string; body?: string; userId?: string }) => d)
  .handler(async ({ data }) => {
    console.info("Creating new post...");
    const [newPost] = await db
      .insert(posts)
      .values({
        title: data.title,
        body: data.body,
        userId: data.userId,
      })
      .returning();

    return newPost;
  });

export const updatePost = createServerFn({ method: "POST" })
  .validator((d: { id: string; title?: string; body?: string }) => d)
  .handler(async ({ data }) => {
    console.info(`Updating post with id ${data.id}...`);
    const [updatedPost] = await db
      .update(posts)
      .set({
        title: data.title,
        body: data.body,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.id))
      .returning();

    if (!updatedPost) {
      throw notFound();
    }

    return updatedPost;
  });

export const deletePost = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }) => {
    console.info(`Deleting post with id ${postId}...`);
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, postId))
      .returning();

    if (!deletedPost) {
      throw notFound();
    }

    return { success: true };
  });
