<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ConnectorStatus } from '$lib/types';

	let {
		title,
		description,
		status,
		href,
		actionLabel,
		notice,
		username,
		displayName,
		avatarUrl
	}: {
		title: string;
		description: string;
		status: ConnectorStatus;
		href?: string;
		actionLabel?: string;
		notice?: string;
		username?: string;
		displayName?: string;
		avatarUrl?: string;
	} = $props();

	const statusLabels: Record<ConnectorStatus, string> = {
		idle: 'Not connected',
		connected: 'Connected',
		blocked: 'Blocked',
		rate_limited: 'Rate limited',
		needs_reconnect: 'Needs reconnect',
		setup_required: 'Setup required',
		error: 'Error'
	};

	const showAction = $derived(
		href !== undefined && actionLabel !== undefined && status !== 'connected'
	);

	const showIdentity = $derived(username !== undefined || displayName !== undefined);

	// `href` is a dynamic prop. `resolve()` is typed over known route literals,
	// so cast to its parameter type; this app uses the default base path, so the
	// resolved value equals the input href.
	const resolvedHref = $derived(
		href !== undefined ? resolve(href as Parameters<typeof resolve>[0]) : undefined
	);
</script>

<div class="connector-panel" data-status={status}>
	<div class="connector-header">
		<h3>{title}</h3>
		<span class="status-badge" data-status={status}>{statusLabels[status]}</span>
	</div>
	<p class="description">{description}</p>
	{#if notice}
		<p class="notice">{notice}</p>
	{/if}
	{#if showIdentity}
		<div class="identity">
			{#if avatarUrl}
				<img class="avatar" src={avatarUrl} alt="" width="32" height="32" />
			{/if}
			<div class="identity-text">
				{#if displayName}<span class="display-name">{displayName}</span>{/if}
				{#if username}<span class="username">@{username}</span>{/if}
			</div>
		</div>
	{/if}
	{#if showAction && resolvedHref}
		<a class="action-button" href={resolvedHref}>{actionLabel}</a>
	{/if}
</div>

<style>
	.connector-panel {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.connector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.connector-header h3 {
		font-size: 1.1rem;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.status-badge[data-status='connected'] {
		background: var(--color-status-connected);
		color: #fff;
	}

	.status-badge[data-status='blocked'],
	.status-badge[data-status='error'],
	.status-badge[data-status='needs_reconnect'] {
		background: var(--color-status-error);
		color: #fff;
	}

	.status-badge[data-status='rate_limited'],
	.status-badge[data-status='setup_required'] {
		background: var(--color-status-warning);
		color: #fff;
	}

	.status-badge[data-status='idle'] {
		background: var(--color-border);
		color: var(--color-text-muted);
	}

	.description {
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.notice {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-style: italic;
	}

	.identity {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.25rem;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--color-border);
	}

	.identity-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.display-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.username {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.action-button {
		align-self: flex-start;
		background: var(--color-accent);
		color: #fff;
		text-decoration: none;
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius);
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.15s ease;
		margin-top: 0.25rem;
	}

	.action-button:hover {
		background: var(--color-accent-hover);
	}
</style>
