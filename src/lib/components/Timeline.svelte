<script lang="ts">
	import type { Update } from '$lib/types';
	import UpdateCard from './UpdateCard.svelte';

	let {
		updates,
		hasAccounts
	}: {
		updates: Update[];
		hasAccounts: boolean;
	} = $props();
</script>

<div class="timeline">
	{#if updates.length === 0}
		<p class="empty-state">
			{hasAccounts ? 'Connected, waiting for updates.' : 'No connected sources yet.'}
		</p>
	{:else}
		{#each updates as update (update.id)}
			<UpdateCard {update} />
		{/each}
	{/if}
</div>

<style>
	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-state {
		color: var(--color-text-muted);
		font-style: italic;
		padding: 2rem 0;
		text-align: center;
	}
</style>
