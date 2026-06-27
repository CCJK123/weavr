// Mock multi-platform feed data for the Weavr MVP demo.
//
// Real provider access (X OAuth, Instagram Graph API, Telegram Bot API) is
// deferred for the MVP. This module seeds the in-memory store with
// representative mocked updates across X, Instagram, and Telegram from a set
// of sample profiles so the unified timeline renders without any provider
// credentials. Server-only.

import type { Update, UpdateSourceKind } from '$lib/types';
import { addUpdate } from '$lib/server/store';

/** A sample profile whose posts appear in the mocked feed. */
interface MockProfile {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string;
}

/** A single mocked post tied to a profile, on any supported provider. */
interface MockPost {
	profileId: string;
	provider: 'x' | 'instagram' | 'telegram';
	sourceKind: UpdateSourceKind;
	text: string;
	/** How many minutes before seed time this post "occurred". Unique per post. */
	minutesAgo: number;
	mediaUrls?: string[];
}

/** Build a deterministic DiceBear avatar URL from a username. */
function avatarUrlFor(username: string): string {
	return `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;
}

/** Build a deterministic picsum image URL from a unique seed. */
function imageUrlFor(seed: string): string {
	return `https://picsum.photos/seed/${seed}/600/400`;
}

const mockProfiles: MockProfile[] = [
	{
		id: 'person-keithchan',
		username: 'keithchan',
		displayName: 'Keith Chan',
		avatarUrl: avatarUrlFor('keithchan')
	},
	{
		id: 'person-huangxin',
		username: 'huangxin',
		displayName: 'Huang Xin',
		avatarUrl: avatarUrlFor('huangxin')
	},
	{
		id: 'person-mannyaam',
		username: 'mannyaam',
		displayName: 'Mannyaa Mishra',
		avatarUrl: avatarUrlFor('mannyaam')
	},
	{
		id: 'person-yugamvora',
		username: 'yugamvora',
		displayName: 'Yugam Jinesh Vora',
		avatarUrl: avatarUrlFor('yugamvora')
	},
	{
		id: 'person-nanditha',
		username: 'nanditha',
		displayName: 'Nanditha',
		avatarUrl: avatarUrlFor('nanditha')
	},
	{
		id: 'person-kaiwenvoon',
		username: 'kaiwenvoon',
		displayName: 'Kai Wen Voon',
		avatarUrl: avatarUrlFor('kaiwenvoon')
	},
	{
		id: 'person-anuragroy',
		username: 'anuragroy',
		displayName: 'Anurag Roy',
		avatarUrl: avatarUrlFor('anuragroy')
	},
	{
		id: 'person-ayushks',
		username: 'ayushks',
		displayName: 'Ayush Kumar Sharma',
		avatarUrl: avatarUrlFor('ayushks')
	},
	{
		id: 'person-ritvikt',
		username: 'ritvikt',
		displayName: 'Ritvik Tadwalkar',
		avatarUrl: avatarUrlFor('ritvikt')
	},
	{
		id: 'person-kieronteh',
		username: 'kieronteh',
		displayName: 'Kieron Teh',
		avatarUrl: avatarUrlFor('kieronteh')
	},
	{
		id: 'person-tayzheng',
		username: 'tayzheng',
		displayName: 'Tay Zheng',
		avatarUrl: avatarUrlFor('tayzheng')
	},
	{
		id: 'person-suhani',
		username: 'suhani',
		displayName: 'Suhani Arora',
		avatarUrl: avatarUrlFor('suhani')
	},
	{
		id: 'person-sonali',
		username: 'sonali',
		displayName: 'Sonali',
		avatarUrl: avatarUrlFor('sonali')
	},
	{
		id: 'person-wenjing',
		username: 'wenjing',
		displayName: 'Ng Wen Jing',
		avatarUrl: avatarUrlFor('wenjing')
	},
	{
		id: 'person-weilyngui',
		username: 'weilyngui',
		displayName: 'Weily Ngui',
		avatarUrl: avatarUrlFor('weilyngui')
	}
];

const mockPosts: MockPost[] = [
	// ---- X (oauth_fetch) ----
	{
		profileId: 'person-keithchan',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Finally got my Docker setup working after two days of fighting with volume mounts. The secret was just reading the docs properly. 😅 #docker',
		minutesAgo: 5
	},
	{
		profileId: 'person-huangxin',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Just finished my last final exam of the semester! Time to sleep for a week. 🎉',
		minutesAgo: 12
	},
	{
		profileId: 'person-mannyaam',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Got my first PR merged into an open source project today! It was just a doc fix but it still counts. #opensource',
		minutesAgo: 22
	},
	{
		profileId: 'person-yugamvora',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'TypeScript generics finally clicked for me this week. Feels like leveling up in a video game.',
		minutesAgo: 35
	},
	{
		profileId: 'person-nanditha',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Woke up early enough to watch the sunrise for once. Worth losing the sleep.',
		minutesAgo: 48
	},
	{
		profileId: 'person-kaiwenvoon',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Shoutout to whoever maintains the free WiFi at this café. I have been here 3 hours and they have not kicked me out yet.',
		minutesAgo: 62
	},
	{
		profileId: 'person-anuragroy',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Refactored a 500-line function into 6 small ones today. Felt like cleaning out a cluttered closet.',
		minutesAgo: 78
	},
	{
		profileId: 'person-ayushks',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'The chai stall near campus makes better tea than any fancy café I have been to. Fight me.',
		minutesAgo: 95
	},
	{
		profileId: 'person-ritvikt',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "Finished reading 'The Pragmatic Programmer'. Should have read it two years ago honestly.",
		minutesAgo: 110
	},
	{
		profileId: 'person-kieronteh',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Rainy day, hot coffee, no meetings. This is the ideal coding weather.',
		minutesAgo: 130
	},
	{
		profileId: 'person-tayzheng',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Caught the sunset on the way home today. Sometimes the small stuff is the best stuff.',
		minutesAgo: 150,
		mediaUrls: [imageUrlFor('weavr-tayzheng-0')]
	},
	{
		profileId: 'person-suhani',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Baked banana bread for the first time and it actually turned out okay? Might be a baker after all. #baking',
		minutesAgo: 175,
		mediaUrls: [imageUrlFor('weavr-suhani-0')]
	},
	{
		profileId: 'person-keithchan',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Coffee count today: 4. Lines of code that actually shipped: maybe 40. Worth it.',
		minutesAgo: 200,
		mediaUrls: [imageUrlFor('weavr-keithchan-0')]
	},
	{
		profileId: 'person-sonali',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Moved my desk near the window and my productivity went up 200%. Correlation or causation, I will take it.',
		minutesAgo: 230
	},
	{
		profileId: 'person-wenjing',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Tried bouldering for the first time yesterday. My forearms are destroyed but I am obsessed now. 🧗',
		minutesAgo: 265,
		mediaUrls: [imageUrlFor('weavr-wenjing-0')]
	},
	{
		profileId: 'person-weilyngui',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: '3pm slump hitting hard. Emergency snack deployed.',
		minutesAgo: 300
	},
	{
		profileId: 'person-kaiwenvoon',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'TIL: "it works on my machine" is not a valid deployment strategy. Shocking, I know.',
		minutesAgo: 340
	},
	{
		profileId: 'person-anuragroy',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Unpopular opinion: most code comments just describe what the code does, not why. The why is the important part.',
		minutesAgo: 385
	},
	{
		profileId: 'person-huangxin',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Tried making mapo tofu from scratch tonight. Turns out Sichuan peppercorns are no joke, my whole mouth went numb but in a good way.',
		minutesAgo: 430,
		mediaUrls: [imageUrlFor('weavr-huangxin-0')]
	},
	{
		profileId: 'person-yugamvora',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Anyone else get irrationally happy when their test suite goes green? Just me? Okay.',
		minutesAgo: 480
	},
	{
		profileId: 'person-mannyaam',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Internship applications are brutal. Sent out 30, heard back from 2. Keeping my head up though.',
		minutesAgo: 535
	},
	{
		profileId: 'person-nanditha',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Group projects would be fine if everyone actually communicated. End of rant.',
		minutesAgo: 595
	},
	{
		profileId: 'person-ayushks',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Spent an hour figuring out why my build was failing. Turned out I needed to run npm install. Classic.',
		minutesAgo: 660
	},
	{
		profileId: 'person-ritvikt',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'My terminal prompt is way too customized at this point and I refuse to feel bad about it.',
		minutesAgo: 730
	},
	{
		profileId: 'person-kieronteh',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Just discovered tmux and I feel like I have been coding with one hand tied behind my back this whole time.',
		minutesAgo: 805
	},
	{
		profileId: 'person-weilyngui',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Finally set up proper backups after the great almost-data-loss scare of last week. Lesson learned. #backups',
		minutesAgo: 885
	},
	{
		profileId: 'person-wenjing',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Hot take: writing tests before code (TDD) actually does make you think harder about the design. I get it now.',
		minutesAgo: 970
	},
	{
		profileId: 'person-suhani',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "The amount of times I have googled 'git undo last commit' is genuinely embarrassing.",
		minutesAgo: 1060
	},
	{
		profileId: 'person-kieronteh',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'PSA: drink water. Your future self debugging at 2am will thank you.',
		minutesAgo: 1155
	},
	{
		profileId: 'person-sonali',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "Reading other people's well-written code is so satisfying. It is like reading good prose.",
		minutesAgo: 1255
	},
	{
		profileId: 'person-keithchan',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "Hot take: the best debugging tool is still just printing things to the console. Don't @ me.",
		minutesAgo: 1360
	},
	{
		profileId: 'person-ritvikt',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "Exam season means my code quality drops to 'at least it compiles'. We have all been there.",
		minutesAgo: 1470
	},
	{
		profileId: 'person-tayzheng',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Someone asked me to explain monads today. I tried. We are both more confused now.',
		minutesAgo: 1585
	},
	{
		profileId: 'person-ayushks',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Why does every tutorial assume you already know the thing they are teaching? #LearnToCode',
		minutesAgo: 1705
	},
	{
		profileId: 'person-nanditha',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Finally started learning Rust. The borrow checker and I are going to be spending a lot of time together I think.',
		minutesAgo: 1830
	},
	{
		profileId: 'person-huangxin',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Reminder to myself: always commit before pulling. Learned that the hard way again today.',
		minutesAgo: 1960
	},
	{
		profileId: 'person-kaiwenvoon',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: "Booked flights home for the holidays. Can't wait for my mom's cooking. 🍲",
		minutesAgo: 2095,
		mediaUrls: [imageUrlFor('weavr-kaiwenvoon-0')]
	},
	{
		profileId: 'person-mannyaam',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Spent the whole afternoon debugging a race condition. The fix was one line. Of course it was.',
		minutesAgo: 2235
	},
	{
		profileId: 'person-anuragroy',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'First day at the new job tomorrow. Nervous but excited. #newjob',
		minutesAgo: 2380
	},
	{
		profileId: 'person-yugamvora',
		provider: 'x',
		sourceKind: 'oauth_fetch',
		text: 'Weekend plan: build something useless and fun. Thinking a little CLI tool that roasts my Spotify playlist.',
		minutesAgo: 2530
	},

	// ---- Instagram (instagram_post) ----
	{
		profileId: 'person-suhani',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'banana bread attempt #1 🍌 turned out okay actually',
		minutesAgo: 9,
		mediaUrls: [imageUrlFor('weavr-suhani-1')]
	},
	{
		profileId: 'person-nanditha',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'sunrise hits different when you actually wake up for it 🌅',
		minutesAgo: 18,
		mediaUrls: [imageUrlFor('weavr-nanditha-0')]
	},
	{
		profileId: 'person-kaiwenvoon',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'café hopping szn ☕️ 3 hours deep and counting',
		minutesAgo: 28,
		mediaUrls: [imageUrlFor('weavr-kaiwenvoon-1')]
	},
	{
		profileId: 'person-tayzheng',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'golden hour on the walk home ✨',
		minutesAgo: 42,
		mediaUrls: [imageUrlFor('weavr-tayzheng-1')]
	},
	{
		profileId: 'person-sonali',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'new desk setup by the window 🪟 productivity +200%',
		minutesAgo: 70,
		mediaUrls: [imageUrlFor('weavr-sonali-0')]
	},
	{
		profileId: 'person-wenjing',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'bouldering grip strength: nonexistent but vibes are immaculate 🧗',
		minutesAgo: 102,
		mediaUrls: [imageUrlFor('weavr-wenjing-1')]
	},
	{
		profileId: 'person-huangxin',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'mapo tofu night 🌶️ mouth numb, no regrets',
		minutesAgo: 145,
		mediaUrls: [imageUrlFor('weavr-huangxin-1')]
	},
	{
		profileId: 'person-keithchan',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: '4 coffees in. ship it. ☕️',
		minutesAgo: 185,
		mediaUrls: [imageUrlFor('weavr-keithchan-1')]
	},
	{
		profileId: 'person-suhani',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'sunday baking mode 🧁',
		minutesAgo: 245,
		mediaUrls: [imageUrlFor('weavr-suhani-2')]
	},
	{
		profileId: 'person-kaiwenvoon',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'flights booked 🎫 mom’s cooking incoming 🍲',
		minutesAgo: 320,
		mediaUrls: [imageUrlFor('weavr-kaiwenvoon-2')]
	},
	{
		profileId: 'person-nanditha',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'rust + me = complicated relationship rn 🦀',
		minutesAgo: 520,
		mediaUrls: [imageUrlFor('weavr-nanditha-1')]
	},
	{
		profileId: 'person-sonali',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'clean code reads like poetry ngl 📖',
		minutesAgo: 760,
		mediaUrls: [imageUrlFor('weavr-sonali-1')]
	},
	{
		profileId: 'person-wenjing',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'TDD converted. tests first, always 🧪',
		minutesAgo: 1100,
		mediaUrls: [imageUrlFor('weavr-wenjing-2')]
	},
	{
		profileId: 'person-huangxin',
		provider: 'instagram',
		sourceKind: 'instagram_post',
		text: 'exam szn survival kit: snacks + noise-cancelling 🎧',
		minutesAgo: 1900,
		mediaUrls: [imageUrlFor('weavr-huangxin-2')]
	},

	// ---- Telegram (channel_post / bot_message) ----
	{
		profileId: 'person-anuragroy',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '📢 Just shipped a refactor: split a 500-line monster into 6 focused functions. PRs welcome to roast my naming → github.com/anuragroy/refactor',
		minutesAgo: 14,
		mediaUrls: [imageUrlFor('weavr-anuragroy-0')]
	},
	{
		profileId: 'person-ayushks',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '☕️ Chai index update: campus stall still undefeated. New rating system dropping soon. Stay tuned.',
		minutesAgo: 30
	},
	{
		profileId: 'person-ritvikt',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: "📚 Finished 'The Pragmatic Programmer'. Thread incoming with my top takeaways. #booknotes",
		minutesAgo: 44
	},
	{
		profileId: 'person-kieronteh',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '🌧️ Ideal coding weather protocol activated: rain + coffee + zero meetings. Do not disturb.',
		minutesAgo: 55
	},
	{
		profileId: 'person-weilyngui',
		provider: 'telegram',
		sourceKind: 'bot_message',
		text: 'Reminder: your 3pm snack break is overdue. This has been an automated message from your forebrain.',
		minutesAgo: 90
	},
	{
		profileId: 'person-yugamvora',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: "🧪 PSA: green test suites release dopamine. It's science (probably).",
		minutesAgo: 120
	},
	{
		profileId: 'person-mannyaam',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '🛠️ Debugging a race condition all afternoon. The fix was one line. Writeup coming tomorrow.',
		minutesAgo: 160
	},
	{
		profileId: 'person-anuragroy',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '🚀 First day at the new job tomorrow. Nervous + excited. Wish me luck 🤞',
		minutesAgo: 215
	},
	{
		profileId: 'person-ritvikt',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '⌨️ Terminal prompt customization has gone too far and I refuse to stop. Screenshot thread incoming.',
		minutesAgo: 280,
		mediaUrls: [imageUrlFor('weavr-ritvikt-0')]
	},
	{
		profileId: 'person-kieronteh',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '🧊 Discovered tmux this week. Life before tmux was a mistake. Mini-guide coming soon.',
		minutesAgo: 620
	},
	{
		profileId: 'person-weilyngui',
		provider: 'telegram',
		sourceKind: 'bot_message',
		text: 'Backup status: COMPLETE. Crisis averted. Please resume normal operations.',
		minutesAgo: 1000
	},
	{
		profileId: 'person-mannyaam',
		provider: 'telegram',
		sourceKind: 'channel_post',
		text: '📣 Open source milestone: first PR merged! It was a doc fix but it counts. Onward 🎉',
		minutesAgo: 2700
	}
];

const profileById = new Map(mockProfiles.map((p) => [p.id, p]));

/**
 * Build the public-facing URL for a mocked post, if it has one. Telegram
 * direct messages (bot_message) have no public URL, so undefined is returned.
 */
function externalUrlFor(post: MockPost, username: string, index: number): string | undefined {
	switch (post.provider) {
		case 'x':
			return `https://x.com/${username}/status/${'1800000000000000' + String(index).padStart(3, '0')}`;
		case 'instagram':
			return `https://instagram.com/${username}/p/mock-${index}`;
		case 'telegram':
			return post.sourceKind === 'channel_post' ? `https://t.me/${username}/${index}` : undefined;
	}
}

let seeded = false;

/**
 * Seed the in-memory store with mocked updates across X, Instagram, and
 * Telegram. Idempotent within a single Worker isolate / dev process — safe
 * to call from the page load function.
 */
export function seedMockData(): void {
	if (seeded) return;
	seeded = true;

	const now = Date.now();
	mockPosts.forEach((post, index) => {
		const profile = profileById.get(post.profileId);
		if (!profile) return;

		const id = `${post.provider}:mock:${profile.username}:${index}`;
		const update: Update = {
			id,
			provider: post.provider,
			sourceKind: post.sourceKind,
			externalId: id,
			authorName: profile.displayName,
			authorUsername: profile.username,
			authorAvatarUrl: profile.avatarUrl,
			text: post.text,
			occurredAt: new Date(now - post.minutesAgo * 60_000).toISOString(),
			ingestedAt: new Date(now).toISOString()
		};

		if (post.mediaUrls) update.mediaUrls = post.mediaUrls;
		const externalUrl = externalUrlFor(post, profile.username, index);
		if (externalUrl) update.externalUrl = externalUrl;

		addUpdate(update);
	});
}
