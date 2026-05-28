# The Shuttle App

Real-time campus shuttle tracker for the University of Ghana, Legon.

## Monorepo Structure

```
├── apps/
│   ├── mobile/     Expo 51 + expo-router (student & driver apps)
│   └── admin/      Next.js 14 admin dashboard
├── packages/
│   ├── config/     Shared ESLint and TypeScript configs
│   ├── database/   Supabase query layer
│   └── shared-types/ Shared TypeScript types
└── supabase/       Database migrations and seed data
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)
- A Supabase project
- A Mapbox public access token

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` | Mapbox public token for maps |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin only) |
| `SUPABASE_DB_PASSWORD` | Database password for local Supabase |

### 3. Initialize the database

```bash
supabase start
supabase db reset
```

This applies migrations and runs `supabase/seed.sql`.

### 4. Run development servers

Start all apps via Turborepo:

```bash
pnpm dev
```

Or run individually:

```bash
# Mobile (Expo)
pnpm --filter @shuttle/mobile dev

# Admin dashboard (Next.js on port 3001)
pnpm --filter @shuttle/admin dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm type-check` | Run TypeScript checks across the monorepo |

## Apps

### Mobile (`apps/mobile`)

Expo Router app with three navigation groups:

- `(student)` — Map, schedule, and alerts for students
- `(driver)` — Live location broadcast for shuttle operators
- `(auth)` — Sign-in flows for students and drivers

Path aliases are configured in `tsconfig.json` and `babel.config.js` using the `@/` prefix.

### Admin (`apps/admin`)

Next.js 14 dashboard for managing drivers, routes, and analytics. Runs on port 3001.

## Packages

- `@shuttle/config` — Shared `tsconfig-base.json` and `eslint-base.js`
- `@shuttle/shared-types` — Domain types (Shuttle, Route, Stop, Profile, etc.)
- `@shuttle/database` — Typed Supabase query functions

## Tech Stack

- **Mobile:** Expo 51, React Native 0.74, expo-router, react-native-maps, Zustand, TanStack Query
- **Admin:** Next.js 14, React 18
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **Monorepo:** pnpm workspaces + Turborepo
