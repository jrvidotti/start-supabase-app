import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { TagsList } from "~/components/TagsList";
import { fetchMyPosts } from "../../utils/posts";

export const Route = createFileRoute("/_authed/my-posts")({
	loader: () => fetchMyPosts(),
	component: PostsComponent,
});

function PostsComponent() {
	const posts = Route.useLoaderData();
	// const context = Route.useRouteContext();

	return (
		<div className="flex h-full">
			<div className="w-80 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700">
				<div className="mb-4">
					<Link
						to="/my-posts/new"
						className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium w-full text-center"
					>
						+ New Post
					</Link>
				</div>
				<ul className="space-y-2">
					{posts.map((post) => {
						return (
							<li key={post.id} className="border rounded-lg p-3">
								<Link
									to="/my-posts/$postId"
									params={{
										postId: post.id,
									}}
									className="block text-blue-800 hover:text-blue-600"
									activeProps={{ className: "text-black font-bold" }}
								>
									<div className="font-medium mb-1">{post.title}</div>
									<div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
										{post.status} •{" "}
										{new Date(post.created_at).toLocaleDateString("en-US")}
									</div>
									<TagsList tags={post.tags || []} className="mb-1" />
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
			<div className="flex-1">
				<Outlet />
			</div>
			{/* <pre>{JSON.stringify(context)}</pre> */}
		</div>
	);
}
