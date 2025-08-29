import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchPublicPost } from "~/utils/posts";
import { TagsList } from "~/components/TagsList";

export const Route = createFileRoute("/posts/$postId")({
  loader: ({ params: { postId } }) => fetchPublicPost({ data: postId }),
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            ← Back to posts
          </Link>
        </div>

        {/* Post content */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Featured image */}
          {post.featured_image && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Post header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <time dateTime={new Date(post.created_at).toISOString()}>
                  📅 Published on {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </time>
                
                {post.updated_at !== post.created_at && (
                  <time dateTime={new Date(post.updated_at).toISOString()}>
                    ✏️ Updated on {new Date(post.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long", 
                      day: "numeric"
                    })}
                  </time>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-4">
                  <TagsList tags={post.tags} />
                </div>
              )}
            </header>

            {/* Post body */}
            {post.body && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer with back button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}