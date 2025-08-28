import { Link } from "@tanstack/react-router";
import * as React from "react";

export interface PostFormData {
	title: string;
	body: string;
	status: "draft" | "published" | "archived";
}

interface PostFormProps {
	initialData?: Partial<PostFormData>;
	onSubmit: (data: PostFormData) => void;
	onCancel?: () => void;
	submitButtonText: string;
	isSubmitting?: boolean;
	error?: string;
	showDeleteButton?: boolean;
	onDelete?: () => void;
	isDeletingButtonText?: string;
	isDeleting?: boolean;
	deleteError?: string;
	title: string;
	backLink: string;
	backLinkText: string;
}

export function PostForm({
	initialData = {},
	onSubmit,
	onCancel,
	submitButtonText,
	isSubmitting = false,
	error,
	showDeleteButton = false,
	onDelete,
	isDeletingButtonText = "Delete Post",
	isDeleting = false,
	deleteError,
	title,
	backLink,
	backLinkText,
}: PostFormProps) {
	const [formData, setFormData] = React.useState<PostFormData>({
		title: initialData.title || "",
		body: initialData.body || "",
		status: initialData.status || "draft",
	});
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title.trim()) {
			return;
		}
		onSubmit({
			title: formData.title.trim(),
			body: formData.body.trim(),
			status: formData.status,
		});
	};

	const handleDelete = () => {
		onDelete?.();
		setShowDeleteConfirm(false);
	};

	return (
		<div className="p-4 max-w-2xl mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold mb-2">{title}</h1>
				<Link
					to={backLink}
					className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
				>
					← {backLinkText}
				</Link>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="title" className="block text-sm font-medium mb-2">
						Title *
					</label>
					<input
						id="title"
						type="text"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
						value={formData.body}
						onChange={(e) => setFormData({ ...formData, body: e.target.value })}
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
						value={formData.status}
						onChange={(e) =>
							setFormData({ ...formData, status: e.target.value as typeof formData.status })
						}
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
						disabled={isSubmitting || !formData.title.trim()}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Saving..." : submitButtonText}
					</button>

					{onCancel ? (
						<button
							type="button"
							onClick={onCancel}
							className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
						>
							Cancel
						</button>
					) : (
						<Link
							to={backLink}
							className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
						>
							Cancel
						</Link>
					)}

					{showDeleteButton && onDelete && (
						<button
							type="button"
							onClick={() => setShowDeleteConfirm(true)}
							disabled={isDeleting}
							className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
						>
							{isDeleting ? "Deleting..." : isDeletingButtonText}
						</button>
					)}
				</div>

				{error && (
					<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				{deleteError && (
					<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{deleteError}
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