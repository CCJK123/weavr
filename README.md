# weavr

A minimal SvelteKit app using TypeScript, ESLint, Prettier, and pnpm.

## Prerequisites

This project uses pnpm. If pnpm is not already available, enable it with Corepack.

On Windows, open Command Prompt as Administrator, navigate to this repository, then run:

```sh
corepack enable pnpm
corepack use pnpm@latest-11
```

## Install dependencies

```sh
pnpm install
```

## Develop

Start the development server:

```sh
pnpm run dev
```

Start the development server and open the app in a browser:

```sh
pnpm run dev -- --open
```

## Validate

Run type and Svelte checks:

```sh
pnpm run check
```

Run formatting and lint checks:

```sh
pnpm run lint
```

Format files:

```sh
pnpm run format
```

## Build

Create a production build:

```sh
pnpm run build
```

Preview the production build locally:

```sh
pnpm run preview
```

## Cloudflare Workers deploy (provider test mode: `claimed_cloudflare`)

Weavr runs on Cloudflare Workers via `@sveltejs/adapter-cloudflare`. The MVP
uses an in-memory store inside the Worker, so data is lost when a Worker
isolate recycles — this is demo-only until durable storage is added.

Real X OAuth callbacks and Telegram webhooks need a stable HTTPS URL, so the
provider test mode is `claimed_cloudflare` (the local-only / local-tunnel
approach is vetoed): deploy a temporary Worker, then claim it to your
Cloudflare account so it persists.

### Deploy and claim

```sh
pnpm run deploy:temporary
```

Wrangler prints two URLs:

- a **deployment URL** (the live site), and
- a **claim URL** (opens the Cloudflare dashboard).

Open the claim URL in your browser while signed into your Cloudflare account
**before the 60-minute window expires**. Claiming attaches the temporary
deployment to your account so it becomes a persistent HTTPS URL you can use
for OAuth redirect URIs and webhook registration.

### Configure `APP_URL`

After claiming, set `APP_URL` to the claimed deployment URL. The X and
Telegram callback helpers read this to build redirect URIs:

```sh
APP_URL=https://weavr.mountainous-turret.workers.dev
```

> Current claimed deployment: `https://weavr.mountainous-turret.workers.dev`.
> `APP_URL` is read lazily via `$env/dynamic/private`, so it is only needed
> once Phase 3 (X OAuth) lands; the profile page renders without it. Set it
> as a Worker secret (`wrangler secret put APP_URL`) or in local `.env`.

Provider-specific values (`X_CLIENT_ID`, `X_REDIRECT_URI`,
`TELEGRAM_OIDC_CLIENT_ID`, `TELEGRAM_OIDC_CLIENT_SECRET`,
`TELEGRAM_OIDC_REDIRECT_URI`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_WEBHOOK_SECRET_TOKEN`, optional `TELEGRAM_DEMO_CHANNEL_ID`) are
added in later phases. The profile page renders without any provider
credentials configured.

> Unclaimed temporary deploys expire in 60 minutes and are for quick UI smoke
> tests only. Always claim before real OAuth or webhook testing.
