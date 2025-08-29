import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusCircle, FileText, Edit3 } from "lucide-react";
import { countMyPosts } from "~/utils/posts";

export const Route = createFileRoute("/_authed/my-posts/")({
  loader: () => countMyPosts(),
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  const postCount = Route.useLoaderData();
  const hasPosts = postCount > 0;

  console.log("postCount", postCount);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {hasPosts ? (
                <Edit3 className="h-6 w-6 text-primary" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {hasPosts ? "Your Posts" : "Welcome to Your Posts!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {hasPosts
                  ? `You have ${postCount} post${postCount === 1 ? "" : "s"}. Select one from the sidebar to edit it, or create a new one.`
                  : "This is your personal writing space. Start creating amazing content to share with the world."}
              </p>
              <p className="text-muted-foreground">
                {hasPosts
                  ? "Ready to write your next post? Click the button below to get started."
                  : "Select a post from the sidebar to edit it, or create your first post to get started."}
              </p>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/my-posts/new">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  {hasPosts ? "Create New Post" : "Create Your First Post"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
