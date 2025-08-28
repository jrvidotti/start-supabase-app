import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Post } from "~/db";
import { getSupabaseServerClient } from "~/utils/supabase";

export type PostType = Post;

export const fetchPost = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		console.info(`Fetching post with id ${postId}...`);
		const supabase = getSupabaseServerClient();

		const { data: post, error } = await supabase
			.from("posts")
			.select("*")
			.eq("id", postId)
			.single();

		if (error) {
			console.log("Error fetching post:", error);
			throw new Error("Error fetching post");
		}

		if (!post) {
			throw notFound();
		}

		return post;
	});

export const fetchMyPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data: userData } = await supabase.auth.getUser();

		const { data, error } = await supabase
			.from("posts")
			.select("*")
			.eq("user_id", userData?.user?.id)
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) {
			console.error("Error fetching posts:", error);
			throw new Error("Error fetching posts");
		}

		return data;
	},
);

export const fetchPublicPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("posts")
			.select("*")
			.eq("status", "published")
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) {
			console.error("Error fetching posts:", error);
			throw new Error("Error fetching posts");
		}

		return data;
	},
);

export const createPost = createServerFn({ method: "POST" })
	.validator((d: { title: string; body?: string; status?: string }) => d)
	.handler(async ({ data }) => {
		console.info("Creating new post...");
		const supabase = getSupabaseServerClient();
		const { data: userData } = await supabase.auth.getUser();

		const { data: newPost, error } = await supabase
			.from("posts")
			.insert({
				title: data.title,
				body: data.body,
				user_id: userData?.user?.id,
				status: data.status || "draft",
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating post:", error);
			throw new Error("Error creating post");
		}

		return newPost;
	});

export const updatePost = createServerFn({ method: "POST" })
	.validator(
		(d: { id: string; title?: string; body?: string; status?: string }) => d,
	)
	.handler(async ({ data }) => {
		console.info(`Updating post with id ${data.id}...`);
		const supabase = getSupabaseServerClient();

		const updateData: Record<string, string> = {
			updated_at: new Date().toISOString(),
		};

		if (data.title !== undefined) updateData.title = data.title;
		if (data.body !== undefined) updateData.body = data.body;
		if (data.status !== undefined) updateData.status = data.status;

		const { data: updatedPost, error } = await supabase
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

		return updatedPost;
	});

export const deletePost = createServerFn({ method: "POST" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		console.info(`Deleting post with id ${postId}...`);
		const supabase = getSupabaseServerClient();

		const { data: deletedPost, error } = await supabase
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

		return { success: true };
	});
