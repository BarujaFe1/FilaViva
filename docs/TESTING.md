# Testing — FilaViva

## Backend (pytest)

From repository root (so `import backend` works):

```bash
backend\.venv\Scripts\python.exe -m pytest backend/tests -q
```

Coverage focus:
- seed reproducibility;
- no-show rate band;
- wait ≥ 0;
- capacity / server ids;
- more servers → lower wait;
- overbooking raises risk;
- percentile sanity;
- **max overtime start cutoff**;
- **variability not SLA-maxed on healthy ops**.

## Frontend

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

There are no Jest/Playwright suites yet. Public demo is validated via:
- `npm run build` (13 static routes including `/lab`);
- manual / HTTP smoke against Vercel;
- snapshot JSON schema consumed by `/lab`.

## Regenerating fixtures after engine changes

```bash
backend\.venv\Scripts\python.exe scripts\generate_demo.py
backend\.venv\Scripts\python.exe scripts\generate_public_snapshot.py
```

Commit updated `backend/data/demo_results.json` and `frontend/public/demo/snapshot.json` together with engine changes.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs backend ruff+pytest and frontend lint+typecheck+build on push/PR.
