import type { ErrorComponentProps } from "@tanstack/react-router";
import { createFileRoute, ErrorComponent, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { NotFound } from "~/components/NotFound";
import { useMutation } from "~/hooks/useMutation";
import { fetchPost, updatePost, deletePost } from "~/utils/posts";

export const Route = createFileRoute("/_authed/my-posts/$postId")({
	loader: ({ params: { postId } }) => fetchPost({ data: postId }),
	errorComponent: PostErrorComponent,
	component: PostComponent,
	notFoundComponent: () => {
		return <NotFound>Post not found</NotFound>;
	},
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
	return <ErrorComponent error={error} />;
}

function PostComponent() {
	const post = Route.useLoaderData();
	const navigate = useNavigate();

	const [title, setTitle] = React.useState(post.title);
	const [body, setBody] = React.useState(post.body || "");
	const [status, setStatus] = React.useState(post.status);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const updateMutation = useMutation({
		fn: updatePost,
		onSuccess: () => {
			navigate({ to: "/my-posts" });
		},
	});

	const deleteMutation = useMutation({
		fn: deletePost,
		onSuccess: () => {
			navigate({ to: "/my-posts" });
		},
	});

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			return;
		}
		updateMutation.mutate({
			data: {
				id: post.id,
				title: title.trim(),
				body: body.trim() || undefined,
				status,
			},
		});
	};

	const handleDelete = () => {
		deleteMutation.mutate({ data: post.id });
		setShowDeleteConfirm(false);
	};

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold mb-2">Edit Post</h1>
				<Link
					to="/my-posts"
					className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
				>
					← Back to My Posts
				</Link>
			</div>

			<form onSubmit={handleSave} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-medium mb-2">
						Title *
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
						placeholder="Enter post title..."
						required
					/>
				</div>

				<div>
					<label htmlFor="body" className="block text-sm font-medium mb-2">
						Body
					</label>
					<textarea
						id="body"
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={6}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
						placeholder="Enter post content..."
					/>
				</div>

				<div>
					<label htmlFor="status" className="block text-sm font-medium mb-2">
						Status
					</label>
					<select
						id="status"
						value={status}
						onChange={(e) => setStatus(e.target.value as typeof status)}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
						<option value="archived">Archived</option>
					</select>
				</div>

				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={updateMutation.status === "pending" || !title.trim()}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{updateMutation.status === "pending" ? "Saving..." : "Save Changes"}
					</button>

					<Link
						to="/my-posts"
						className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
					>
						Cancel
					</Link>

					<button
						type="button"
						onClick={() => setShowDeleteConfirm(true)}
						disabled={deleteMutation.status === "pending"}
						className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
					>
						{deleteMutation.status === "pending" ? "Deleting..." : "Delete Post"}
					</button>
				</div>

				{updateMutation.status === "error" && (
					<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						Failed to save post: {updateMutation.error?.message}
					</div>
				)}

				{deleteMutation.status === "error" && (
					<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						Failed to delete post: {deleteMutation.error?.message}
					</div>
				)}
			</form>

			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							Are you sure you want to delete this post? This action cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDelete}
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
