// Shared MVP types for the Weavr X + Telegram ingress.
// Scope and guardrails live in OUTLINE.md. These types model only the
// local in-memory MVP shape, not the durable public-launch schema.

/** Providers supported by the local MVP. */
export type Provider = 'x' | 'telegram' | 'instagram';

/** Lifecycle of a connected provider account. */
export type ConnectedAccountStatus =
	| 'connected'
	| 'blocked'
	| 'rate_limited'
	| 'needs_reconnect'
	| 'error';

/** Where a normalized timeline update came from. */
export type UpdateSourceKind =
	| 'oauth_fetch'
	| 'bot_message'
	| 'forwarded_message'
	| 'channel_post'
	| 'instagram_post';

/** A normalized provider connection for the demo profile. */
export interface ConnectedAccount {
	id: string;
	provider: Provider;
	providerUserId: string;
	username?: string;
	displayName?: string;
	avatarUrl?: string;
	status: ConnectedAccountStatus;
	scopes: string[];
}

/** A normalized timeline entry from X or Telegram. */
export interface Update {
	id: string;
	provider: Provider;
	sourceKind: UpdateSourceKind;
	externalId?: string;
	authorName?: string;
	authorUsername?: string;
	authorAvatarUrl?: string;
	text?: string;
	mediaUrls?: string[];
	externalUrl?: string;
	occurredAt: string;
	ingestedAt: string;
	rawPayload?: unknown;
}

/** Connector dashboard status, derived from store state + env config. */
export type ConnectorStatus =
	| 'idle'
	| 'connected'
	| 'blocked'
	| 'rate_limited'
	| 'needs_reconnect'
	| 'setup_required'
	| 'error';

/** Token metadata for an X OAuth 2.0 connection. Server-only, in-memory. */
export interface XTokenMetadata {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: string;
	scopes: string[];
}
