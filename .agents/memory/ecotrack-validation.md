---
name: EcoTrack test and typecheck commands
description: How to run tests and typecheck for the EcoTrack monorepo.
---

- Tests (122 total): `pnpm --filter @workspace/api-server exec vitest run`
- API typecheck: `pnpm --filter @workspace/api-server run typecheck`
- Frontend typecheck: `pnpm --filter @workspace/ecotrack run typecheck`

**Why:** Tests are only in api-server (28 unit + 94 integration tests). Frontend has no test suite — only typecheck.

**How to apply:** Run both typechecks after any backend or frontend change. Run tests after any backend change.
