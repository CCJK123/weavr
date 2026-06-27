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

## Cloudflare Workers deploy

Weavr runs on Cloudflare Workers via `@sveltejs/adapter-cloudflare`. The MVP
uses an in-memory store inside the Worker, so data is lost when a Worker
isolate recycles — this is demo-only until durable storage is added.

### Deploy

```sh
pnpm run build && npx wrangler deploy
```

The MVP renders a **mocked X (Twitter) feed** seeded into the in-memory
store, so it works with no provider credentials configured. Real X OAuth
and Telegram integration are deferred (the X API is pay-per-use with no
free tier).

> Current deployment: `https://weavr.mountainous-turret.workers.dev`.
>
> The mocked feed is seeded on each page load (idempotent per Worker
> isolate). Because the store is in-memory, a recycled isolate re-seeds on
> the next request — this is the accepted MVP tradeoff.
