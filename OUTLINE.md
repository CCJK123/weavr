# Weavr MVP Ingress Plan: X + Telegram

## Summary

Revise Weavr’s MVP ingress around **X** and **Telegram** as the first connectors. Do **not** use GitHub as a main connector, and do **not** make Instagram the first connector because Instagram media ingress typically requires Business/Creator account setup and Meta review.

Updated product language:

> Connect X and Telegram to bring your own public posts, forwarded updates, and channel posts into one Weavr profile.

Primary MVP proof:

- X can connect through OAuth 2.0 Authorization Code Flow with PKCE.
- Telegram Login identifies the user.
- A Weavr Telegram bot can receive a sent or forwarded text/caption message and normalize it into `updates`.
- Weavr renders normalized X/Telegram updates in one profile timeline.

Official references used:

- [X OAuth 2.0 Authorization Code Flow with PKCE](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code)
- [Telegram Login / OIDC](https://core.telegram.org/bots/telegram-login)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## MVP Scope and Implementation Guardrails

`TODO.md` is the actionable implementation checklist. Scope constraints, provider limitations, and implementation policies live here.

- Build one local/demo Weavr profile first.
- Use X and Telegram as the only MVP connector actions.
- Use X OAuth 2.0 Authorization Code Flow with PKCE and scopes `tweet.read users.read offline.access`.
- Use Telegram Login/OIDC for identity with scopes `openid profile`.
- Use Telegram Bot API ingestion for sent/forwarded bot messages, and handle channel posts only when bot/channel setup is available.
- Keep ingestion text/caption-first for the MVP.
- Do not build media storage, GitHub, Instagram, WhatsApp, multi-user auth, D1, KV, R2, migrations, repository layers, or database abstractions in the first local pass.
- Show Instagram and WhatsApp only as static limitation notes, not connector actions.
- Do not claim access to Instagram media without Meta setup/review.
- Do not claim access to WhatsApp Status or friends’ WhatsApp updates.
- Do not claim access to private Telegram chats, contacts, phone numbers, friends’ private updates, or Telegram Stories.
- Do not fake live provider data.
- If X API access blocks post import, show the blocked state explicitly.
- If Telegram channel setup is unavailable, show the setup requirement explicitly.
- Run the first implementation locally with an in-memory server store; local MVP data may disappear when the dev server restarts.
- Treat `wrangler deploy --temporary` as a UI smoke-test tool only.
- Use a stable HTTPS URL for real X callbacks and Telegram webhooks, either through a claimed/stable deployment or a user-authorized local tunnel.
- Do not install packages or configure paid/external services without user authorization.
- Read provider credentials only in routes/features that require them; the profile page should render without provider credentials.
- Store tokens only in server-side memory for this local MVP. Token storage must be encrypted or abstracted behind server-only durable storage before public launch.
- Use Svelte 5 syntax for new Svelte files because `vite.config.ts` forces runes mode.

## Connector Decisions

| Provider                    |          MVP Status | Decision                                                                          |
| --------------------------- | ------------------: | --------------------------------------------------------------------------------- |
| X                           |   Primary connector | OAuth 2.0 PKCE, minimal scopes, fetch profile and recent posts where tier permits |
| Telegram                    |   Primary connector | Telegram Login/OIDC for identity plus bot/channel ingestion                       |
| Instagram                   |            Deferred | Not first connector due to Business/Creator and Meta setup/review friction        |
| GitHub                      |            Deferred | Not a main connector for this MVP                                                 |
| WhatsApp Status             | Explicitly rejected | No automated status/friend update ingestion                                       |
| WhatsApp manual/share-sheet |               Later | Possible future import path only                                                  |

### X Connector

Implement:

- OAuth 2.0 Authorization Code Flow with PKCE.
- Scopes: `tweet.read users.read offline.access`.
- Store access token, refresh token, expiry, provider user ID, username, display name, and avatar if available.
- Fetch connected user profile.
- Fetch recent posts where API tier permits.
- Normalize posts into `updates`.

UI states:

- `Connect X`
- `Connected`
- `Syncing`
- `API access blocked`
- `Rate limited`
- `Needs reconnect`

If API access blocks tweet fetching, the app must show a clear state:

> X is connected, but this API tier does not allow post import yet.

Do not silently fake live X imports as connected data.

### Telegram Connector

Implement:

- Telegram Login / OIDC using scopes `openid profile`.
- Store Telegram user ID, username, name, and avatar/profile-photo URL when available.
- Create a Weavr Telegram bot for ingestion.
- Add a webhook endpoint to receive Bot API updates.
- Normalize supported bot updates into `updates`.

MVP ingestion modes:

1. User sends or forwards a Telegram text/caption message to the Weavr bot.
2. User connects a Telegram channel where the bot can read channel posts.
3. Bot/channel updates are normalized into Weavr timeline updates.

Do not claim:

- Weavr can automatically read private Telegram chats.
- Weavr can access contacts.
- Weavr can read friends’ private updates.
- Telegram Stories are supported today.

Telegram Stories API should be listed as future research only.

### WhatsApp Status Rejection

Explicit product and implementation rule:

- WhatsApp Status is **not** a primary MVP connector.
- WhatsApp Business/Cloud APIs are for business messaging and webhook workflows, not consumer WhatsApp Status ingestion.
- Weavr must not promise it can read WhatsApp statuses or friends’ WhatsApp updates.
- WhatsApp can be considered later as a manual/share-sheet import path, not as automated connector ingestion.

## Data Model Changes

These are durable/public-launch data model targets. The first local MVP checklist in `TODO.md` uses a smaller in-memory shape with only X and Telegram providers, no migrations, and no database abstractions.

### `connected_accounts`

Stores authenticated provider connections.

| Field                   | Type                                             | Required |
| ----------------------- | ------------------------------------------------ | -------- |
| id                      | uuid/string                                      | yes      |
| user_id                 | uuid/string                                      | yes      |
| provider                | `x` \| `telegram`                                | yes      |
| provider_user_id        | string                                           | yes      |
| username                | string                                           | optional |
| display_name            | string                                           | optional |
| avatar_url              | string                                           | optional |
| access_token_encrypted  | string                                           | optional |
| refresh_token_encrypted | string                                           | optional |
| token_expires_at        | datetime                                         | optional |
| scopes                  | string[]                                         | yes      |
| status                  | `connected` \| `blocked` \| `expired` \| `error` | yes      |
| last_synced_at          | datetime                                         | optional |
| created_at              | datetime                                         | yes      |
| updated_at              | datetime                                         | yes      |

### `external_profiles`

Stores non-authenticated profile links. Not implemented in the first local MVP checklist.

| Field      | Type                      | Required |
| ---------- | ------------------------- | -------- |
| id         | uuid/string               | yes      |
| user_id    | uuid/string               | yes      |
| provider   | `x` \| `telegram`         | yes      |
| url        | string                    | yes      |
| label      | string                    | optional |
| status     | `linked` \| `unsupported` | yes      |
| created_at | datetime                  | yes      |

### `updates`

Normalized timeline entries from X and Telegram for the local MVP, with room for future providers after the MVP.

| Field                | Type                                                                    | Required                                |
| -------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| id                   | uuid/string                                                             | yes                                     |
| user_id              | uuid/string                                                             | yes                                     |
| connected_account_id | uuid/string                                                             | optional                                |
| provider             | `x` \| `telegram`                                                       | yes                                     |
| source_kind          | `oauth_fetch` \| `bot_message` \| `channel_post` \| `forwarded_message` | yes                                     |
| external_id          | string                                                                  | optional                                |
| author_name          | string                                                                  | optional                                |
| author_username      | string                                                                  | optional                                |
| text                 | string                                                                  | optional                                |
| media_urls           | string[]                                                                | optional; future media persistence only |
| external_url         | string                                                                  | optional                                |
| occurred_at          | datetime                                                                | yes                                     |
| ingested_at          | datetime                                                                | yes                                     |
| visibility           | `private` \| `public_link`                                              | yes                                     |
| raw_payload          | json                                                                    | optional                                |

### `sync_runs`

Tracks connector sync attempts.

| Field                | Type                                                | Required |
| -------------------- | --------------------------------------------------- | -------- |
| id                   | uuid/string                                         | yes      |
| connected_account_id | uuid/string                                         | yes      |
| provider             | `x` \| `telegram`                                   | yes      |
| status               | `success` \| `blocked` \| `rate_limited` \| `error` | yes      |
| started_at           | datetime                                            | yes      |
| finished_at          | datetime                                            | optional |
| updates_created      | number                                              | yes      |
| error_code           | string                                              | optional |
| error_message        | string                                              | optional |

Provider enum:

```ts
type Provider = 'x' | 'telegram';
```

## Implementation Plan

### Phase 0: App Foundation

- Build Weavr profile timeline around normalized `updates`.
- Add connector status UI.
- Add empty states for “No connected sources yet” and “Connected, waiting for updates.”
- Keep Instagram and WhatsApp visible only as deferred/unsupported explanatory rows.

Acceptance:

- Timeline renders empty states before live provider data is available and renders normalized updates once the in-memory store contains provider updates.
- Connector dashboard shows X and Telegram as primary actions.

### Phase 1: X OAuth

- Add `/api/auth/x/start`.
- Generate PKCE verifier/challenge and CSRF `state`.
- Redirect to X authorization URL with scopes `tweet.read users.read offline.access`.
- Add `/api/auth/x/callback`.
- Exchange code for tokens.
- Store account in `connected_accounts`.
- Fetch X user profile.
- Attempt recent post fetch where API tier permits.
- Record each attempt in the local in-memory store for the first MVP; use durable `sync_runs` only after durable storage is introduced.
- Normalize fetched posts into `updates`.

Acceptance:

- X connect path works end to end, or fails into a clear “API access blocked” state.
- Connected X profile appears in Weavr.
- If posts are available, they render in the timeline as X updates.

### Phase 2: Telegram Login

- Add Telegram Login/OIDC button.
- Request scopes `openid profile`.
- Validate ID token server-side.
- Store Telegram identity in `connected_accounts`.
- Show connected Telegram avatar URL/name/username when available.

Acceptance:

- Telegram Login works.
- Telegram account appears as connected.
- No private chats or contacts are requested.

### Phase 3: Telegram Bot Ingestion

- Create/configure Weavr Telegram bot through BotFather.
- Add webhook endpoint `/api/webhooks/telegram`.
- Verify webhook secret/token.
- Handle Bot API `message` updates for direct bot messages.
- Handle forwarded messages using available origin metadata.
- Handle `channel_post` updates when bot is added to a channel with permissions.
- Normalize text, caption, sender/channel metadata, and timestamp into `updates`; defer file downloads and durable media storage.

Acceptance:

- User can send at least one message to the bot and see it in Weavr.
- User can forward at least one Telegram text/caption message to the bot and see it in Weavr.
- If bot is added to a channel, at least one channel post can appear in Weavr.
- Unsupported Telegram updates are safely ignored and logged.

### Phase 4: Trust, Polish, Demo

- Add source badges for MVP update sources: `X · Connected`, `Telegram · Bot`, and `Telegram · Channel`.
- Add connector limitation copy.
- Add sync/error states.
- Add responsive QA for mobile and desktop.
- Prepare demo path: Connect Telegram → send/forward message → see update → connect X or show blocked-by-tier state → unified profile timeline.

Acceptance:

- Product does not overpromise platform access.
- WhatsApp Status rejection is explicit.
- X/Telegram updates render in one normalized profile timeline.

## UI Copy Requirements

Use this connector copy:

- X: “Import your own public X posts where your API access allows it.”
- Telegram Login: “Use Telegram to identify your Weavr account.”
- Telegram Bot: “Send or forward messages to the Weavr bot to add them to your profile.”
- Telegram Channel: “Channel import requires adding the bot to a channel with permission to receive posts.”
- Instagram: “Instagram media import is not part of this MVP because it requires additional Meta account setup and review.”
- WhatsApp: “Weavr cannot read WhatsApp Status.”

## Acceptance Criteria For Today

- X OAuth path is implemented, or blocked only by API access with a clear UI state.
- X uses OAuth 2.0 Authorization Code Flow with PKCE.
- X scopes are limited to `tweet.read users.read offline.access`.
- Telegram Login works with `openid profile`.
- Telegram connected account stores user ID, username, name, and avatar URL when available.
- Telegram bot receives at least one sent or forwarded message.
- Received Telegram bot message is written into `updates`.
- Telegram channel post ingestion is implemented if bot/channel setup is available; otherwise UI shows exact setup requirement.
- Weavr profile renders normalized X and Telegram updates together.
- WhatsApp Status is explicitly rejected as an automated MVP connector.
- The app does not claim access to Instagram media, private Telegram chats, WhatsApp Status, contacts, or friends’ private updates.

## Assumptions

- The MVP represents the connected user’s own Weavr profile first.
- X API tier may block recent post fetches; this is acceptable only if the blocked state is explicit.
- Telegram Bot API webhook setup is available for the deployed app.
- Token storage must be encrypted or abstracted behind a server-only storage layer before public launch.
- Instagram and WhatsApp remain visible only as static limitation notes, not working connectors.
