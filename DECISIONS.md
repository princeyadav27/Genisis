# Decisions
- Preserve installed Next.js/React/PostgreSQL/Drizzle per platform requirements. Do not introduce a second backend.
- Use original procedural SVG rather than unlicensed reference assets. SVG allows accessible picking and crisp scale at this small population. PixiJS batching and measured 100-person performance are deferred.
- Use bounded client-driven REST ticks and server snapshots. No background catch-up or offline progress. Requests from multiple tabs are throttled and carry expected tick/generation.
- Use transaction-level PostgreSQL advisory locks for every write. This avoids process-local mutex errors.
- Scripted routine planner requires no API keys; no cosmetic LLM-enabled indicator.
- Starting stocks are initial conditions, not live injections. Resource source/sink changes are explicit events.
- Narrative and supervisor views are read-only derived outputs, never world writers.

- Patched Next.js and eslint-config-next to 16.3.4 after npm audit identified a critical starter advisory. Production high/critical findings are resolved.
- Procedural art uses an integer hash, not transcendental floating-point noise, to ensure server/browser hydration agreement. SVG titles use single strings to satisfy React SSR.
