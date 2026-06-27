import type { PageServerLoad } from './$types';
import { DEMO_PROFILE_ID, listAccounts, listUpdates, getConnectorNotice } from '$lib/server/store';
import type { ConnectorStatus } from '$lib/types';

export const load: PageServerLoad = () => {
	const accounts = listAccounts();
	const updates = [...listUpdates()].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

	const xAccount = accounts.find((a) => a.provider === 'x');
	const telegramAccount = accounts.find((a) => a.provider === 'telegram');

	return {
		profileId: DEMO_PROFILE_ID,
		accounts,
		updates,
		connectors: {
			x: {
				status: (xAccount?.status ?? 'idle') as ConnectorStatus,
				notice: getConnectorNotice('x'),
				username: xAccount?.username,
				displayName: xAccount?.displayName,
				avatarUrl: xAccount?.avatarUrl
			},
			telegramLogin: {
				status: (telegramAccount?.status ?? 'idle') as ConnectorStatus,
				notice: undefined as string | undefined
			},
			telegramBot: {
				status: 'setup_required' as ConnectorStatus,
				notice: getConnectorNotice('telegram')
			}
		}
	};
};
