import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { Post, PostWithTags } from "~/db";
import { deletePostImage, extractImagePath } from "~/utils/storage";
import { getSupabaseServerClient } from "~/utils/supabase";

export type PostType = Post;

export const fetchPost = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		console.info(`Fetching post with id ${postId}...`);
		const supabase = getSupabaseServerClient();

		const { data: post, error } = await supabase
			.from("posts")
			.select(`
				*,
				posts_tags (
					tags (*)
				)
			`)
			.eq("id", postId)
			.single();

		if (error) {
			console.log("Error fetching post:", error);
			throw new Error("Error fetching post");
		}

		if (!post) {
			throw notFound();
		}

		const tags =
			post.posts_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
		return { ...post, tags } as PostWithTags;
	});

export const fetchPublicPost = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		console.info(`Fetching public post with id ${postId}...`);
		const supabase = getSupabaseServerClient();

		const { data: post, error } = await supabase
			.from("posts")
			.select(`
				*,
				posts_tags (
					tags (*)
				)
			`)
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
			post.posts_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
		return { ...post, tags } as PostWithTags;
	});

export const fetchMyPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data: userData } = await supabase.auth.getUser();

		const { data, error } = await supabase
			.from("posts")
			.select(`
				*,
				posts_tags (
					tags (*)
				)
			`)
			.eq("user_id", userData?.user?.id)
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) {
			console.error("Error fetching posts:", error);
			throw new Error("Error fetching posts");
		}

		return (
			data?.map((post) => ({
				...post,
				tags: post.posts_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],
			})) || ([] as PostWithTags[])
		);
	},
);

export const fetchPublicPosts = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("posts")
			.select(`
				*,
				posts_tags (
					tags (*)
				)
			`)
			.eq("status", "published")
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) {
			console.error("Error fetching posts:", error);
			throw new Error("Error fetching posts");
		}

		return (
			data?.map((post) => ({
				...post,
				tags: post.posts_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],
			})) || ([] as PostWithTags[])
		);
	},
);

export const createPost = createServerFn({ method: "POST" })
	.validator(
		(d: {
			title: string;
			body?: string;
			status?: string;
			tags?: string[];
			featured_image?: string;
		}) => d,
	)
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
			const validTags = tags.filter(Boolean);

			if (validTags.length > 0) {
				const postTagsToInsert = validTags.map((tag) => ({
					post_id: newPost.id,
					tag_id: tag.id,
				}));

				await supabase.from("posts_tags").insert(postTagsToInsert);
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
		}) => d,
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
		if (data.featured_image !== undefined)
			updateData.featured_image = data.featured_image;

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

		if (data.tags !== undefined) {
			await supabase.from("posts_tags").delete().eq("post_id", data.id);

			if (data.tags.length > 0) {
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
				const validTags = tags.filter(Boolean);

				if (validTags.length > 0) {
					const postTagsToInsert = validTags.map((tag) => ({
						post_id: data.id,
						tag_id: tag.id,
					}));

					await supabase.from("posts_tags").insert(postTagsToInsert);
				}
			}
		}

		return updatedPost;
	});

export const deletePost = createServerFn({ method: "POST" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		console.info(`Deleting post with id ${postId}...`);
		const supabase = getSupabaseServerClient();

		// First get the post to check if it has an image
		const { data: existingPost } = await supabase
			.from("posts")
			.select("featured_image")
			.eq("id", postId)
			.single();

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

		// Delete associated image if exists
		if (existingPost?.featured_image) {
			try {
				const imagePath = extractImagePath(existingPost.featured_image);
				await deletePostImage({ data: { imagePath } });
			} catch (imageError) {
				console.error("Error deleting associated image:", imageError);
				// Don't fail the post deletion if image deletion fails
			}
		}

		return { success: true };
	});
