export function isGoogleOAuthEnabled(): boolean {
	return import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true';
}