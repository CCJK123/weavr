import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOAuthState } from '$lib/server/store';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '$lib/server/oauth';
import { buildXAuthUrl, getXRedirectUri } from '$lib/server/providers/x';

// GET /api/auth/x/start — kick off X OAuth 2.0 with PKCE.
// Generates a code_verifier + S256 challenge + CSRF state, stores them in
// memory with a 10-minute expiry, and redirects to X's authorization URL.
export const GET: RequestHandler = async () => {
	// Eagerly validate redirect-URI config so misconfiguration surfaces here.
	getXRedirectUri();

	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	const state = generateState();

	createOAuthState(state, { provider: 'x', pkceVerifier: codeVerifier });

	throw redirect(302, buildXAuthUrl(state, codeChallenge));
};
