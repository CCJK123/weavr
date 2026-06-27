import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	addUpdate,
	clearConnectorNotice,
	consumeOAuthState,
	setConnectorNotice,
	setXToken,
	upsertAccount
} from '$lib/server/store';
import type { ConnectedAccount, ConnectedAccountStatus } from '$lib/types';
import {
	exchangeXCode,
	fetchXMe,
	fetchXTweets,
	normalizeXPost,
	XOAuthError,
	X_SCOPES,
	xNoticeFor
} from '$lib/server/providers/x';

// GET /api/auth/x/callback — handle the X OAuth redirect.
// Validates state, exchanges the code, fetches the profile, stores the
// account + token, and attempts one recent-post import (max_results=5).
// Import failures downgrade the account status instead of discarding the
// connection, and set a human-readable notice.
export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		setConnectorNotice('x', 'X connection failed: missing code or state in the callback.');
		throw redirect(302, '/?x=error');
	}

	const entry = consumeOAuthState(state);
	if (!entry || entry.provider !== 'x' || !entry.pkceVerifier) {
		setConnectorNotice('x', xNoticeFor('needs_reconnect'));
		throw redirect(302, '/?x=needs_reconnect');
	}

	// 1. Exchange the authorization code for tokens.
	let token;
	try {
		token = await exchangeXCode(code, entry.pkceVerifier);
	} catch (err) {
		const status = err instanceof XOAuthError ? err.status : 'error';
		setConnectorNotice('x', xNoticeFor(status));
		throw redirect(302, `/?x=${status}`);
	}

	// 2. Fetch the connected profile.
	let xUser;
	try {
		xUser = await fetchXMe(token.access_token);
	} catch (err) {
		const status = err instanceof XOAuthError ? err.status : 'error';
		setConnectorNotice('x', xNoticeFor(status));
		throw redirect(302, `/?x=${status}`);
	}

	const accountId = `x:${xUser.id}`;
	const account: ConnectedAccount = {
		id: accountId,
		provider: 'x',
		providerUserId: xUser.id,
		username: xUser.username,
		displayName: xUser.name,
		avatarUrl: xUser.profile_image_url,
		status: 'connected',
		scopes: [...X_SCOPES]
	};

	// Store token metadata (server-only, in-memory).
	setXToken(accountId, {
		accessToken: token.access_token,
		refreshToken: token.refresh_token,
		expiresAt: token.expires_in
			? new Date(Date.now() + token.expires_in * 1000).toISOString()
			: undefined,
		scopes: token.scope ? token.scope.split(' ') : [...X_SCOPES]
	});

	// 3. Attempt one recent-post import. Import failures do not discard the
	//    connection; they downgrade the account status and set a notice.
	let importStatus: ConnectedAccountStatus = 'connected';
	try {
		const tweets = await fetchXTweets(token.access_token, xUser.id);
		for (const tweet of tweets) {
			addUpdate(normalizeXPost(tweet, account));
		}
		clearConnectorNotice('x');
	} catch (err) {
		importStatus = err instanceof XOAuthError ? err.status : 'error';
		setConnectorNotice('x', xNoticeFor(importStatus));
	}

	account.status = importStatus;
	upsertAccount(account);

	throw redirect(302, `/?x=${importStatus}`);
};
