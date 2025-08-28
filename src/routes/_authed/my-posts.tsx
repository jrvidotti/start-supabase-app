import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { fetchMyPosts } from "../../utils/posts";

export const Route = createFileRoute("/_authed/my-posts")({
	loader: () => fetchMyPosts(),
	component: PostsComponent,
});

function PostsComponent() {
	const posts = Route.useLoaderData();
	// const context = Route.useRouteContext();

	return (
		<div className="p-2 flex gap-2">
			<div className="flex flex-col">
				<div className="mb-4">
					<Link
						to="/my-posts/new"
						className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
					>
						+ New Post
					</Link>
				</div>
				<ul className="list-disc pl-4">
					{posts.map((post) => {
						return (
							<li key={post.id} className="whitespace-nowrap">
								<Link
									to="/my-posts/$postId"
									params={{
										postId: post.id,
									}}
									className="block py-1 text-blue-800 hover:text-blue-600"
									activeProps={{ className: "text-black font-bold" }}
								>
									<div>{post.title.substring(0, 20)}</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
			<hr />
			<Outlet />
			{/* <pre>{JSON.stringify(context)}</pre> */}
		</div>
	);
}
