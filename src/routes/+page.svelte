<script lang="ts">
	import Timeline from '$lib/components/Timeline.svelte';
	import logoUrl from '../../weavr logo final.png';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type View = 'landing' | 'timeline';
	let view = $state<View>('landing');

	const openTimeline = () => {
		view = 'timeline';
	};

	const handleBrandClick = (event: MouseEvent) => {
		event.preventDefault();
		view = 'landing';
	};

	type Person = {
		username: string;
		name: string;
		avatarUrl?: string;
		count: number;
	};

	const people = $derived.by<Person[]>(() => {
		const byUsername: Record<string, Person> = {};
		for (const u of data.updates) {
			if (!u.authorUsername) continue;
			const existing = byUsername[u.authorUsername];
			if (existing) {
				existing.count += 1;
			} else {
				byUsername[u.authorUsername] = {
					username: u.authorUsername,
					name: u.authorName ?? u.authorUsername,
					avatarUrl: u.authorAvatarUrl,
					count: 1
				};
			}
		}
		return Object.values(byUsername).sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
		);
	});

	let selectedPerson = $state<string | null>(null);

	const filteredUpdates = $derived(
		selectedPerson === null
			? data.updates
			: data.updates.filter((u) => u.authorUsername === selectedPerson)
	);

	const selectPerson = (username: string | null) => {
		selectedPerson = selectedPerson === username ? null : username;
	};
</script>

<svelte:head>
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
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- JS-handled view switch, not route nav -->
			<a class="brand" href="/" onclick={handleBrandClick} aria-label="Weavr home">
				<img src={logoUrl} alt="" />
				<span>Weavr</span>
			</a>
		</header>

		<main class="profile-page" aria-labelledby="timeline-title">
			<section class="intro-panel">
				<div>
					<p class="eyebrow">Demo feed</p>
					<h1 id="timeline-title">One calm thread of what people are sharing.</h1>
					<p>
						Updates are gathered into a quieter, people-first view. Source details stay visible, but
						never louder than the person.
					</p>
				</div>
			</section>

			<section class="timeline-section" aria-label="People-first updates">
				<div class="people-filter" role="group" aria-label="Filter by person">
					<button
						type="button"
						class="chip"
						class:active={selectedPerson === null}
						onclick={() => selectPerson(null)}
					>
						<span class="chip-label">All</span>
						<span class="chip-count">{data.updates.length}</span>
					</button>
					{#each people as person (person.username)}
						<button
							type="button"
							class="chip"
							class:active={selectedPerson === person.username}
							onclick={() => selectPerson(person.username)}
						>
							{#if person.avatarUrl}
								<img class="chip-avatar" src={person.avatarUrl} alt="" />
							{:else}
								<span class="chip-initials" aria-hidden="true">
									{person.name.slice(0, 1).toUpperCase()}
								</span>
							{/if}
							<span class="chip-label">{person.name}</span>
							<span class="chip-count">{person.count}</span>
						</button>
					{/each}
				</div>
				<p class="filter-results">
					Showing {filteredUpdates.length} of {data.updates.length} updates
				</p>
				<Timeline updates={filteredUpdates} hasAccounts={data.accounts.length > 0} />
			</section>
		</main>
	</div>
{/if}

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

	.profile-page {
		width: min(100% - 2rem, var(--max-width));
		margin: 0 auto;
		padding: clamp(1.5rem, 5vw, 4rem) 0;
	}

	.intro-panel {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: rgba(255, 255, 255, 0.78);
		box-shadow: var(--shadow-soft);
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		padding: clamp(1.4rem, 4vw, 2rem);
		margin-bottom: 1.5rem;
	}

	.intro-panel h1 {
		max-width: 760px;
		font-size: clamp(2rem, 5vw, 3.35rem);
		margin: 0.5rem 0 0.85rem;
	}

	.intro-panel p:not(.eyebrow) {
		max-width: 650px;
		color: var(--color-text-muted);
	}

	.timeline-section {
		width: min(100%, var(--content-width));
		margin: 0 auto;
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
	}

	.people-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.6rem;
		scrollbar-width: thin;
	}

	.people-filter::-webkit-scrollbar {
		display: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 40px;
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		background: var(--color-surface-soft);
		color: var(--color-text);
		font: inherit;
		font-size: 0.92rem;
		cursor: pointer;
		white-space: nowrap;
		transition:
			border-color var(--transition),
			background var(--transition);
	}

	.chip:hover {
		border-color: var(--color-brand-hover);
	}

	.chip.active {
		border-color: var(--color-brand);
		background: rgba(144, 205, 195, 0.18);
		font-weight: 600;
	}

	.chip-avatar {
		width: 24px;
		height: 24px;
		object-fit: cover;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.chip-initials {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-brand);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.chip-label {
		line-height: 1;
	}

	.chip-count {
		color: var(--color-text-muted);
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
	}

	.chip.active .chip-count {
		color: var(--color-text);
	}

	.filter-results {
		margin: 0 0 1.25rem;
		color: var(--color-text-muted);
		font-size: 0.82rem;
	}

	@media (max-width: 560px) {
		.people-filter {
			flex-wrap: nowrap;
			overflow-x: auto;
		}
	}
</style>
