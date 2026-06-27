<script lang="ts">
	import type { Update } from '$lib/types';
	import UpdateCard from './UpdateCard.svelte';

	let {
		updates,
		hasAccounts,
		onConnect
	}: {
		updates: Update[];
		hasAccounts: boolean;
		onConnect?: () => void;
	} = $props();
</script>

<div class="timeline">
	{#if updates.length === 0}
		<section class="empty-state" aria-label="No updates yet">
			<div class="empty-threads" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</div>
			<h2>{hasAccounts ? 'Your thread is ready.' : 'Your threads will appear here.'}</h2>
			<p>
				{hasAccounts
					? 'Connected accounts are ready. New updates will settle here as one calm profile view.'
					: 'Connect your accounts to bring scattered updates into one calm, people-first view.'}
			</p>
			{#if onConnect}
				<button class="primary-button" type="button" onclick={onConnect}
					>Connect your accounts</button
				>
			{/if}
		</section>
	{:else}
		<div class="timeline-list" aria-label="Recent updates">
			{#each updates as update (update.id)}
				<UpdateCard {update} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.timeline {
		position: relative;
	}

	.timeline-list {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-left: 1.25rem;
	}

	.timeline-list::before {
		content: '';
		position: absolute;
		left: 0.35rem;
		top: 1.25rem;
		bottom: 1.25rem;
		width: 1px;
		background: linear-gradient(
			180deg,
			transparent,
			var(--color-border) 12%,
			var(--color-brand) 50%,
			var(--color-border) 88%,
			transparent
		);
	}

	.empty-state {
		position: relative;
		overflow: hidden;
		text-align: center;
		padding: clamp(2rem, 8vw, 4rem) clamp(1.25rem, 5vw, 3rem);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: rgba(255, 255, 255, 0.78);
		box-shadow: var(--shadow-soft);
	}

	.empty-state h2 {
		font-size: clamp(1.6rem, 4vw, 2.35rem);
		margin-bottom: 0.7rem;
	}

	.empty-state p {
		max-width: 34rem;
		margin: 0 auto 1.4rem;
		color: var(--color-text-muted);
	}

	.empty-threads {
		width: min(260px, 70vw);
		height: 92px;
		margin: 0 auto 1.2rem;
		position: relative;
	}

	.empty-threads span {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-brand);
		border-radius: 999px;
	}

	.empty-threads span:nth-child(1) {
		top: 22px;
		transform: rotate(8deg);
	}

	.empty-threads span:nth-child(2) {
		top: 45px;
		transform: rotate(-3deg);
	}

	.empty-threads span:nth-child(3) {
		top: 68px;
		transform: rotate(5deg);
	}

	@media (max-width: 560px) {
		.timeline-list {
			padding-left: 0;
		}

		.timeline-list::before {
			display: none;
		}
	}
</style>
