import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { fetchPublicPosts } from "~/utils/posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CalendarDays, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ search }) => {
		// biome-ignore lint/suspicious/noExplicitAny: ...
		const code = (search as any)?.code;

		// If there's a code parameter, redirect to the auth callback
		if (code) {
			throw redirect({
				to: "/auth/callback",
				search: { code },
			});
		}
	},
	loader: async () => ({ posts: await fetchPublicPosts() }),
	component: Home,
});

function Home() {
	const { posts } = Route.useLoaderData();
	
	if (posts.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h1 className="text-3xl font-bold mb-4">Welcome to Our Blog</h1>
					<p className="text-muted-foreground text-lg">
						No posts yet. Check back later for interesting content!
					</p>
				</div>
			</div>
		);
	}
	
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Latest Posts</h1>
				<p className="text-muted-foreground">
					Discover our latest stories and insights
				</p>
			</div>
			
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{posts.map((post) => (
					<Link key={post.id} to="/posts/$postId" params={{ postId: post.id }}>
						<Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
							{post.featured_image && (
								<div className="aspect-video overflow-hidden rounded-t-lg">
									<img
										src={post.featured_image}
										alt={post.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
									/>
								</div>
							)}
							<CardHeader>
								<div className="flex items-center gap-2 mb-2">
									<Badge variant="secondary" className="text-xs">
										{post.status === 'published' ? 'Published' : post.status}
									</Badge>
									{post.featured_image && (
										<ImageIcon className="h-3 w-3 text-muted-foreground" />
									)}
								</div>
								<CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
									{post.title}
								</CardTitle>
								{post.body && (
									<CardDescription className="line-clamp-3">
										{post.body.length > 120
											? `${post.body.substring(0, 120)}...`
											: post.body}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className="pt-0">
								<div className="flex flex-wrap gap-1 mb-3">
									{post.tags?.slice(0, 3).map((tag: string) => (
										<Badge key={tag} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
									{post.tags && post.tags.length > 3 && (
										<Badge variant="outline" className="text-xs">
											+{post.tags.length - 3} more
										</Badge>
									)}
								</div>
								<div className="flex items-center text-sm text-muted-foreground">
									<CalendarDays className="h-4 w-4 mr-2" />
									{new Date(post.created_at).toLocaleDateString("en-US", {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
