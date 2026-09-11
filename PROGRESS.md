# Genesis progress
## Session outcome
A working, verified first Living Village vertical slice, not a completed Release A.

### Milestones
- **M0 complete:** inspected clean Next.js/Drizzle starter, no prior simulation or reference image; preserved supported stack and documented scope.
- **M1 scoped slice complete:** original SVG island, 20 selectable state-backed residents, camera drag/zoom/reset/follow, inverse tile picking, minimap, depth sorting and live backend snapshots. Renderer differs from requested PixiJS; full visual acceptance checklist still pending.
- **M2 partial:** travel, hunger/thirst/fatigue, meals, fresh water, farming, finite timber extraction, carried goods, delivery and material/labor-backed construction. No crafting, maintenance or general collision/pathfinding.
- **M3 supported slice complete:** serialized persistence, stable pause, single step, stop-and-save, checkpoint/load and stale generation checks verified. One checkpoint slot; no imported saves or full historical replay UI.
- **M4–M6 partial:** mock individual planning, goals, personal memories, local greetings and directional familiarity, resource inspector, causal events and ten read-only monitors. No LLM adapter, negotiated contracts, monetary trade, subjective belief propagation or permissioned supervisor proposal execution.
- **M7/M8 deferred:** Release B and C not started; 50/100 resident performance unverified.

### Bounded implementation log
1. Repository audit and specification.
2. Pure deterministic engine and seeded 20-person scenario.
3. PostgreSQL writer serialization and checkpoint commands.
4. Original isometric renderer and camera.
5. Observable dashboard, resident/building/system inspectors.
6. Engine invariants and 1000-tick verification.
7. Patch starter Next.js vulnerability, add setup/migration/browser tooling.
8. Resolve overlapping auto-typecheck resource contention and stale managed start log.
9. Browser lifecycle and visual refinements.
10. Correct SVG title hydration, integer-hash terrain generation and invalid canopy path.
11. Add full stock reconciliation and persistent conversation tests.
12. Final production verification and evidence recording.

### Next smallest slice
Implement a typed voluntary job proposal with actor/decision/generation/observation envelope and atomic acceptance/refusal. Acceptance tests: a fatigued resident refuses, a shorter shift can be accepted, funds are reserved, payment settles only after delivered work, rejection creates no agreement, save/load retains the transcript and contract. Do not introduce LLM calls until mock acceptance passes.

See VERIFICATION.md for executed commands and BLOCKERS.md for the honest release boundary. No release completion marker is warranted.
