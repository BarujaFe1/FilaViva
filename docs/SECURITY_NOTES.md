# Security Notes

No secrets, API tokens, or personal datasets were found committed in this pass.

Tracked env files intentionally contain **non-secret** public flags only:

- `frontend/.env.example`
- `frontend/.env.production` → `NEXT_PUBLIC_USE_STATIC_DEMO=1`

Runtime results under `backend/data/results/*.json` remain gitignored.

If a secret is ever introduced, rotate it immediately and keep it out of git history.
