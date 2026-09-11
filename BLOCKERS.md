# Known limitations / release boundary
No blocked first-slice runtime requirement remains. Full Release A is not complete; B and C are deferred.

## Unsupported or simplified
- No attached image was available. Original procedural SVG follows only the written visual description, not pixel-perfect reference matching.
- Renderer is SVG, not PixiJS. Basic viewport culling and depth sorting; no sprite batching or measured 100-person performance. Roof cutaways, night lighting and detailed footprint collision are not implemented.
- Physical travel uses bounded axis-aligned steps on a simplified open grass grid. Decorative paths suggest activity routes but do not constitute a general road graph. Trees/buildings do not block navigation yet. This is explicitly not complete pathfinding acceptance.
- Render-only movement interpolation is disabled on pause. Crops reflect recorded farm labor; three visual plots represent one farm, not independent land ownership.
- Farming seed recovery enters shared stock in place; only food/wood/water and building materials have explicit carrying. No tool maintenance, spoilage, health, mortality, weather/season cycles or ecological renewal beyond the documented well.
- Starting households/occupations and ambitions are fixed. Utility planning prioritizes needs between tasks; no flexible negotiated job contracts, debts, care obligations, personality-based counteroffers or economy trade settlement.
- Greetings have range checks and witnessed memory, but are not a multi-turn negotiated conversation engine. No claims of genuine free will or consciousness.
- Ten supervisory modules are read-only deterministic summaries, not full permissioned proposal modules. Unsupported domains are labeled in their panels.
- No LLM adapter/API integration. Mock mode only. No API calls or provider budget incurred.
- REST polling replaces WebSockets. Browser-driven bounded ticks mean no offline catch-up. Full network-disconnection/resync acceptance remains untested.
- Recent inspector history is bounded at 600 events and 80 conversations. Older objective events remain in PostgreSQL; archive browsing and full replay are deferred. One local manual checkpoint slot; no imported-save corruption test.
- Seed changes affect identities/ages only in this slice; divergent seeded behavior and map scenarios are not verified. Only seed 42 baseline is accepted here.
- Shared local village has no multi-user auth. Do not publicly expose as a multi-tenant service.

## Verification limits
- 1366×768 and 1920×1080 Chromium screenshots captured. Street, selected resident and conversation views captured. No manual crossing-occlusion test, mobile acceptance, 50/100 benchmark, Release B/C scenario or complete Release A acceptance.
- Docker files provided; container build/run unverified in this sandbox.
- Latest production audit: zero high/critical advisories, one moderate `baseline-browser-mapping` advisory in the dependency tree. Development dependencies retain additional advisories; no blind force-upgrade performed.
