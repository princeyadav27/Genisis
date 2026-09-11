# Genesis — Living Village vertical slice
A persistent, observable, causal village with 20 state-backed residents. This is **not a completed Release A**. See PROGRESS.md, BLOCKERS.md and VERIFICATION.md.

## Local setup
Requires Node.js 22+, npm, and PostgreSQL 16+. Existing platform stack: Next.js App Router, React, TypeScript, PostgreSQL and Drizzle. No API keys needed.

1. `npm ci`
2. `cp .env.example .env` (do not replace an existing configured `.env`)
3. `docker compose up -d db` if PostgreSQL is not already running.
4. `npx drizzle-kit push` (or apply `migrations/0001_genesis.sql` once to a fresh database).
5. `npm run dev -- --hostname 127.0.0.1`
6. Open http://localhost:3000. Press Play or Space. Period single-steps when paused.

## Optional full Docker setup
`docker compose --profile full up --build` starts the app and database on localhost. This applies the schema at container startup. Container build/run has not been verified in this sandbox. Do not use the example credentials for a publicly accessible service.

## Production locally
`npm run build` then `npm run start -- --hostname 127.0.0.1`.
Platform preview uses its managed build_and_start runner instead.

## Verify
- `npx tsx --test tests/simulation.test.ts`
- `npx next typegen`
- `npm exec tsc -- --noEmit --pretty false`
- `npm run build`
- `npm run lint`
- `npx playwright install --with-deps chromium`
- With an existing server: `BASE_URL=http://127.0.0.1:3000 npx playwright test`
Browser tests use the shared local world and restore seed 42 afterward; do not run them against a valuable unsaved world.

## Controls
Click a resident/building; inspect needs, task, memories and actual event IDs. Drag to pan; scroll or use +/- to zoom. The minimap and reset-camera button return to overview. Follow keeps a selected resident centered. Layers toggles labels and terrain grid. Click terrain for inverse-projected coordinates.

Start/pause, step, requested speed, stop-and-save, save checkpoint and load checkpoint are backend commands. Loading always pauses and changes the decision generation. One manual checkpoint slot. Reset asks for confirmation and preserves that slot. Closing the browser causes no catch-up or offline progress.

## Simulation rules
One tick = 10 simulated minutes, maximum travel = 1.5 grid units/tick. All supplies are integer units. Capacity = five carried units. Initial quantities: 180 food, 240 drinking water, 64 wood, 40 stone, 120 seeds, 12 tools and 48,000 total minor currency units.

- Food: 8 labor ticks + 1 seed → 5 carried food + 2 recovered seeds. Seed recovery is simplified in-place stock bookkeeping; food is transported.
- Water: 3 labor ticks → 5 carried freshwater; well is explicitly renewable.
- Woodland: 5 labor ticks → up to 5 carried wood from a finite 2,400-unit deposit.
- Storage delivery is a transfer, not a new source.
- Meals/drinks consume one unit. Rest consumes six ticks and restores 50 energy.
- Construction: builders collect at storage, reserve and carry no more than five units, deliver 30 wood and 18 stone, then commit 60 labor. Needs can interrupt between work units.
- Nearby templated greetings create directional familiarity and witnessed memories; no contracts or payments are implied.
- Needs change 0.65 hunger, 0.85 thirst and -0.25 energy per tick. Health, mortality, seasons and weather are not modeled. Clear spring weather is a fixed scenario label, not a forecast.
- Six fixed starting households; no birth/death, finance or migration yet.

## Persistence and troubleshooting
Writes are serialized with a PostgreSQL transaction advisory lock. JSONB state is versioned; recent events are bounded at 600 while an append-only journal stores committed records per generation. Manual checkpoints include current recent transcript, ongoing tasks and memories. Journal browsing beyond the recent window is deferred.

A storage error: check DATABASE_URL, database readiness and apply schema. No checkpoint: save before loading. Paused villages intentionally do not move. A production build does not need schema reads, but API requests do.

This local prototype has no per-user authorization. Do not publish as a multi-tenant service. No secrets are embedded. See ARCHITECTURE.md for deviations and PLAN.md for the next slice.
