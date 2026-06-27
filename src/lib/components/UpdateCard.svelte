<script lang="ts">
	import type { Update } from '$lib/types';

	let { update }: { update: Update } = $props();

	const sourceLabels: Record<Update['sourceKind'], string> = {
		oauth_fetch: 'X',
		bot_message: 'Telegram',
		forwarded_message: 'Telegram · Forwarded',
		channel_post: 'Telegram · Channel'
	};
</script>

<article class="update-card" data-provider={update.provider}>
	<div class="update-meta">
		<span class="source-label" data-provider={update.provider}
			>{sourceLabels[update.sourceKind]}</span
		>
		{#if update.authorUsername}
			<span class="author">@{update.authorUsername}</span>
		{:else if update.authorName}
			<span class="author">{update.authorName}</span>
		{/if}
		<time datetime={update.occurredAt}>{new Date(update.occurredAt).toLocaleString()}</time>
	</div>
	{#if update.text}
		<p class="update-text">{update.text}</p>
	{/if}
	{#if update.externalUrl}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
		<a class="external-link" href={update.externalUrl} target="_blank" rel="noopener noreferrer">
			View original
		</a>
	{/if}
</article>

<style>
	.update-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.update-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8rem;
		flex-wrap: wrap;
	}

	.source-label {
		font-weight: 600;
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.source-label[data-provider='x'] {
		background: #1a1a1a;
		color: #fff;
	}

	.source-label[data-provider='telegram'] {
		background: #0088cc;
		color: #fff;
	}

	.author {
		color: var(--color-text-muted);
	}

	time {
		color: var(--color-text-muted);
		margin-left: auto;
	}

	.update-text {
		font-size: 0.95rem;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.external-link {
		font-size: 0.8rem;
		color: var(--color-accent);
		text-decoration: none;
	}

	.external-link:hover {
		text-decoration: underline;
	}
</style>
