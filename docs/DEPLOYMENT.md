# Deployment — FilaViva

## Public demo (recommended)

**URL:** https://filaviva-alpha.vercel.app  
**One-click lab:** https://filaviva-alpha.vercel.app/lab

Deploy only the `frontend/` directory to Vercel:

```bash
cd frontend
vercel --prod
```

Required production env (also in `frontend/.env.production`):

```bash
NEXT_PUBLIC_USE_STATIC_DEMO=1
```

Optional:

```bash
NEXT_PUBLIC_API_BASE=https://your-api.example.com
```

> Note: `filaviva.vercel.app` previously returned HTTP 451 in this account. Prefer `filaviva-alpha.vercel.app` until a clean alias is available.

## Local full stack

### Backend (from repo root)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# unset static force for live API:
# remove NEXT_PUBLIC_USE_STATIC_DEMO or set to 0
npm run dev
```

CORS allows localhost and the Vercel demos; extend via `CORS_ORIGINS`.

## What not to deploy as “production”

- No auth, no multi-tenant isolation, JSON file persistence.
- Synthetic data only — lab scope, not a call-center product.
