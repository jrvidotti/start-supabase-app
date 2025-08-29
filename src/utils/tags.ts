import { createServerFn } from "@tanstack/react-start";
import type { Tag } from "~/db";
import { getSupabaseServerClient } from "~/utils/supabase";

export type TagType = Tag;

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

export const fetchTagsForPost = createServerFn({ method: "GET" })
	.validator((d: string) => d)
	.handler(async ({ data: postId }) => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("posts_tags")
			.select(
				`
				tags (*)
			`,
			)
			.eq("post_id", postId);

		if (error) {
			console.error("Error fetching post tags:", error);
			throw new Error("Error fetching post tags");
		}

		return data?.map((pt: any) => pt.tags).filter(Boolean) || [];
	});

export const updatePostTags = createServerFn({ method: "POST" })
	.validator((d: { postId: string; tagIds: string[] }) => d)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		await supabase.from("posts_tags").delete().eq("post_id", data.postId);

		if (data.tagIds.length > 0) {
			const postTagsToInsert = data.tagIds.map((tagId) => ({
				post_id: data.postId,
				tag_id: tagId,
			}));

			const { error: insertError } = await supabase
				.from("posts_tags")
				.insert(postTagsToInsert);

			if (insertError) {
				console.error("Error inserting post tags:", insertError);
				throw new Error("Error updating post tags");
			}
		}

		return { success: true };
	});

export const fetchAllTags = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("tags")
			.select("*")
			.order("name");

		if (error) {
			console.error("Error fetching all tags:", error);
			throw new Error("Error fetching tags");
		}

		return data || [];
	},
);

export const deleteTag = createServerFn({ method: "POST" })
	.validator((d: string) => d)
	.handler(async ({ data: tagId }) => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.from("tags").delete().eq("id", tagId);

		if (error) {
			console.error("Error deleting tag:", error);
			throw new Error("Error deleting tag");
		}

		return { success: true };
	});

export const createPostWithTags = createServerFn({ method: "POST" })
	.validator(
		(d: {
			title: string;
			body?: string;
			status?: string;
			tagNames: string[];
		}) => d,
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { data: userData } = await supabase.auth.getUser();

		const { data: newPost, error: postError } = await supabase
			.from("posts")
			.insert({
				title: data.title,
				body: data.body,
				user_id: userData?.user?.id,
				status: data.status || "draft",
			})
			.select()
			.single();

		if (postError) {
			console.error("Error creating post:", postError);
			throw new Error("Error creating post");
		}

		if (data.tagNames.length > 0) {
			const tagPromises = data.tagNames.map(async (tagName) => {
				return await getOrCreateTag({ data: { name: tagName } });
			});

			const tags = await Promise.all(tagPromises);
			const tagIds = tags.map((tag) => tag.id);

			await updatePostTags({ data: { postId: newPost.id, tagIds } });
		}

		return newPost;
	});

export const updatePostWithTags = createServerFn({ method: "POST" })
	.validator(
		(d: {
			id: string;
			title?: string;
			body?: string;
			status?: string;
			tagNames: string[];
		}) => d,
	)
	.handler(async ({ data }) => {
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

		const tagPromises = data.tagNames.map(async (tagName) => {
			return await getOrCreateTag({ data: { name: tagName } });
		});

		const tags = await Promise.all(tagPromises);
		const tagIds = tags.map((tag) => tag.id);

		await updatePostTags({ data: { postId: data.id, tagIds } });

		return updatedPost;
	});
