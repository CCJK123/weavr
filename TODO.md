# Weavr MVP TODO

Action checklist for implementing the MVP. Product scope, limitations, and guardrails are in `OUTLINE.md`.

> **End-of-phase verification (every phase):** run `pnpm run check`, `pnpm run lint`, then build + deploy with `npx wrangler deploy` and curl the deployed URL to verify the app works as expected. Fix anything broken before moving on.
>
> **Plan change (Phase 3 onward):** Real X OAuth and Telegram integration are deferred — the X API is pay-per-use with no free tier, and the scope is reduced to a mocked feed. The MVP now ships a mocked X (Twitter) feed seeded into the in-memory store (see Phase 3M). Phases 3–6 below are retained for reference but are deferred / out of scope for the current MVP.

## Phase 0 — Confirm baseline and create MVP primitives

- [x] Inspect `package.json`, `vite.config.ts`, `wrangler.jsonc`, `src/routes/+page.svelte`, and `src/routes/+layout.svelte` before implementation.
- [x] Create `src/lib/types.ts`.
- [x] Define `Provider` as `'x' | 'telegram'` in `src/lib/types.ts`.
- [x] Define `ConnectedAccount` in `src/lib/types.ts` with `id`, `provider`, `providerUserId`, optional `username`, optional `displayName`, optional `avatarUrl`, `status: 'connected' | 'blocked' | 'rate_limited' | 'needs_reconnect' | 'error'`, and `scopes`.
- [x] Define `Update` in `src/lib/types.ts` with `id`, `provider`, `sourceKind: 'oauth_fetch' | 'bot_message' | 'forwarded_message' | 'channel_post'`, optional `externalId`, optional `authorName`, optional `authorUsername`, optional `text`, optional `externalUrl`, `occurredAt`, `ingestedAt`, and optional `rawPayload`.
- [x] Define `ConnectorStatus` in `src/lib/types.ts` with `idle`, `connected`, `blocked`, `rate_limited`, `needs_reconnect`, `setup_required`, and `error`.
- [x] Define `XTokenMetadata` in `src/lib/types.ts` with `accessToken`, optional `refreshToken`, optional `expiresAt`, and `scopes`.
- [x] Create `src/lib/server/store.ts`.
- [x] Export fixed demo profile ID `demo-profile` from `src/lib/server/store.ts`.
- [x] Add in-memory connected-account storage to `src/lib/server/store.ts`.
- [x] Add in-memory update storage to `src/lib/server/store.ts`.
- [x] Add in-memory OAuth state storage to `src/lib/server/store.ts`.
- [x] Add in-memory Telegram `update_id` dedupe storage to `src/lib/server/store.ts`.
- [x] Add in-memory connector notice storage to `src/lib/server/store.ts` for setup-required messages.
- [x] Export store functions for listing accounts, upserting accounts, listing updates, adding updates, creating OAuth states, consuming OAuth states, checking Telegram update IDs, recording Telegram update IDs, setting connector notices, and reading connector notices.
- [x] Create `src/lib/server/config.ts`.
- [x] Add `getRequiredServerEnv(name: string): string` to `src/lib/server/config.ts`.
- [x] Make `getRequiredServerEnv` throw `Missing required environment variable: ${name}` when the requested value is absent.
- [x] Add `.env.example` with placeholders for `APP_URL`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`, `TELEGRAM_OIDC_CLIENT_ID`, `TELEGRAM_OIDC_CLIENT_SECRET`, `TELEGRAM_OIDC_REDIRECT_URI`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET_TOKEN`, and optional `TELEGRAM_DEMO_CHANNEL_ID`.
- [x] Run `pnpm run check`.
- [x] Run `pnpm run lint`.

## Phase 1 — Load local state and render the profile UI

- [x] Create `src/routes/+page.server.ts`.
- [x] Load the demo profile ID from the in-memory store in `src/routes/+page.server.ts`.
- [x] Load connected accounts from the in-memory store in `src/routes/+page.server.ts`.
- [x] Load timeline updates from the in-memory store in `src/routes/+page.server.ts`.
- [x] Derive connector statuses for X, Telegram Login, and Telegram Bot in `src/routes/+page.server.ts`.
- [x] Replace the default SvelteKit content in `src/routes/+page.svelte` with the Weavr MVP profile page.
- [x] Render the demo profile header in `src/routes/+page.svelte`.
- [x] Render the X connector action row in `src/routes/+page.svelte`.
- [x] Render the Telegram Login connector action row in `src/routes/+page.svelte`.
- [x] Render the Telegram Bot setup/action row in `src/routes/+page.svelte`.
- [x] Render Instagram as static limitation copy, not a connector action.
- [x] Render WhatsApp as static limitation copy, not a connector action.
- [x] Render the exact X copy: “Import your own public X posts where your API access allows it.”
- [x] Render the exact Telegram Login copy: “Use Telegram to identify your Weavr account.”
- [x] Render the exact Telegram Bot copy: “Send or forward messages to the Weavr bot to add them to your profile.”
- [x] Render the Telegram Channel setup copy: “Channel import requires adding the bot to a channel with permission to receive posts.”
- [x] Render the Instagram limitation copy: “Instagram media import is not part of this MVP because it requires additional Meta account setup and review.”
- [x] Render the WhatsApp limitation copy: “Weavr cannot read WhatsApp Status.”
- [x] Create `src/lib/components/ConnectorPanel.svelte`.
- [x] Move connector-row rendering into `src/lib/components/ConnectorPanel.svelte`.
- [x] Create `src/lib/components/Timeline.svelte`.
- [x] Move reverse-chronological timeline rendering by `occurredAt` into `src/lib/components/Timeline.svelte`.
- [x] Create `src/lib/components/UpdateCard.svelte`.
- [x] Move per-update source labels and update content rendering into `src/lib/components/UpdateCard.svelte`.
- [x] Render the “No connected sources yet.” empty state when no accounts exist.
- [x] Render the “Connected, waiting for updates.” empty state when accounts exist but no updates exist.
- [x] Verify the profile page renders without X or Telegram credentials configured.
- [x] Verify X and Telegram are the only connector actions.
- [x] Verify Instagram and WhatsApp appear only as static limitations.
- [x] Run `pnpm run check`.
- [x] Run `pnpm run lint`.

## Phase 2 — Prepare provider callback testing

Provider test mode decided: `claimed_cloudflare`. The local-only / local-tunnel
approach is vetoed; the app runs on Cloudflare Workers with an in-memory store
for now (data is lost when a Worker isolate recycles — demo-only).

- [x] Decide provider test mode: `claimed_cloudflare`.
- [x] Record the selected provider test mode in `README.md`.
- [x] Document `APP_URL` configuration against the claimed deployment URL in `README.md` (set the literal value once the temporary deploy is claimed).

## Phase 3M — Mock X feed (current MVP)

Real X OAuth + API access is deferred. The MVP renders a mocked X (Twitter)
feed seeded into the in-memory store so the timeline works with no provider
credentials.

- [x] Create `src/lib/server/mockData.ts` with sample X profiles and mocked tweets.
- [x] Add an idempotent `seedMockData()` that pushes mocked `Update` records into the in-memory store (safe to call from the page load).
- [x] Seed mocked X updates with `provider: 'x'`, `sourceKind: 'oauth_fetch'`, `authorUsername`, `text`, `externalUrl`, and staggered `occurredAt` timestamps.
- [x] Call `seedMockData()` from `src/routes/+page.server.ts` before listing updates.
- [x] Replace the connectors UI with a clean demo-feed page (drop the broken Connect X / Telegram buttons and the connectors section).
- [x] Remove the unused `ConnectorPanel.svelte` component.
- [x] Remove the untracked Telegram Login provider, PKCE helper, and Telegram auth routes (out of scope).
- [x] Verify the deployed Worker returns HTTP 200 and the mocked profiles render in the SSR HTML.
- [x] Run `pnpm run check`.
- [x] Run `pnpm run lint`.
- [x] Build and deploy with `npx wrangler deploy`.

## Phase 3 — Implement X OAuth and one import attempt

> Deferred in favor of the mock feed (Phase 3M). Real X OAuth routes and provider remain in the codebase but are unlinked from the UI; they require paid X API credits and worker secrets to function.

- [x] Create `src/lib/server/providers/x.ts`.
- [x] Add X constants for `https://x.com/i/oauth2/authorize`, `https://api.x.com/2/oauth2/token`, `https://api.x.com/2`, and scopes `tweet.read users.read offline.access`.
- [x] Add lazy X config readers for `APP_URL`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, and `X_REDIRECT_URI`.
- [x] Validate that `X_REDIRECT_URI` equals `${APP_URL}/api/auth/x/callback` in the X config reader.
- [x] Add a PKCE verifier generator in `src/lib/server/providers/x.ts` or a small shared server helper.
- [x] Add a PKCE `S256` challenge generator in `src/lib/server/providers/x.ts` or a small shared server helper.
- [x] Create `src/routes/api/auth/x/start/+server.ts`.
- [x] Generate a PKCE verifier in `/api/auth/x/start`.
- [x] Generate a PKCE `S256` challenge in `/api/auth/x/start`.
- [x] Generate a CSRF `state` in `/api/auth/x/start`.
- [x] Store the X OAuth `state` and PKCE verifier in the in-memory store with a 10-minute expiry.
- [x] Redirect `/api/auth/x/start` to the X authorization URL with scopes exactly `tweet.read users.read offline.access`.
- [x] Wire the X connector action row to `/api/auth/x/start`.
- [x] Create `src/routes/api/auth/x/callback/+server.ts`.
- [x] Validate the returned X OAuth `state` in `/api/auth/x/callback`.
- [x] Exchange the returned X OAuth code at `https://api.x.com/2/oauth2/token`.
- [x] Fetch the connected X profile from `/2/users/me` with `user.fields=id,name,username,profile_image_url`.
- [x] Store the connected X account and token metadata in the in-memory store after the X provider user ID is known.
- [x] Store X token metadata in memory using the `XTokenMetadata` fields.
- [x] Update the X connector row with the connected X profile username, display name, and avatar URL when available.
- [x] Attempt one recent-post fetch from `/2/users/:id/tweets` with `max_results=5` after successful X connection.
- [x] Normalize fetched X posts into `Update` records when X API access allows post import.
- [x] Store normalized X updates in the in-memory store.
- [x] Set X status to `blocked` for X 403 responses or X endpoint-access errors during recent-post import.
- [x] Render “X is connected, but this API tier does not allow post import yet.” when X status is `blocked`.
- [x] Set X status to `rate_limited` when X returns a rate-limit response.
- [x] Set X status to `needs_reconnect` for invalid or expired token responses.
- [x] Set X status to `error` for non-rate-limit, non-token X profile/import failures.
- [ ] Start the local app or selected callback test environment before real X OAuth validation.
- [ ] Verify the X app callback URL matches `${APP_URL}/api/auth/x/callback` before real X OAuth testing.
- [ ] Verify no fake X imports are created when X API access is unavailable.
- [ ] Verify X imported posts appear in the same timeline as existing Telegram updates.
- [x] Run `pnpm run check`.
- [x] Run `pnpm run lint`.

## Phase 4 — Implement Telegram Login identity

> Deferred — out of scope for the current mock-feed MVP.

- [x] Select `/api/auth/telegram/start` and `/api/auth/telegram/callback` as the Telegram Login/OIDC route paths for the local MVP.
- [x] Create `src/lib/server/providers/telegramLogin.ts`.
- [x] Select Telegram OIDC Authorization Code with PKCE as the Telegram identity flow for the local MVP.
- [x] Add Telegram Login/OIDC constants for issuer `https://oauth.telegram.org`, authorization URL `https://oauth.telegram.org/auth`, token URL `https://oauth.telegram.org/token`, redirect URI from `TELEGRAM_OIDC_REDIRECT_URI`, and scopes `openid profile`.
- [x] Add Telegram Login/OIDC helpers for auth URL creation, token exchange, and server-side identity validation.
- [x] Validate Telegram identity by checking signature or token validity, issuer, audience/client ID, expiry, issued-at time, nonce, and OAuth state.
- [x] Add lazy Telegram Login config readers for `TELEGRAM_OIDC_CLIENT_ID`, `TELEGRAM_OIDC_CLIENT_SECRET`, and `TELEGRAM_OIDC_REDIRECT_URI`.
- [x] Create `src/routes/api/auth/telegram/start/+server.ts`.
- [x] Create `src/routes/api/auth/telegram/callback/+server.ts`.
- [x] Request Telegram Login scopes exactly `openid profile`.
- [x] Validate the returned Telegram identity server-side.
- [x] Store the connected Telegram account in the in-memory store.
- [x] Store Telegram user ID, username, name, and avatar URL when available.
- [x] Wire the Telegram Login connector action row to the Telegram Login start route.
- [ ] Verify Telegram Login allowed URLs match the selected Telegram Login callback URL before real Telegram Login testing.
- [x] Render the connected Telegram name, username, and avatar URL when available.
- [x] Verify Telegram Login does not request private chat access.
- [x] Verify Telegram Login does not request contact access.
- [x] Verify Telegram Login does not request phone-number access.
- [x] Verify Telegram Login does not imply access to friends’ private updates.
- [x] Verify Telegram Login does not imply Telegram Stories support.
- [x] Verify Telegram profile-photo media is not downloaded or stored.
- [x] Run `pnpm run check`.
- [x] Run `pnpm run lint`.

## Phase 5 — Implement Telegram bot ingestion

> Deferred — out of scope for the current mock-feed MVP.

- [ ] Create `src/lib/server/providers/telegramBot.ts`.
- [ ] Add Telegram Bot API constants and Telegram update parsing helpers to `src/lib/server/providers/telegramBot.ts`.
- [ ] Add lazy Telegram bot config readers for `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET_TOKEN`, and optional `TELEGRAM_DEMO_CHANNEL_ID`.
- [ ] Create `src/lib/server/providers/telegramBotFixtures.ts` with representative direct-message, forwarded-message, and duplicate-`update_id` payloads.
- [ ] Create `src/routes/api/webhooks/telegram/+server.ts`.
- [ ] Accept Telegram Bot API `POST` updates in `/api/webhooks/telegram`.
- [ ] Verify `X-Telegram-Bot-Api-Secret-Token` in `/api/webhooks/telegram`.
- [ ] Return HTTP 401 JSON `{ "error": "unauthorized" }` for missing or invalid Telegram webhook secret tokens.
- [ ] Ignore duplicate Telegram webhook deliveries using the in-memory `update_id` dedupe store.
- [ ] Record new Telegram `update_id` values in the in-memory dedupe store.
- [ ] Parse direct Telegram `message` updates.
- [ ] Extract Telegram `message.message_id`, `message.chat.id`, `message.from.id`, `message.from.username`, `message.from.first_name`, `message.from.last_name`, `message.date`, `message.text`, and `message.caption` from direct messages.
- [ ] Normalize direct Telegram messages into `Update` records with `sourceKind: 'bot_message'`.
- [ ] Parse forwarded Telegram messages when Telegram includes forwarding metadata.
- [ ] Extract Telegram `message.forward_origin.type` plus available user, chat, or channel fields from forwarded messages.
- [ ] Normalize forwarded Telegram messages into `Update` records with `sourceKind: 'forwarded_message'`.
- [ ] Tolerate missing Telegram forward-origin data caused by Telegram privacy settings.
- [ ] Parse Telegram `channel_post` updates.
- [ ] Normalize Telegram `channel_post` updates only when `TELEGRAM_DEMO_CHANNEL_ID` is configured and matches `channel_post.chat.id`.
- [ ] Set the Telegram Bot connector notice to “Channel import requires adding the bot to a channel with permission to receive posts.” when `TELEGRAM_DEMO_CHANNEL_ID` is missing or does not match the received channel post.
- [ ] Render the Telegram Bot connector notice in the Telegram Bot connector row.
- [ ] Store normalized Telegram updates in the in-memory store.
- [ ] Persist only Telegram text and caption content for the MVP.
- [ ] Verify Telegram file downloads are not implemented.
- [ ] Verify R2 or other media persistence is not added.
- [ ] Verify the Telegram bot webhook URL matches `${APP_URL}/api/webhooks/telegram` before real Telegram webhook testing.
- [ ] Validate `/api/webhooks/telegram` locally with the direct-message payload from `telegramBotFixtures.ts`.
- [ ] Validate `/api/webhooks/telegram` locally with the forwarded-message payload from `telegramBotFixtures.ts`.
- [ ] Validate `/api/webhooks/telegram` locally with the duplicate-`update_id` payload from `telegramBotFixtures.ts`.
- [ ] Configure Telegram Bot API `setWebhook` for `${APP_URL}/api/webhooks/telegram` before real Telegram webhook testing.
- [ ] Validate `/api/webhooks/telegram` with a real Telegram webhook or record the missing stable-HTTPS blocker in `README.md`.
- [ ] Verify direct Telegram bot messages appear in the timeline.
- [ ] Verify forwarded Telegram bot messages appear in the timeline.
- [ ] Verify unsupported Telegram update types are ignored safely and recorded with `console.warn`.
- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run lint`.

## Phase 6 — Document and run the demo

> Partially superseded. The README is updated for the mock-feed MVP below; the full live-demo checklist is deferred until real providers are reintroduced.

- [ ] Update `README.md` with the local development command.
- [ ] Update `README.md` with feature-specific env var placeholders and descriptions.
- [ ] Update `README.md` with the X app callback URL requirement.
- [ ] Update `README.md` with the Telegram Login setup requirement.
- [ ] Update `README.md` with the Telegram bot setup requirement.
- [ ] Update `README.md` with the warning that temporary Cloudflare deploys are for UI smoke tests only.
- [ ] Update `README.md` with the requirement for a stable HTTPS URL before real OAuth or webhook testing.
- [ ] Add a README demo checklist for connecting Telegram identity.
- [ ] Add a README demo checklist step for sending or simulating a Telegram bot message.
- [ ] Add a README demo checklist step for connecting X or showing the X API-tier blocked state.
- [ ] Add a README demo checklist step for confirming X and Telegram updates render together.
- [ ] Run the local app with `pnpm run dev`.
- [ ] Open the Weavr profile page at `http://localhost:5173/`.
- [ ] Connect Telegram identity or document the real Telegram identity testing blocker in `README.md`.
- [ ] Send a real Telegram bot message or POST a representative local test payload and verify the resulting update appears in the timeline.
- [ ] Document simulated Telegram updates as local endpoint tests rather than live provider imports.
- [ ] Connect X or document the real X OAuth testing blocker in `README.md`.
- [ ] Import X posts or verify the X API-tier blocked state appears.
- [ ] Verify one profile timeline renders normalized X and Telegram updates together, or document the unavailable source blocker in `README.md`.
- [ ] Verify WhatsApp Status rejection is explicit and not presented as a connector.
- [ ] Verify Instagram remains a static limitation only and not a connector.
- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run lint`.
- [ ] Run `pnpm run build`.
