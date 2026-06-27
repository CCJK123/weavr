import type { PageServerLoad } from './$types';
import { DEMO_PROFILE_ID, listAccounts, listUpdates } from '$lib/server/store';
import { seedMockData } from '$lib/server/mockData';

export const load: PageServerLoad = () => {
	// Seed the mocked X feed into the in-memory store (idempotent per isolate).
	seedMockData();

	const accounts = listAccounts();
	const updates = [...listUpdates()].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

	return {
		profileId: DEMO_PROFILE_ID,
		accounts,
		updates
	};
};
