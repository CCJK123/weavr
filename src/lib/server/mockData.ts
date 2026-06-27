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
	{ id: 'mock-x-keithchan', username: 'keithchan', displayName: 'Keith Chan' },
	{ id: 'mock-x-huangxin', username: 'huangxin', displayName: 'Huang Xin' },
	{ id: 'mock-x-mannyaam', username: 'mannyaam', displayName: 'Mannyaa Mishra' },
	{ id: 'mock-x-yugamvora', username: 'yugamvora', displayName: 'Yugam Jinesh Vora' },
	{ id: 'mock-x-nanditha', username: 'nanditha', displayName: 'Nanditha' },
	{ id: 'mock-x-kaiwenvoon', username: 'kaiwenvoon', displayName: 'Kai Wen Voon' },
	{ id: 'mock-x-anuragroy', username: 'anuragroy', displayName: 'Anurag Roy' },
	{ id: 'mock-x-ayushks', username: 'ayushks', displayName: 'Ayush Kumar Sharma' },
	{ id: 'mock-x-ritvikt', username: 'ritvikt', displayName: 'Ritvik Tadwalkar' },
	{ id: 'mock-x-kieronteh', username: 'kieronteh', displayName: 'Kieron Teh' },
	{ id: 'mock-x-tayzheng', username: 'tayzheng', displayName: 'Tay Zheng' },
	{ id: 'mock-x-suhani', username: 'suhani', displayName: 'Suhani Arora' },
	{ id: 'mock-x-sonali', username: 'sonali', displayName: 'Sonali' },
	{ id: 'mock-x-wenjing', username: 'wenjing', displayName: 'Ng Wen Jing' },
	{ id: 'mock-x-weilyngui', username: 'weilyngui', displayName: 'Weily Ngui' }
];

const mockTweets: MockTweet[] = [
	{
		profileId: 'mock-x-keithchan',
		text: 'Finally got my Docker setup working after two days of fighting with volume mounts. The secret was just reading the docs properly. 😅 #docker',
		minutesAgo: 5
	},
	{
		profileId: 'mock-x-huangxin',
		text: 'Just finished my last final exam of the semester! Time to sleep for a week. 🎉',
		minutesAgo: 12
	},
	{
		profileId: 'mock-x-mannyaam',
		text: 'Got my first PR merged into an open source project today! It was just a doc fix but it still counts. #opensource',
		minutesAgo: 22
	},
	{
		profileId: 'mock-x-yugamvora',
		text: 'TypeScript generics finally clicked for me this week. Feels like leveling up in a video game.',
		minutesAgo: 35
	},
	{
		profileId: 'mock-x-nanditha',
		text: 'Woke up early enough to watch the sunrise for once. Worth losing the sleep.',
		minutesAgo: 48
	},
	{
		profileId: 'mock-x-kaiwenvoon',
		text: 'Shoutout to whoever maintains the free WiFi at this café. I have been here 3 hours and they have not kicked me out yet.',
		minutesAgo: 62
	},
	{
		profileId: 'mock-x-anuragroy',
		text: 'Refactored a 500-line function into 6 small ones today. Felt like cleaning out a cluttered closet.',
		minutesAgo: 78
	},
	{
		profileId: 'mock-x-ayushks',
		text: 'The chai stall near campus makes better tea than any fancy café I have been to. Fight me.',
		minutesAgo: 95
	},
	{
		profileId: 'mock-x-ritvikt',
		text: "Finished reading 'The Pragmatic Programmer'. Should have read it two years ago honestly.",
		minutesAgo: 110
	},
	{
		profileId: 'mock-x-kieronteh',
		text: 'Rainy day, hot coffee, no meetings. This is the ideal coding weather.',
		minutesAgo: 130
	},
	{
		profileId: 'mock-x-tayzheng',
		text: 'Caught the sunset on the way home today. Sometimes the small stuff is the best stuff.',
		minutesAgo: 150
	},
	{
		profileId: 'mock-x-suhani',
		text: 'Baked banana bread for the first time and it actually turned out okay? Might be a baker after all. #baking',
		minutesAgo: 175
	},
	{
		profileId: 'mock-x-keithchan',
		text: 'Coffee count today: 4. Lines of code that actually shipped: maybe 40. Worth it.',
		minutesAgo: 200
	},
	{
		profileId: 'mock-x-sonali',
		text: 'Moved my desk near the window and my productivity went up 200%. Correlation or causation, I will take it.',
		minutesAgo: 230
	},
	{
		profileId: 'mock-x-wenjing',
		text: 'Tried bouldering for the first time yesterday. My forearms are destroyed but I am obsessed now. 🧗',
		minutesAgo: 265
	},
	{
		profileId: 'mock-x-weilyngui',
		text: '3pm slump hitting hard. Emergency snack deployed.',
		minutesAgo: 300
	},
	{
		profileId: 'mock-x-kaiwenvoon',
		text: 'TIL: "it works on my machine" is not a valid deployment strategy. Shocking, I know.',
		minutesAgo: 340
	},
	{
		profileId: 'mock-x-anuragroy',
		text: 'Unpopular opinion: most code comments just describe what the code does, not why. The why is the important part.',
		minutesAgo: 385
	},
	{
		profileId: 'mock-x-huangxin',
		text: 'Tried making mapo tofu from scratch tonight. Turns out Sichuan peppercorns are no joke, my whole mouth went numb but in a good way.',
		minutesAgo: 430
	},
	{
		profileId: 'mock-x-yugamvora',
		text: 'Anyone else get irrationally happy when their test suite goes green? Just me? Okay.',
		minutesAgo: 480
	},
	{
		profileId: 'mock-x-mannyaam',
		text: 'Internship applications are brutal. Sent out 30, heard back from 2. Keeping my head up though.',
		minutesAgo: 535
	},
	{
		profileId: 'mock-x-nanditha',
		text: 'Group projects would be fine if everyone actually communicated. End of rant.',
		minutesAgo: 595
	},
	{
		profileId: 'mock-x-ayushks',
		text: 'Spent an hour figuring out why my build was failing. Turned out I needed to run npm install. Classic.',
		minutesAgo: 660
	},
	{
		profileId: 'mock-x-ritvikt',
		text: 'My terminal prompt is way too customized at this point and I refuse to feel bad about it.',
		minutesAgo: 730
	},
	{
		profileId: 'mock-x-kieronteh',
		text: 'Just discovered tmux and I feel like I have been coding with one hand tied behind my back this whole time.',
		minutesAgo: 805
	},
	{
		profileId: 'mock-x-weilyngui',
		text: 'Finally set up proper backups after the great almost-data-loss scare of last week. Lesson learned. #backups',
		minutesAgo: 885
	},
	{
		profileId: 'mock-x-wenjing',
		text: 'Hot take: writing tests before code (TDD) actually does make you think harder about the design. I get it now.',
		minutesAgo: 970
	},
	{
		profileId: 'mock-x-suhani',
		text: "The amount of times I have googled 'git undo last commit' is genuinely embarrassing.",
		minutesAgo: 1060
	},
	{
		profileId: 'mock-x-kieronteh',
		text: 'PSA: drink water. Your future self debugging at 2am will thank you.',
		minutesAgo: 1155
	},
	{
		profileId: 'mock-x-sonali',
		text: "Reading other people's well-written code is so satisfying. It is like reading good prose.",
		minutesAgo: 1255
	},
	{
		profileId: 'mock-x-keithchan',
		text: "Hot take: the best debugging tool is still just printing things to the console. Don't @ me.",
		minutesAgo: 1360
	},
	{
		profileId: 'mock-x-ritvikt',
		text: "Exam season means my code quality drops to 'at least it compiles'. We have all been there.",
		minutesAgo: 1470
	},
	{
		profileId: 'mock-x-tayzheng',
		text: 'Someone asked me to explain monads today. I tried. We are both more confused now.',
		minutesAgo: 1585
	},
	{
		profileId: 'mock-x-ayushks',
		text: 'Why does every tutorial assume you already know the thing they are teaching? #LearnToCode',
		minutesAgo: 1705
	},
	{
		profileId: 'mock-x-nanditha',
		text: 'Finally started learning Rust. The borrow checker and I are going to be spending a lot of time together I think.',
		minutesAgo: 1830
	},
	{
		profileId: 'mock-x-huangxin',
		text: 'Reminder to myself: always commit before pulling. Learned that the hard way again today.',
		minutesAgo: 1960
	},
	{
		profileId: 'mock-x-kaiwenvoon',
		text: "Booked flights home for the holidays. Can't wait for my mom's cooking. 🍲",
		minutesAgo: 2095
	},
	{
		profileId: 'mock-x-mannyaam',
		text: 'Spent the whole afternoon debugging a race condition. The fix was one line. Of course it was.',
		minutesAgo: 2235
	},
	{
		profileId: 'mock-x-anuragroy',
		text: 'First day at the new job tomorrow. Nervous but excited. #newjob',
		minutesAgo: 2380
	},
	{
		profileId: 'mock-x-yugamvora',
		text: 'Weekend plan: build something useless and fun. Thinking a little CLI tool that roasts my Spotify playlist.',
		minutesAgo: 2530
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
