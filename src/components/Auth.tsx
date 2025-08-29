import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { isGoogleOAuthEnabled, isAzureOAuthEnabled } from "~/utils/oauth";

export function Auth({
	actionText,
	onSubmit,
	status,
	afterSubmit,
	onGoogleAuth,
	googleAuthStatus,
	onAzureAuth,
	azureAuthStatus,
}: {
	actionText: string;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
	onGoogleAuth?: () => void;
	googleAuthStatus?: "pending" | "idle" | "success" | "error";
	onAzureAuth?: () => void;
	azureAuthStatus?: "pending" | "idle" | "success" | "error";
}) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">{actionText}</CardTitle>
					<CardDescription className="text-center">
						Enter your credentials to {actionText.toLowerCase()}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{(isGoogleOAuthEnabled() || isAzureOAuthEnabled()) && (onGoogleAuth || onAzureAuth) && (
						<div className="space-y-4">
							{isGoogleOAuthEnabled() && onGoogleAuth && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={onGoogleAuth}
									disabled={googleAuthStatus === "pending"}
								>
									<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
									{googleAuthStatus === "pending" ? "Loading..." : `${actionText} with Google`}
								</Button>
							)}
							{isAzureOAuthEnabled() && onAzureAuth && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={onAzureAuth}
									disabled={azureAuthStatus === "pending"}
								>
									<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
										<path
											fill="currentColor"
											d="M11.4 24H0L1.2 11.1h10.1V24zm9.8-12.9v-.6c0-1.9.6-3.6 1.8-4.9 1.2-1.4 2.8-2.1 4.8-2.1s3.6.7 4.8 2.1c1.2 1.3 1.8 3 1.8 4.9v.6c0 1.9-.6 3.6-1.8 4.9-1.2 1.4-2.8 2.1-4.8 2.1s-3.6-.7-4.8-2.1c-1.2-1.3-1.8-3-1.8-4.9zm-9.6 1.5L21.2 0H24v12.6H11.6z"
										/>
									</svg>
									{azureAuthStatus === "pending" ? "Loading..." : `${actionText} with Microsoft`}
								</Button>
							)}
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with email
									</span>
								</div>
							</div>
						</div>
					)}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit(e);
						}}
						className="space-y-4"
					>
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
								placeholder="Enter your password"
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={status === "pending"}
						>
							{status === "pending" ? "Loading..." : actionText}
						</Button>
						{afterSubmit}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
