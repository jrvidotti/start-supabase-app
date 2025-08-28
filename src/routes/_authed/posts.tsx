import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { fetchPosts } from "../../utils/posts";

export const Route = createFileRoute("/_authed/posts")({
  loader: () => fetchPosts(),
  component: PostsComponent,
});

function PostsComponent() {
  const posts = Route.useLoaderData();
  const context = Route.useRouteContext();

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        {posts.map((post) => {
          return (
            <li key={post.id} className="whitespace-nowrap">
              <Link
                to="/posts/$postId"
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
      <hr />
      <Outlet />
      <pre>{JSON.stringify(context)}</pre>
    </div>
  );
}
