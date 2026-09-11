# Architecture
Next.js App Router + TypeScript + PostgreSQL/Drizzle, preserving the provided supported stack instead of introducing Python/SQLite/Vite.

- `src/lib/simulation.ts`: pure deterministic seed, planner, validator, clock, event and outcome mechanics.
- `src/lib/world-store.ts`: one transaction-scoped advisory lock serializes writers; world/checkpoint JSONB persistence and append-only branch event journal.
- `src/app/api/world/route.ts`: validated commands and snapshots. Client requests bounded ticks while connected; no background/offline catch-up. REST polling, not WebSockets, for this slice.
- `src/components/village-map.tsx`: original isometric SVG, independent of simulation decisions. Depth-sorted props/residents; camera transforms and picking.
- `src/components/genesis.tsx`: observable dashboard and lifecycle controls.

One tick = ten simulation minutes. A running browser requests ticks; server throttling prevents multiple tabs accelerating the world. Simulation stops advancing without requests. A generation/tick envelope rejects stale advances. Saves include world schema version, all residents, tasks, inventories, memories, events, construction and generation. Load creates a new generation and is paused. Narrative is a view of committed events.

Security: no provider credentials or external agent tools. Payloads allow only enumerated commands with bounded speeds. This is a shared local village without per-user authentication, not a public multi-tenant service.
