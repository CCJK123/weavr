<script lang="ts">
	import ConnectorPanel from '$lib/components/ConnectorPanel.svelte';
	import Timeline from '$lib/components/Timeline.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Weavr — Demo Profile</title>
</svelte:head>

<main class="profile-page">
	<header class="profile-header">
		<h1>Weavr</h1>
		<p class="profile-subtitle">Demo profile</p>
	</header>

	<section class="section">
		<h2>Connectors</h2>
		<div class="connectors-grid">
			<ConnectorPanel
				title="X"
				description="Import your own public X posts where your API access allows it."
				status={data.connectors.x.status}
				href="/api/auth/x/start"
				actionLabel="Connect X"
				notice={data.connectors.x.notice}
				username={data.connectors.x.username}
				displayName={data.connectors.x.displayName}
				avatarUrl={data.connectors.x.avatarUrl}
			/>
			<ConnectorPanel
				title="Telegram Login"
				description="Use Telegram to identify your Weavr account."
				status={data.connectors.telegramLogin.status}
				href="/api/auth/telegram/start"
				actionLabel="Connect Telegram"
				notice={data.connectors.telegramLogin.notice}
			/>
			<ConnectorPanel
				title="Telegram Bot"
				description="Send or forward messages to the Weavr bot to add them to your profile."
				status={data.connectors.telegramBot.status}
				notice={data.connectors.telegramBot.notice ??
					'Channel import requires adding the bot to a channel with permission to receive posts.'}
			/>
		</div>
	</section>

	<section class="section">
		<h2>Not available in this MVP</h2>
		<ul class="limitations">
			<li>
				Instagram media import is not part of this MVP because it requires additional Meta account
				setup and review.
			</li>
			<li>Weavr cannot read WhatsApp Status.</li>
		</ul>
	</section>

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

	.connectors-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.limitations {
		list-style: disc;
		padding-left: 1.5rem;
		color: var(--color-text-muted);
	}

	.limitations li {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}
</style>
