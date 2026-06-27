# Weavr MVP TODO

Action checklist for implementing the MVP. Product scope, limitations, and guardrails are in `OUTLINE.md`.

> **End-of-phase verification (every phase):** run `pnpm run check`, `pnpm run lint`, then build + temporarily deploy with `pnpm run deploy:temporary` and curl the deployed URL to verify the app works as expected. Fix anything broken before moving on. Note: a freshly deployed temporary worker may need ~30s before its TLS cert responds.

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

- [ ] Create `src/routes/+page.server.ts`.
- [ ] Load the demo profile ID from the in-memory store in `src/routes/+page.server.ts`.
- [ ] Load connected accounts from the in-memory store in `src/routes/+page.server.ts`.
- [ ] Load timeline updates from the in-memory store in `src/routes/+page.server.ts`.
- [ ] Derive connector statuses for X, Telegram Login, and Telegram Bot in `src/routes/+page.server.ts`.
- [ ] Replace the default SvelteKit content in `src/routes/+page.svelte` with the Weavr MVP profile page.
- [ ] Render the demo profile header in `src/routes/+page.svelte`.
- [ ] Render the X connector action row in `src/routes/+page.svelte`.
- [ ] Render the Telegram Login connector action row in `src/routes/+page.svelte`.
- [ ] Render the Telegram Bot setup/action row in `src/routes/+page.svelte`.
- [ ] Render Instagram as static limitation copy, not a connector action.
- [ ] Render WhatsApp as static limitation copy, not a connector action.
- [ ] Render the exact X copy: “Import your own public X posts where your API access allows it.”
- [ ] Render the exact Telegram Login copy: “Use Telegram to identify your Weavr account.”
- [ ] Render the exact Telegram Bot copy: “Send or forward messages to the Weavr bot to add them to your profile.”
- [ ] Render the Telegram Channel setup copy: “Channel import requires adding the bot to a channel with permission to receive posts.”
- [ ] Render the Instagram limitation copy: “Instagram media import is not part of this MVP because it requires additional Meta account setup and review.”
- [ ] Render the WhatsApp limitation copy: “Weavr cannot read WhatsApp Status.”
- [ ] Create `src/lib/components/ConnectorPanel.svelte`.
- [ ] Move connector-row rendering into `src/lib/components/ConnectorPanel.svelte`.
- [ ] Create `src/lib/components/Timeline.svelte`.
- [ ] Move reverse-chronological timeline rendering by `occurredAt` into `src/lib/components/Timeline.svelte`.
- [ ] Create `src/lib/components/UpdateCard.svelte`.
- [ ] Move per-update source labels and update content rendering into `src/lib/components/UpdateCard.svelte`.
- [ ] Render the “No connected sources yet.” empty state when no accounts exist.
- [ ] Render the “Connected, waiting for updates.” empty state when accounts exist but no updates exist.
- [ ] Verify the profile page renders without X or Telegram credentials configured.
- [ ] Verify X and Telegram are the only connector actions.
- [ ] Verify Instagram and WhatsApp appear only as static limitations.
- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run lint`.

## Phase 2 — Prepare provider callback testing

- [ ] Decide with the user whether real provider testing will use `local_tunnel` or `claimed_cloudflare` mode.
- [ ] Record the selected provider test mode in `README.md`.
- [ ] Configure `APP_URL` to match the selected test mode.

## Phase 3 — Implement X OAuth and one import attempt

- [ ] Create `src/lib/server/providers/x.ts`.
- [ ] Add X constants for `https://x.com/i/oauth2/authorize`, `https://api.x.com/2/oauth2/token`, `https://api.x.com/2`, and scopes `tweet.read users.read offline.access`.
- [ ] Add lazy X config readers for `APP_URL`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, and `X_REDIRECT_URI`.
- [ ] Validate that `X_REDIRECT_URI` equals `${APP_URL}/api/auth/x/callback` in the X config reader.
- [ ] Add a PKCE verifier generator in `src/lib/server/providers/x.ts` or a small shared server helper.
- [ ] Add a PKCE `S256` challenge generator in `src/lib/server/providers/x.ts` or a small shared server helper.
- [ ] Create `src/routes/api/auth/x/start/+server.ts`.
- [ ] Generate a PKCE verifier in `/api/auth/x/start`.
- [ ] Generate a PKCE `S256` challenge in `/api/auth/x/start`.
- [ ] Generate a CSRF `state` in `/api/auth/x/start`.
- [ ] Store the X OAuth `state` and PKCE verifier in the in-memory store with a 10-minute expiry.
- [ ] Redirect `/api/auth/x/start` to the X authorization URL with scopes exactly `tweet.read users.read offline.access`.
- [ ] Wire the X connector action row to `/api/auth/x/start`.
- [ ] Create `src/routes/api/auth/x/callback/+server.ts`.
- [ ] Validate the returned X OAuth `state` in `/api/auth/x/callback`.
- [ ] Exchange the returned X OAuth code at `https://api.x.com/2/oauth2/token`.
- [ ] Fetch the connected X profile from `/2/users/me` with `user.fields=id,name,username,profile_image_url`.
- [ ] Store the connected X account and token metadata in the in-memory store after the X provider user ID is known.
- [ ] Store X token metadata in memory using the `XTokenMetadata` fields.
- [ ] Update the X connector row with the connected X profile username, display name, and avatar URL when available.
- [ ] Attempt one recent-post fetch from `/2/users/:id/tweets` with `max_results=5` after successful X connection.
- [ ] Normalize fetched X posts into `Update` records when X API access allows post import.
- [ ] Store normalized X updates in the in-memory store.
- [ ] Set X status to `blocked` for X 403 responses or X endpoint-access errors during recent-post import.
- [ ] Render “X is connected, but this API tier does not allow post import yet.” when X status is `blocked`.
- [ ] Set X status to `rate_limited` when X returns a rate-limit response.
- [ ] Set X status to `needs_reconnect` for invalid or expired token responses.
- [ ] Set X status to `error` for non-rate-limit, non-token X profile/import failures.
- [ ] Start the local app or selected callback test environment before real X OAuth validation.
- [ ] Verify the X app callback URL matches `${APP_URL}/api/auth/x/callback` before real X OAuth testing.
- [ ] Verify no fake X imports are created when X API access is unavailable.
- [ ] Verify X imported posts appear in the same timeline as existing Telegram updates.
- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run lint`.

## Phase 4 — Implement Telegram Login identity

- [ ] Select `/api/auth/telegram/start` and `/api/auth/telegram/callback` as the Telegram Login/OIDC route paths for the local MVP.
- [ ] Create `src/lib/server/providers/telegramLogin.ts`.
- [ ] Select Telegram OIDC Authorization Code with PKCE as the Telegram identity flow for the local MVP.
- [ ] Add Telegram Login/OIDC constants for issuer `https://oauth.telegram.org`, authorization URL `https://oauth.telegram.org/auth`, token URL `https://oauth.telegram.org/token`, redirect URI from `TELEGRAM_OIDC_REDIRECT_URI`, and scopes `openid profile`.
- [ ] Add Telegram Login/OIDC helpers for auth URL creation, token exchange, and server-side identity validation.
- [ ] Validate Telegram identity by checking signature or token validity, issuer, audience/client ID, expiry, issued-at time, nonce, and OAuth state.
- [ ] Add lazy Telegram Login config readers for `TELEGRAM_OIDC_CLIENT_ID`, `TELEGRAM_OIDC_CLIENT_SECRET`, and `TELEGRAM_OIDC_REDIRECT_URI`.
- [ ] Create `src/routes/api/auth/telegram/start/+server.ts`.
- [ ] Create `src/routes/api/auth/telegram/callback/+server.ts`.
- [ ] Request Telegram Login scopes exactly `openid profile`.
- [ ] Validate the returned Telegram identity server-side.
- [ ] Store the connected Telegram account in the in-memory store.
- [ ] Store Telegram user ID, username, name, and avatar URL when available.
- [ ] Wire the Telegram Login connector action row to the Telegram Login start route.
- [ ] Verify Telegram Login allowed URLs match the selected Telegram Login callback URL before real Telegram Login testing.
- [ ] Render the connected Telegram name, username, and avatar URL when available.
- [ ] Verify Telegram Login does not request private chat access.
- [ ] Verify Telegram Login does not request contact access.
- [ ] Verify Telegram Login does not request phone-number access.
- [ ] Verify Telegram Login does not imply access to friends’ private updates.
- [ ] Verify Telegram Login does not imply Telegram Stories support.
- [ ] Verify Telegram profile-photo media is not downloaded or stored.
- [ ] Run `pnpm run check`.
- [ ] Run `pnpm run lint`.

## Phase 5 — Implement Telegram bot ingestion

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
