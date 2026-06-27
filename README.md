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

## Temporary Cloudflare deploy

Deploy to a temporary Cloudflare account with Wrangler:

```sh
pnpm run deploy:temporary
```

The temporary deployment stays live for 60 minutes. Wrangler will print a claim URL you can use to attach the temporary account to your Cloudflare account before it expires.
