// In-memory server store for the local Weavr MVP.
// Scope (see OUTLINE.md): no D1/KV/R2/DO, no migrations, no repository layers.
// Data is lost when the dev server restarts. Server-only.
//
// All maps are module-scoped singletons per Worker isolate / dev process.

import type { ConnectedAccount, Update, XTokenMetadata } from '$lib/types';

/** Fixed demo profile ID for the local MVP (single-profile demo). */
export const DEMO_PROFILE_ID = 'demo-profile';

// --- Internal in-memory state ---------------------------------------------

/** Connected accounts keyed by `${provider}:${providerUserId}` for upsert. */
const accountsByKey = new Map<string, ConnectedAccount>();

/** Timeline updates, kept in insertion order; callers sort by `occurredAt`. */
const updates: Update[] = [];

/** Pending OAuth states: state -> { provider, pkceVerifier?, expiresAt }. */
interface OAuthStateEntry {
	provider: 'x' | 'telegram';
	pkceVerifier?: string;
	nonce?: string;
	expiresAt: number;
}
const oauthStates = new Map<string, OAuthStateEntry>();

/** Telegram update_id dedupe set (number ids Telegram assigns). */
const seenTelegramUpdateIds = new Set<number>();

/** X token metadata keyed by connected-account id. */
const xTokensByAccountId = new Map<string, XTokenMetadata>();

/** Connector notices keyed by provider (setup-required messages). */
const connectorNotices = new Map<'x' | 'telegram', string>();

// --- Accounts --------------------------------------------------------------

export function listAccounts(): ConnectedAccount[] {
	return [...accountsByKey.values()];
}

export function getAccountByProvider(provider: 'x' | 'telegram'): ConnectedAccount | undefined {
	return listAccounts().find((account) => account.provider === provider);
}

export function upsertAccount(account: ConnectedAccount): void {
	const key = `${account.provider}:${account.providerUserId}`;
	accountsByKey.set(key, account);
}

// --- X token metadata (server-only, in-memory) -----------------------------

export function setXToken(accountId: string, token: XTokenMetadata): void {
	xTokensByAccountId.set(accountId, token);
}

export function getXToken(accountId: string): XTokenMetadata | undefined {
	return xTokensByAccountId.get(accountId);
}

// --- Updates ---------------------------------------------------------------

export function listUpdates(): Update[] {
	// Return a shallow copy so callers can sort freely.
	return [...updates];
}

export function addUpdate(update: Update): void {
	updates.push(update);
}

// --- OAuth state (10-minute expiry) ----------------------------------------

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export function createOAuthState(
	state: string,
	entry: { provider: 'x' | 'telegram'; pkceVerifier?: string; nonce?: string }
): void {
	oauthStates.set(state, {
		provider: entry.provider,
		pkceVerifier: entry.pkceVerifier,
		nonce: entry.nonce,
		expiresAt: Date.now() + OAUTH_STATE_TTL_MS
	});
}

/**
 * Consume an OAuth state. Returns the entry if present and unexpired, then
 * deletes it (single-use). Returns `undefined` for missing/expired/unknown.
 */
export function consumeOAuthState(state: string): OAuthStateEntry | undefined {
	const entry = oauthStates.get(state);
	if (!entry) return undefined;
	oauthStates.delete(state);
	if (Date.now() > entry.expiresAt) return undefined;
	return entry;
}

// --- Telegram update_id dedupe --------------------------------------------

export function hasTelegramUpdateId(updateId: number): boolean {
	return seenTelegramUpdateIds.has(updateId);
}

export function recordTelegramUpdateId(updateId: number): void {
	seenTelegramUpdateIds.add(updateId);
}

// --- Connector notices -----------------------------------------------------

export function setConnectorNotice(provider: 'x' | 'telegram', notice: string): void {
	connectorNotices.set(provider, notice);
}

export function getConnectorNotice(provider: 'x' | 'telegram'): string | undefined {
	return connectorNotices.get(provider);
}
