export function isGoogleOAuthEnabled(): boolean {
	return import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true';
}

export function isAzureOAuthEnabled(): boolean {
	return import.meta.env.VITE_AZURE_OAUTH_ENABLED === 'true';
}