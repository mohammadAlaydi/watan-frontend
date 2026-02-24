# Watan Frontend

Next.js landing page and web app for the Watan professional network.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI**: shadcn/ui (Radix)
- **Auth**: Clerk
- **Animations**: Framer Motion
- **Charts**: Recharts

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local
# → Fill in your Clerk keys and API URL

# 3. Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint with ESLint |

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg NEXT_PUBLIC_API_URL=https://api.watan.app/api \
  -t watan-frontend .

docker run -p 3000:3000 watan-frontend
```

> **Note**: `NEXT_PUBLIC_*` env vars are baked at build time in Next.js, so they must be passed as Docker build args.

## Environment Variables

See [`.env.example`](.env.example) for all required variables.
