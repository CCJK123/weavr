// Mock X (Twitter) feed data for the Weavr MVP demo.
//
// Real X OAuth + API access is deferred (the X API is pay-per-use with no
// free tier). This module seeds the in-memory store with representative
// mocked tweets from several sample X profiles so the timeline renders
// without any provider credentials. Server-only.

import type { Update } from '$lib/types';
import { addUpdate } from '$lib/server/store';

/** A sample X profile whose tweets appear in the mocked feed. */
interface MockProfile {
	id: string;
	username: string;
	displayName: string;
}

/** A single mocked tweet tied to a profile. */
interface MockTweet {
	profileId: string;
	text: string;
	/** How many minutes before seed time this tweet "occurred". */
	minutesAgo: number;
}

const mockProfiles: MockProfile[] = [
	{ id: 'mock-x-orbitlab', username: 'orbitlab', displayName: 'Orbit Lab' },
	{ id: 'mock-x-cloudbytes', username: 'cloudbytes', displayName: 'Cloud Bytes' },
	{ id: 'mock-x-shipitdaily', username: 'shipitdaily', displayName: 'Ship It Daily' },
	{ id: 'mock-x-designdrift', username: 'designdrift', displayName: 'Design Drift' },
	{ id: 'mock-x-edgecoder', username: 'edgecoder', displayName: 'Edge Coder' }
];

const mockTweets: MockTweet[] = [
	{
		profileId: 'mock-x-orbitlab',
		text: 'We just shipped edge-native sessions — state persists across the globe with zero config. The future of stateful apps is here.',
		minutesAgo: 15
	},
	{
		profileId: 'mock-x-cloudbytes',
		text: 'Hot take: most teams don\u2019t need a multi-region active-active setup until they\u2019re serving millions of requests a day. Start simple.',
		minutesAgo: 48
	},
	{
		profileId: 'mock-x-shipitdaily',
		text: 'Shipped 47 deploys this week. The secret? Small, reversible changes and a CI pipeline that runs in under 90 seconds.',
		minutesAgo: 95
	},
	{
		profileId: 'mock-x-designdrift',
		text: 'Design systems die when no one owns them. Assign a maintainer, schedule reviews, and treat your tokens like code.',
		minutesAgo: 180
	},
	{
		profileId: 'mock-x-edgecoder',
		text: 'You can run a full Postgres-compatible database at the edge now. Latency matters more than you think for interactive apps.',
		minutesAgo: 240
	},
	{
		profileId: 'mock-x-orbitlab',
		text: 'Reminder: cold starts aren\u2019t a law of nature. With the right runtime, your serverless functions can wake up in under 5ms.',
		minutesAgo: 410
	},
	{
		profileId: 'mock-x-cloudbytes',
		text: 'Our Q3 infrastructure cost report is live. The median startup spends 40% of its cloud budget on idle resources. Right-size your instances.',
		minutesAgo: 720
	},
	{
		profileId: 'mock-x-shipitdaily',
		text: 'Unpopular opinion: your staging environment should be as boring as possible. Excitement belongs in production monitoring, not deploys.',
		minutesAgo: 905
	},
	{
		profileId: 'mock-x-designdrift',
		text: 'Stop hiding your empty states. A good empty state teaches the user what\u2019s possible before they\u2019ve done anything.',
		minutesAgo: 1200
	},
	{
		profileId: 'mock-x-edgecoder',
		text: 'The best infra is the infra you forgot you had. If you\u2019re thinking about your database every day, something is wrong.',
		minutesAgo: 1500
	},
	{
		profileId: 'mock-x-orbitlab',
		text: 'We\u2019re hiring engineers who care about developer experience. Remote-friendly, async-first, and we ship every week.',
		minutesAgo: 1860
	},
	{
		profileId: 'mock-x-cloudbytes',
		text: 'If your incident response doc is longer than one page, nobody will read it during an outage. Keep it short.',
		minutesAgo: 2200
	}
];

const profileById = new Map(mockProfiles.map((p) => [p.id, p]));

let seeded = false;

/**
 * Seed the in-memory store with mocked X updates. Idempotent within a single
 * Worker isolate / dev process — safe to call from the page load function.
 */
export function seedMockData(): void {
	if (seeded) return;
	seeded = true;

	const now = Date.now();
	mockTweets.forEach((tweet, index) => {
		const profile = profileById.get(tweet.profileId);
		if (!profile) return;
		const id = `x:mock:${profile.username}:${index}`;
		const update: Update = {
			id,
			provider: 'x',
			sourceKind: 'oauth_fetch',
			externalId: id,
			authorName: profile.displayName,
			authorUsername: profile.username,
			text: tweet.text,
			externalUrl: `https://x.com/${profile.username}/status/${'1800000000000000' + String(index).padStart(3, '0')}`,
			occurredAt: new Date(now - tweet.minutesAgo * 60_000).toISOString(),
			ingestedAt: new Date(now).toISOString()
		};
		addUpdate(update);
	});
}
