<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ConnectorStatus } from '$lib/types';

	let {
		title,
		description,
		status,
		href,
		actionLabel,
		notice
	}: {
		title: string;
		description: string;
		status: ConnectorStatus;
		href?: string;
		actionLabel?: string;
		notice?: string;
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

	const resolvedHref = $derived(href !== undefined ? resolve(href) : undefined);
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
