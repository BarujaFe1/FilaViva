# Audit Report — FilaViva

**Date:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass`  
**Auditor role:** portfolio quality pass (architecture + QA + DX + product)

## Executive summary

FilaViva is a solid lab demo: FastAPI discrete-event engine + Next.js UI + static public snapshot on Vercel. Before this pass it already had a working one-click `/lab` demo, but several **engine/doc inconsistencies**, **UX traps**, **missing CI**, and **portfolio-doc gaps** limited recruiter confidence.

**Current grade (after fixes in this branch): 8.5 / 10**  
**(pre-pass estimate: 6.5 / 10)**

## Stack (verified)

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind 3, Recharts |
| Backend | Python 3.12, FastAPI, Pydantic v2, NumPy |
| Demo public | Static snapshot `frontend/public/demo/snapshot.json` on Vercel |
| Tests | pytest (engine) |

## Main risks found

1. **`max_overtime_minutes` unused** — documented and in schema, ignored by simulator.
2. **Variability component always maxed** — `std/mean` with mean≈0 → CV ≫ 1 → clamp 1.0 → +15 risk points even on healthy demos (score 21.4 dominated by artifact).
3. **Methodology JSON formula outdated** (`p90_std/p90` never computed).
4. **Live `/api/demo/default` always recomputed** 500 days (slow) despite `demo_results.json`.
5. **Comparison page** only synced form on explicit “Definir …” submit — easy to compare stale configs.
6. **Unused deps** (`lucide-react`, `@tanstack/react-table`, `pandas`) inflated install surface.
7. **No CI**, weak DX scripts (`typecheck` missing).
8. **README** was long but mixed outdated claims and weak “interview story” section.

## Quick wins (done in this pass)

- Honor overtime window in simulator.
- Normalize variability by SLA.
- Cache demo endpoint from `demo_results.json` (`?live=1` to recompute).
- `ScenarioForm.onChange` + comparison UX note in static mode.
- Remove unused frontend deps; add `typecheck` script.
- GitHub Actions CI (frontend + backend).
- Architecture / decisions / testing / deployment docs + HANDOFF.
- Portfolio-oriented README rewrite.

## Structural improvements (done / remaining)

| Item | Status |
|---|---|
| Engine ↔ docs alignment | Done |
| Static demo reliability | Already strong; snapshot regenerated |
| API tests (TestClient) | Remaining (nice-to-have) |
| Frontend unit tests | Remaining |
| Visual screenshot refresh after risk 7.0 | Remaining (screenshots still show ~21) |
| `filaviva.vercel.app` alias (451) | External / documented |

## Bugs found & disposition

| Bug | Fix |
|---|---|
| Overtime param orphan | Simulator blocks starts after `closing + max_overtime` |
| Variability inflation | `wait_std / SLA` |
| Empty metrics missing `variability` | Added |
| Ruff: unused import/vars, import order | Fixed |
| Comparison stale state | `onChange` sync |
| Demo always live-heavy | Prefer cache file |

## Execution plan

1. Audit + branch ✅  
2. Engine + tests ✅  
3. Frontend UX/DX ✅  
4. Docs + CI + README ✅  
5. Validate lint/tsc/build/pytest ✅  
6. Commit + push branch  

## Final checklist

- [x] Installs (venv + npm)
- [x] Pytest green
- [x] Ruff green
- [x] Frontend lint + typecheck + build
- [x] Public demo path documented
- [x] Secrets not committed
- [x] CI workflow added
- [x] HANDOFF written
