# Technical Decisions — FilaViva

## TD-01 — Static snapshot for public demo

**Decision:** Ship a precomputed `snapshot.json` for Vercel instead of hosting FastAPI.

**Why:** 500-day simulations are CPU-bound; serverless cold starts + ephemeral disk break run persistence.

**Trade-off:** Public `/comparison` with arbitrary forms falls back to the precomputed pair unless a live API is configured.

## TD-02 — NumPy engine, no Pandas in hot path

**Decision:** Keep simulation/metrics on NumPy arrays/lists. Remove Pandas as a required runtime dependency narrative (still listed historically; prefer NumPy-only installs going forward).

**Why:** Pandas was unused in code and added weight without value.

## TD-03 — Variability = wait_std / SLA

**Decision:** Replace coefficient of variation (`std/mean`) with SLA-normalized dispersion.

**Why:** Healthy demos with mean wait ≈ 0 produced CV ≫ 1, always clamping variability to 100% contribution and inflating risk (~+15 points) for the wrong reason.

## TD-04 — Overtime window is a hard start cutoff

**Decision:** Do not start services after `closing + max_overtime_minutes`; still flag overtime when `service_end > closing`.

**Why:** Matches the product intent of a finite overtime budget and activates the previously orphan schema field.

## TD-05 — Demo cache with `?live=1` escape hatch

**Decision:** `/api/demo/default` reads `demo_results.json` by default; `live=true` recomputes.

**Why:** Instant local/API demos without losing the ability to regenerate.

## TD-06 — Client-side data fetching

**Decision:** Keep pages as client components fetching JSON.

**Why:** Matches current App Router structure and static snapshot model; SSR of live sims is unnecessary for a lab demo.
