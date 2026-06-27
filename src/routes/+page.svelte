<script lang="ts">
	import Timeline from '$lib/components/Timeline.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Weavr — Demo Feed</title>
</svelte:head>

<main class="profile-page">
	<header class="profile-header">
		<h1>Weavr</h1>
		<p class="profile-subtitle">Demo feed — mocked X (Twitter) posts from sample profiles.</p>
	</header>

	<section class="section">
		<h2>Timeline</h2>
		<Timeline updates={data.updates} hasAccounts={data.accounts.length > 0} />
	</section>
</main>

<style>
	.profile-page {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.profile-header {
		margin-bottom: 2rem;
	}

	.profile-header h1 {
		font-size: 2rem;
	}

	.profile-subtitle {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	.section {
		margin-bottom: 2rem;
	}

	.section h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}
</style>
