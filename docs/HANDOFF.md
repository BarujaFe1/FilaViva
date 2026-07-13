# Handoff — portfolio quality pass

**Branch:** `chore/portfolio-quality-pass`  
**Repo:** https://github.com/BarujaFe1/FilaViva  
**Live demo:** https://filaviva-alpha.vercel.app/lab

## What we found

- Strong skeleton already (engine + Next UI + static Vercel demo).
- Engine/docs mismatch on overtime + risk variability.
- Variability bug inflated demo risk (~21.4) via CV with near-zero mean.
- Comparison UX could compare stale form state.
- Unused deps, no CI, incomplete DX scripts, docs uneven for recruiters.

## What we fixed

- Simulator respects `max_overtime_minutes` as hard start cutoff.
- Variability = `wait_std / SLA` (demo risk ≈ **7.0** after regen).
- Demo API prefers `demo_results.json` (`?live=1` to recompute).
- `ScenarioForm.onChange` + comparison static-mode notice.
- a11y roles on `StateBlock`; `aria-current` on nav.
- Removed unused frontend packages; dropped unused Pandas dependency.
- Added `npm run typecheck`, CI workflow, architecture/testing/deployment docs.
- Regenerated `demo_results.json` + `snapshot.json`.
- Rewrote README for portfolio storytelling.

## What we improved

- Recruiter-facing narrative and Live Demo clarity.
- Test coverage for overtime + variability.
- Lint cleanliness (ruff).

## Commands run

```bash
pytest backend/tests -q          # 15 passed
ruff check backend               # clean
npm run lint / typecheck / build # frontend
scripts/generate_demo.py
scripts/generate_public_snapshot.py
```

## Still missing / residual risks

- Screenshots in `assets/screenshots` still show old risk ~21 — refresh recommended.
- No Playwright/TestClient suite yet.
- Public comparison of arbitrary configs still needs live API.
- `filaviva.vercel.app` alias historically HTTP 451 — use `filaviva-alpha`.
- This branch does **not** auto-redeploy Vercel; merge + redeploy to update public snapshot risk numbers.

## Portfolio suggestions

- Keep Abrir demo → `/lab`.
- After Vercel redeploy, mention risk ≈ 7 (baixo) driven mostly by overtime probability, not fake variability.
- Interview story: static-first demo reliability vs local engine fidelity.

## Suggested commit message

```text
chore: improve portfolio quality, docs, tests and stability
```

## Next steps

1. Push branch / open PR.  
2. Redeploy frontend on Vercel so public snapshot matches engine (risk 7.0).  
3. Optionally refresh screenshots.  
4. Add API TestClient tests in a follow-up.
