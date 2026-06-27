// X (Twitter) OAuth 2.0 with PKCE provider for the Weavr MVP.
// Implements auth-URL building, code exchange, profile fetch, recent-post
// fetch, and normalization into the shared Update shape. X API failures are
// classified into the ConnectedAccountStatus values the UI expects.

import type { ConnectedAccount, ConnectedAccountStatus, Update } from '$lib/types';
import { getOptionalServerEnv, getRequiredServerEnv } from '$lib/server/config';
import { base64EncodeString } from '$lib/server/oauth';

// --- Constants --------------------------------------------------------------

export const X_AUTHORIZE_URL = 'https://x.com/i/oauth2/authorize';
export const X_TOKEN_URL = 'https://api.x.com/2/oauth2/token';
export const X_API_BASE = 'https://api.x.com/2';
export const X_CALLBACK_PATH = '/api/auth/x/callback';
export const X_SCOPES: string[] = ['tweet.read', 'users.read', 'offline.access'];

// --- Lazy config readers ----------------------------------------------------

export function getAppUrl(): string {
	return getRequiredServerEnv('APP_URL');
}

export function getXClientId(): string {
	return getRequiredServerEnv('X_CLIENT_ID');
}

export function getXClientSecret(): string | undefined {
	return getOptionalServerEnv('X_CLIENT_SECRET');
}

/**
 * Read and validate X_REDIRECT_URI. It must equal `${APP_URL}/api/auth/x/callback`
 * so the callback route and the X app portal configuration stay in sync.
 */
export function getXRedirectUri(): string {
	const appUrl = getAppUrl().replace(/\/$/, '');
	const expected = `${appUrl}${X_CALLBACK_PATH}`;
	const actual = getRequiredServerEnv('X_REDIRECT_URI');
	if (actual !== expected) {
		throw new Error(
			`X_REDIRECT_URI must equal "${expected}" but is "${actual}". Update the X app portal or the env var.`
		);
	}
	return actual;
}

// --- Error classification ---------------------------------------------------

export type XSyncStatus = Extract<
	ConnectedAccountStatus,
	'blocked' | 'rate_limited' | 'needs_reconnect' | 'error'
>;

export class XOAuthError extends Error {
	readonly status: XSyncStatus;
	constructor(status: XSyncStatus, message: string) {
		super(message);
		this.name = 'XOAuthError';
		this.status = status;
	}
}

function classifyXResponse(res: Response): XSyncStatus {
	if (res.status === 429) return 'rate_limited';
	if (res.status === 401) return 'needs_reconnect';
	if (res.status === 403) return 'blocked';
	return 'error';
}

/** Human-readable notice text for each non-connected X status. */
export function xNoticeFor(status: XSyncStatus): string {
	switch (status) {
		case 'blocked':
			return 'X is connected, but this API tier does not allow post import yet.';
		case 'rate_limited':
			return 'X rate limit reached. Please try again later.';
		case 'needs_reconnect':
			return 'X connection expired or was revoked. Please reconnect.';
		case 'error':
			return 'X connection failed. Please try again.';
	}
}

// --- Authorization URL ------------------------------------------------------

export function buildXAuthUrl(state: string, codeChallenge: string): string {
	const url = new URL(X_AUTHORIZE_URL);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', getXClientId());
	url.searchParams.set('redirect_uri', getXRedirectUri());
	url.searchParams.set('scope', X_SCOPES.join(' '));
	url.searchParams.set('state', state);
	url.searchParams.set('code_challenge', codeChallenge);
	url.searchParams.set('code_challenge_method', 'S256');
	return url.toString();
}

// --- Token exchange ---------------------------------------------------------

export interface XTokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in?: number;
	scope?: string;
	token_type?: string;
}

export async function exchangeXCode(code: string, codeVerifier: string): Promise<XTokenResponse> {
	const clientId = getXClientId();
	const clientSecret = getXClientSecret();
	const redirectUri = getXRedirectUri();

	const body = new URLSearchParams();
	body.set('grant_type', 'authorization_code');
	body.set('code', code);
	body.set('redirect_uri', redirectUri);
	body.set('code_verifier', codeVerifier);
	body.set('client_id', clientId);

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept: 'application/json'
	};
	// Confidential clients authenticate with HTTP Basic; public clients rely on PKCE alone.
	if (clientSecret) {
		headers['Authorization'] = `Basic ${base64EncodeString(`${clientId}:${clientSecret}`)}`;
	}

	const res = await fetch(X_TOKEN_URL, { method: 'POST', headers, body });
	const payload = (await res.json().catch(() => ({}))) as Partial<XTokenResponse> & {
		error?: string;
		error_description?: string;
	};

	if (!res.ok) {
		// invalid_grant (bad/expired code or verifier mismatch) -> reconnect; otherwise -> error.
		const status: XSyncStatus = payload.error === 'invalid_grant' ? 'needs_reconnect' : 'error';
		throw new XOAuthError(
			status,
			`X token exchange failed (${res.status}): ${
				payload.error_description ?? payload.error ?? 'unknown error'
			}`
		);
	}
	if (!payload.access_token) {
		throw new XOAuthError('error', 'X token exchange returned no access_token');
	}
	return payload as XTokenResponse;
}

// --- Profile ----------------------------------------------------------------

export interface XUser {
	id: string;
	name?: string;
	username?: string;
	profile_image_url?: string;
}

export async function fetchXMe(accessToken: string): Promise<XUser> {
	const url = new URL(`${X_API_BASE}/users/me`);
	url.searchParams.set('user.fields', 'id,name,username,profile_image_url');
	const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
	if (!res.ok) {
		throw new XOAuthError(classifyXResponse(res), `X /users/me returned ${res.status}`);
	}
	const payload = (await res.json().catch(() => ({}))) as { data?: XUser };
	if (!payload.data?.id) {
		throw new XOAuthError('error', 'X /users/me response missing data.id');
	}
	return payload.data;
}

// --- Recent posts -----------------------------------------------------------

export interface XTweet {
	id: string;
	text?: string;
	created_at?: string;
}

export async function fetchXTweets(accessToken: string, userId: string): Promise<XTweet[]> {
	const url = new URL(`${X_API_BASE}/users/${userId}/tweets`);
	url.searchParams.set('max_results', '5');
	url.searchParams.set('tweet.fields', 'created_at');
	const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
	if (!res.ok) {
		throw new XOAuthError(
			classifyXResponse(res),
			`X /users/${userId}/tweets returned ${res.status}`
		);
	}
	const payload = (await res.json().catch(() => ({}))) as { data?: XTweet[] };
	return payload.data ?? [];
}

/** Normalize an X tweet into the shared Update shape. */
export function normalizeXPost(tweet: XTweet, account: ConnectedAccount): Update {
	const externalUrl = account.username
		? `https://x.com/${account.username}/status/${tweet.id}`
		: undefined;
	return {
		id: `x:${tweet.id}`,
		provider: 'x',
		sourceKind: 'oauth_fetch',
		externalId: tweet.id,
		authorName: account.displayName,
		authorUsername: account.username,
		text: tweet.text,
		externalUrl,
		occurredAt: tweet.created_at ?? new Date().toISOString(),
		ingestedAt: new Date().toISOString(),
		rawPayload: tweet
	};
}
