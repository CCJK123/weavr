<script lang="ts">
	import type { Update } from '$lib/types';
	import SourceIcon from './SourceIcon.svelte';

	let { update }: { update: Update } = $props();

	const sourceLabel = $derived.by(() => {
		switch (update.provider) {
			case 'x':
				return 'From X';
			case 'instagram':
				return 'From Instagram';
			case 'telegram': {
				switch (update.sourceKind) {
					case 'forwarded_message':
						return 'Telegram · Forwarded';
					case 'channel_post':
						return 'Telegram · Channel';
					default:
						return 'From Telegram';
				}
			}
		}
	});

	const displayName = $derived(update.authorName ?? update.authorUsername ?? 'Demo profile');
	const handle = $derived(update.authorUsername ? `@${update.authorUsername}` : undefined);
	const initials = $derived(
		displayName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('') || 'W'
	);
</script>

<article class="update-card">
	<span class="timeline-dot" aria-hidden="true"></span>

	<header class="person-row">
		{#if update.authorAvatarUrl}
			<img class="avatar" src={update.authorAvatarUrl} alt="" />
		{:else}
			<div class="avatar" aria-hidden="true">{initials}</div>
		{/if}
		<div class="person-copy">
			<h2>{displayName}</h2>
			<div class="update-meta">
				{#if handle}
					<span>{handle}</span>
				{/if}
				<span class="source-label">
					<SourceIcon provider={update.provider} />
					<span>{sourceLabel}</span>
				</span>
				<time datetime={update.occurredAt}>{new Date(update.occurredAt).toLocaleString()}</time>
			</div>
		</div>
	</header>

	{#if update.text}
		<p class="update-text">{update.text}</p>
	{/if}

	{#if update.mediaUrls && update.mediaUrls.length > 0}
		{#if update.mediaUrls.length === 1}
			<div class="media-row">
				<img class="update-media" src={update.mediaUrls[0]} alt="" loading="lazy" />
			</div>
		{:else}
			<div class="media-grid">
				{#each update.mediaUrls as url (url)}
					<img class="update-media" src={url} alt="" loading="lazy" />
				{/each}
			</div>
		{/if}
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
		position: relative;
		background: rgba(255, 255, 255, 0.86);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: clamp(1rem, 3vw, 1.35rem);
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		box-shadow: 0 10px 28px rgba(20, 35, 42, 0.035);
		transition:
			box-shadow var(--transition),
			transform var(--transition),
			border-color var(--transition);
		animation: card-in 200ms ease both;
	}

	.update-card:hover {
		border-color: rgba(107, 184, 173, 0.42);
		box-shadow: var(--shadow-hover);
		transform: translateY(-1px);
	}

	.timeline-dot {
		position: absolute;
		left: -1.16rem;
		top: 1.55rem;
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 999px;
		background: var(--color-brand);
		box-shadow: 0 0 0 5px var(--color-bg);
	}

	.person-row {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex: 0 0 auto;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		background: linear-gradient(145deg, rgba(144, 205, 195, 0.34), rgba(255, 255, 255, 0.72));
		color: var(--color-text);
		font-size: 0.78rem;
		font-weight: 750;
		letter-spacing: 0.04em;
	}

	.person-copy {
		min-width: 0;
		flex: 1;
	}

	.person-copy h2 {
		font-size: 1rem;
		letter-spacing: -0.02em;
	}

	.update-meta {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--color-text-muted);
		font-size: 0.78rem;
		flex-wrap: wrap;
	}

	.source-label {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-weight: 650;
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface-soft);
		color: var(--color-text-muted);
	}

	img.avatar {
		display: block;
		object-fit: cover;
	}

	time {
		color: var(--color-text-muted);
	}

	.update-text {
		font-size: 1rem;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.update-media {
		width: 100%;
		object-fit: cover;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		display: block;
	}

	.media-row .update-media {
		max-height: 360px;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.media-grid .update-media {
		height: 180px;
	}

	.external-link {
		align-self: flex-start;
		font-size: 0.86rem;
		font-weight: 650;
		color: #347f76;
		text-decoration: none;
	}

	.external-link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 560px) {
		.timeline-dot {
			display: none;
		}
	}
</style>
