// Shared OAuth 2.0 helpers: PKCE (RFC 7636), state, nonce, and base64
// encoding. Web Crypto-based so they run in both the Node dev server and
// the Cloudflare Workers runtime without node:crypto.

const VERIFIER_BYTES = 32;
const STATE_BYTES = 24;
const NONCE_BYTES = 16;

function bytesToBinary(bytes: Uint8Array): string {
	let bin = '';
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return bin;
}

function base64Url(bytes: Uint8Array): string {
	return btoa(bytesToBinary(bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64FromString(s: string): string {
	return btoa(bytesToBinary(new TextEncoder().encode(s)));
}

/** Generate a high-entropy PKCE code_verifier (base64url of 32 random bytes). */
export function generateCodeVerifier(): string {
	return base64Url(crypto.getRandomValues(new Uint8Array(VERIFIER_BYTES)));
}

/** Generate the S256 code_challenge for a given code_verifier. */
export async function generateCodeChallenge(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return base64Url(new Uint8Array(digest));
}

/** Generate a single-use CSRF state token (base64url of 24 random bytes). */
export function generateState(): string {
	return base64Url(crypto.getRandomValues(new Uint8Array(STATE_BYTES)));
}

/** Generate a random OIDC nonce (base64url of 16 random bytes). */
export function generateNonce(): string {
	return base64Url(crypto.getRandomValues(new Uint8Array(NONCE_BYTES)));
}

/** Base64-encode a UTF-8 string (used for HTTP Basic auth credentials). */
export function base64EncodeString(s: string): string {
	return base64FromString(s);
}
