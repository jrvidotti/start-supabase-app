import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function SignupForm({
	onSubmit,
	status,
	afterSubmit,
}: {
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">Sign Up</CardTitle>
					<CardDescription className="text-center">
						Create a new account to get started
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit(e);
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="Enter your full name"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="Enter your email"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="Create a password"
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={status === "pending"}
						>
							{status === "pending" ? "Creating Account..." : "Sign Up"}
						</Button>
						{afterSubmit}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
