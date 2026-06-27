# Weavr Ingress MVP

Self-contained MVP for X + Telegram ingress. It keeps the work in this subdirectory so other teammates can use the rest of the repository independently.

## Run

```bash
npm start
```

Open `http://localhost:3030`.

## Optional Environment

```bash
BASE_URL=http://localhost:3030
X_CLIENT_ID=...
X_CLIENT_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
```

## Implemented

- X OAuth 2.0 Authorization Code Flow with PKCE.
- X scopes limited to `tweet.read users.read offline.access`.
- Clear X blocked state when credentials/API tier do not allow import.
- Telegram Login callback validation using the bot token signature model.
- Telegram demo login for local testing.
- Telegram webhook endpoint at `/api/webhooks/telegram`.
- Normalization for bot messages, forwarded messages, and channel posts into `updates`.
- Unified profile timeline for normalized X and Telegram updates.
- Explicit Instagram deferral and WhatsApp Status rejection.

## Data Entities

The MVP keeps in-memory versions of:

- `connected_accounts`
- `external_profiles`
- `updates`
- `sync_runs`

Before public launch, token storage should move behind encrypted server-only persistence.
