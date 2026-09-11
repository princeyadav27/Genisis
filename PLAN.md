# Ordered milestones
1. M0 Audit/documentation — starter inspected, reuse justified, initial scope documented.
2. M1 Visual foundation — map with 20 state-backed selectable residents, camera zoom/pan/reset/follow, backend snapshots.
3. M2 Causal slice — physically travel, consume stocks, gather finite wood/renewable water, farm using seeds, deliver building materials and labor. Verify invariants over 1000 ticks.
4. M3 Persistence — transaction-serialized commands, pause generation, step, save/load. Verify stale proposals and restoration.
5. M4–M6 Partial observability — local templated conversations and memories, inspector, event history, read-only supervisory modules. Full release acceptance remains pending.
6. M7–M8 Deferred — generations, institutions, visitors and 100 resident performance acceptance.

Session bounded to 20 iterations; stop after 3 consecutive attempts on a single blocker. Acceptance for this slice: pure-engine tests, actual database lifecycle smoke test, type generation, TypeScript, production build and runtime health check. Browser testing where tooling permits. Never emit release completion marker without complete release acceptance.
