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
		<div>
			<p class="connector-kicker">Source</p>
			<h3>{title}</h3>
		</div>
		<span class="status-badge" data-status={status}>{statusLabels[status]}</span>
	</div>

	<p class="description">{description}</p>

	{#if notice}
		<p class="notice">{notice}</p>
	{/if}

	{#if showIdentity}
		<div class="identity">
			{#if avatarUrl}
				<img class="avatar" src={avatarUrl} alt="" width="40" height="40" />
			{:else}
				<div class="avatar-fallback" aria-hidden="true">
					{(displayName ?? username ?? title)[0]}
				</div>
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
		background: rgba(255, 255, 255, 0.86);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: clamp(1.1rem, 3vw, 1.45rem);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		box-shadow: 0 10px 28px rgba(20, 35, 42, 0.035);
		transition:
			border-color var(--transition),
			box-shadow var(--transition),
			transform var(--transition);
	}

	.connector-panel:hover {
		border-color: rgba(107, 184, 173, 0.42);
		box-shadow: var(--shadow-hover);
		transform: translateY(-1px);
	}

	.connector-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.connector-kicker {
		color: var(--color-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.connector-header h3 {
		font-size: 1.18rem;
		margin-top: 0.15rem;
	}

	.status-badge {
		border: 1px solid var(--color-border);
		background: var(--color-surface-soft);
		color: var(--color-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.26rem 0.62rem;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.status-badge[data-status='connected'] {
		background: rgba(144, 205, 195, 0.18);
		border-color: rgba(76, 154, 131, 0.28);
		color: #2d7668;
	}

	.status-badge[data-status='blocked'],
	.status-badge[data-status='error'],
	.status-badge[data-status='needs_reconnect'] {
		background: rgba(180, 95, 95, 0.11);
		border-color: rgba(180, 95, 95, 0.25);
		color: #8c4545;
	}

	.status-badge[data-status='rate_limited'],
	.status-badge[data-status='setup_required'] {
		background: rgba(168, 121, 52, 0.11);
		border-color: rgba(168, 121, 52, 0.24);
		color: #7a5b2b;
	}

	.description {
		color: var(--color-text);
		font-size: 0.96rem;
	}

	.notice {
		border-left: 2px solid var(--color-brand);
		padding: 0.55rem 0 0.55rem 0.8rem;
		color: var(--color-text-muted);
		font-size: 0.88rem;
		background: linear-gradient(90deg, rgba(144, 205, 195, 0.12), transparent);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	.identity {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-top: 0.15rem;
	}

	.avatar,
	.avatar-fallback {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		object-fit: cover;
	}

	.avatar-fallback {
		display: grid;
		place-items: center;
		background: rgba(144, 205, 195, 0.22);
		font-weight: 750;
		color: var(--color-text);
		text-transform: uppercase;
	}

	.identity-text {
		display: flex;
		flex-direction: column;
		line-height: 1.25;
	}

	.display-name {
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.username {
		font-size: 0.82rem;
		color: var(--color-text-muted);
	}

	.action-button {
		align-self: flex-start;
		background: var(--color-brand);
		color: var(--color-text);
		text-decoration: none;
		padding: 0.62rem 1.1rem;
		border-radius: 999px;
		font-size: 0.9rem;
		font-weight: 700;
		transition:
			background var(--transition),
			box-shadow var(--transition),
			transform var(--transition);
		margin-top: 0.15rem;
		box-shadow: 0 12px 28px rgba(107, 184, 173, 0.18);
	}

	.action-button:hover {
		background: var(--color-brand-hover);
		box-shadow: 0 16px 34px rgba(107, 184, 173, 0.24);
		transform: translateY(-1px);
	}

	@media (max-width: 560px) {
		.connector-header {
			flex-direction: column;
		}
	}
</style>
