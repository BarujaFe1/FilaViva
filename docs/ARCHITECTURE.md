# Architecture — FilaViva

## Overview

FilaViva is a **monorepo lab** for operational queue simulation:

```text
ScenarioConfig → Synthetic Generator → Discrete Day Simulator → Metrics → Risk Score
                                                                      ↓
                                                         FastAPI REST  +  Static Snapshot
                                                                      ↓
                                                              Next.js App Router UI
```

## Packages / folders

| Path | Responsibility |
|---|---|
| `backend/engine/` | Domain: generation, simulation, metrics, risk |
| `backend/api/` | HTTP adapters (routers, Pydantic schemas) |
| `backend/data/` | Demo artifacts + methodology JSON |
| `frontend/src/app/` | Routes (App Router) |
| `frontend/src/components/` | Presentational UI |
| `frontend/src/lib/api.ts` | API client + static snapshot fallback |
| `frontend/public/demo/` | Precomputed public demo payload |
| `scripts/` | Snapshot / demo generation utilities |
| `docs/` | Methodology, architecture, handoff |

## Runtime modes

1. **Public lab (Vercel):** `NEXT_PUBLIC_USE_STATIC_DEMO=1` — UI reads `/demo/snapshot.json`. No FastAPI required.
2. **Local full stack:** Next.js + Uvicorn from repo root. Live `POST /api/simulations/run` and `/compare`.
3. **Hybrid:** Live API when reachable; otherwise snapshot fallback (except custom runs).

## Key domain rules

- FIFO multi-server per day.
- Abandon if wait > `abandonment_threshold_minutes` **or** start would be after `closing + max_overtime_minutes`.
- Overtime flag if `service_end > closing`.
- Risk score is **demonstrative**, not calibrated to a real operation.

## Persistence

- Optional JSON files under `backend/data/results/` (local only, gitignored).
- No database. Suitable for lab demos, not multi-tenant production.
