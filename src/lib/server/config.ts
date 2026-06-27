// Server-only environment access for the local MVP.
// Reads happen lazily via SvelteKit's $env/dynamic/private, so the profile
// page renders without provider credentials and only routes that need a
// credential call getRequiredServerEnv.

import { env } from '$env/dynamic/private';

/**
 * Read a required server-side environment variable by name.
 * Throws when the value is missing or empty so callers fail fast
 * only on the route that actually needs the credential.
 *
 * Works locally (reads .env via Vite) and on Cloudflare (reads platform.env).
 */
export function getRequiredServerEnv(name: string): string {
	const value = (env as Record<string, string | undefined>)[name];
	if (value === undefined || value === '') {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}
