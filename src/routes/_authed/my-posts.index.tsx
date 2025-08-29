import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/_authed/my-posts/")({
	component: PostsIndexComponent,
});

function PostsIndexComponent() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto text-center">
				<Card>
					<CardHeader>
						<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-2xl">Welcome to Your Posts!</CardTitle>
						<CardDescription className="text-lg">
							This is your personal writing space. Start creating amazing content to share with the world.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-muted-foreground">
								Select a post from the sidebar to edit it, or create your first post to get started.
							</p>
							<Button asChild size="lg" className="w-full sm:w-auto">
								<Link to="/my-posts/new">
									<PlusCircle className="h-5 w-5 mr-2" />
									Create Your First Post
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
