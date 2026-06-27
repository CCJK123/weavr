<script lang="ts">
	import Timeline from '$lib/components/Timeline.svelte';
	import logoUrl from '../../weavr logo final.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type View = 'landing' | 'timeline' | 'connect';
	let view = $state<View>('landing');

	const openTimeline = () => {
		view = 'timeline';
	};

	const openConnectors = () => {
		view = 'connect';
	};

	const handleBrandClick = (event: MouseEvent) => {
		event.preventDefault();
		openTimeline();
	};
</script>

<svelte:head>
<<<<<<< HEAD
	<title>Weavr — Keep up with people, not platforms</title>
	<meta
		name="description"
		content="Weavr brings scattered updates into one calm, people-first profile."
	/>
</svelte:head>

{#if view === 'landing'}
	<main class="landing-page" aria-labelledby="landing-title">
		<div class="thread-motif" aria-hidden="true">
			<span></span>
			<span></span>
			<span></span>
		</div>

		<section class="landing-card">
			<img class="landing-logo" src={logoUrl} alt="Weavr" />
			<p class="eyebrow">A calm social home</p>
			<h1 id="landing-title">Keep up with people, not platforms.</h1>
			<p class="landing-copy">
				Weavr brings scattered updates into one simple, people-first profile — quiet, organised, and
				woven around the people you care about.
			</p>
			<button class="primary-button" type="button" onclick={openTimeline}>Get started</button>
		</section>
	</main>
{:else}
	<div class="app-shell">
		<header class="app-header">
			<a class="brand" href="/" onclick={handleBrandClick} aria-label="Weavr timeline">
				<img src={logoUrl} alt="" />
				<span>Weavr</span>
			</a>

			<nav class="nav-actions" aria-label="Main navigation">
				{#if view === 'connect'}
					<button class="secondary-button compact" type="button" onclick={openTimeline}>
						Back to updates
					</button>
				{:else}
					<button class="primary-button compact" type="button" onclick={openConnectors}>
						Connect your accounts
					</button>
				{/if}
			</nav>
		</header>

		{#if view === 'timeline'}
			<main class="profile-page" aria-labelledby="timeline-title">
				<section class="intro-panel">
					<div>
						<p class="eyebrow">Demo profile</p>
						<h1 id="timeline-title">One calm thread of what people are sharing.</h1>
						<p>
							Updates from connected sources are gathered into a quieter, people-first view. Source
							details stay visible, but never louder than the person.
						</p>
					</div>
					<button class="secondary-button" type="button" onclick={openConnectors}>
						Connect your accounts
					</button>
				</section>

				<section class="timeline-section" aria-label="People-first updates">
					<Timeline
						updates={data.updates}
						hasAccounts={data.accounts.length > 0}
						onConnect={openConnectors}
					/>
				</section>
			</main>
		{:else}
			<main class="connect-page" aria-labelledby="connect-title">
				<section class="connect-hero">
					<p class="eyebrow">Account threads</p>
					<h1 id="connect-title">Connect your scattered updates.</h1>
					<p>
						Bring supported sources into Weavr while keeping the main profile focused on people, not
						setup.
					</p>
				</section>

				<section class="connectors-grid" aria-label="Account connectors">
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
				</section>

				<section class="limitations-card" aria-labelledby="limits-title">
					<h2 id="limits-title">Not available in this demo</h2>
					<ul>
						<li>
							Instagram media import is not part of this MVP because it requires additional Meta
							account setup and review.
						</li>
						<li>Weavr cannot read WhatsApp Status.</li>
					</ul>
				</section>
			</main>
		{/if}
	</div>
{/if}
=======
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
>>>>>>> fd2ba79182c188ccae742ec1374e86256d7646e6

<style>
	.landing-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	.thread-motif {
		position: absolute;
		inset: auto 4vw 8vh auto;
		width: min(440px, 80vw);
		height: 260px;
		opacity: 0.55;
		pointer-events: none;
	}

	.thread-motif span {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-brand);
		border-radius: 999px;
		transform-origin: center;
	}

	.thread-motif span:nth-child(1) {
		top: 64px;
		transform: rotate(-8deg);
	}

	.thread-motif span:nth-child(2) {
		top: 124px;
		transform: rotate(4deg);
	}

	.thread-motif span:nth-child(3) {
		top: 184px;
		transform: rotate(-3deg);
	}

	.landing-card {
		width: min(100%, 680px);
		text-align: center;
		padding: clamp(2rem, 7vw, 5rem);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: rgba(255, 255, 255, 0.76);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(16px);
		animation: rise-in 220ms ease both;
	}

	.landing-logo {
		width: min(210px, 58vw);
		margin: 0 auto 1.75rem;
	}

	.eyebrow {
		color: var(--color-text-muted);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.landing-card h1 {
		font-size: clamp(2.4rem, 7vw, 4.8rem);
		margin: 0.65rem 0 1.1rem;
	}

	.landing-copy {
		max-width: 38rem;
		margin: 0 auto 2rem;
		color: var(--color-text-muted);
		font-size: clamp(1rem, 2vw, 1.16rem);
	}

	.app-shell {
		min-height: 100vh;
	}

	.app-header {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem clamp(1rem, 4vw, 2.5rem);
		background: rgba(251, 252, 251, 0.88);
		border-bottom: 1px solid var(--color-border);
		backdrop-filter: blur(18px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		color: var(--color-text);
		font-weight: 750;
		text-decoration: none;
		letter-spacing: -0.03em;
	}

	.brand img {
		width: 42px;
		height: 42px;
		object-fit: contain;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.compact {
		min-height: 40px;
		padding: 0.55rem 1rem;
		font-size: 0.9rem;
	}

	.profile-page,
	.connect-page {
		width: min(100% - 2rem, var(--max-width));
		margin: 0 auto;
		padding: clamp(1.5rem, 5vw, 4rem) 0;
	}

	.intro-panel,
	.connect-hero,
	.limitations-card {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: rgba(255, 255, 255, 0.78);
		box-shadow: var(--shadow-soft);
	}

	.intro-panel {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		padding: clamp(1.4rem, 4vw, 2rem);
		margin-bottom: 1.5rem;
	}

	.intro-panel h1,
	.connect-hero h1 {
		max-width: 760px;
		font-size: clamp(2rem, 5vw, 3.35rem);
		margin: 0.5rem 0 0.85rem;
	}

	.intro-panel p:not(.eyebrow),
	.connect-hero p:not(.eyebrow) {
		max-width: 650px;
		color: var(--color-text-muted);
	}

	.timeline-section {
		width: min(100%, var(--content-width));
		margin: 0 auto;
	}

	.connect-page {
		width: min(100% - 2rem, 900px);
	}

	.connect-hero,
	.limitations-card {
		padding: clamp(1.4rem, 4vw, 2rem);
	}
<<<<<<< HEAD

	.connectors-grid {
		display: grid;
		gap: 1rem;
		margin: 1rem 0;
	}

	.limitations-card h2 {
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
	}

	.limitations-card ul {
		padding-left: 1.1rem;
		color: var(--color-text-muted);
	}

	.limitations-card li + li {
		margin-top: 0.45rem;
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 720px) {
		.app-header {
			align-items: flex-start;
		}

		.brand span {
			display: none;
		}

		.intro-panel {
			align-items: stretch;
			flex-direction: column;
		}

		.intro-panel .secondary-button {
			align-self: flex-start;
		}
	}
=======
>>>>>>> fd2ba79182c188ccae742ec1374e86256d7646e6
</style>
