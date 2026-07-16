<div align="center">
  <img src="./assets/icon.png" alt="FilaViva Logo" width="120" height="120" />

  <h1>FilaViva</h1>

  <p><strong>Simulador operacional de filas: cenários de capacidade, métricas de espera e score de risco.</strong></p>
  <p><strong>Operational queue simulator: capacity scenarios, wait metrics and risk scoring.</strong></p>

  <p>
    <a href="#pt-br">PT-BR</a> ·
    <a href="#english">English</a> ·
    <a href="#live-demo">Live Demo</a> ·
    <a href="#stack">Stack</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#quick-start">Quick Start</a> ·
    <a href="#author">Author</a>
  </p>

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
    <img alt="Python" src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" />
    <img alt="NumPy" src="https://img.shields.io/badge/NumPy-Simulation-013243?style=for-the-badge&logo=numpy&logoColor=white" />
    <img alt="Status" src="https://img.shields.io/badge/Status-Lab%20demo-22C55E?style=for-the-badge" />
    <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  </p>

  <p>
    <a href="https://filaviva-alpha.vercel.app/lab"><strong>Live Demo</strong></a> ·
    <a href="https://github.com/BarujaFe1/FilaViva"><strong>Repo</strong></a> ·
    <a href="https://barujafe.vercel.app/"><strong>Portfolio</strong></a> ·
    <a href="https://www.linkedin.com/in/barujafe/"><strong>LinkedIn</strong></a>
  </p>
</div>

<p align="center">
  <img src="./assets/hero-cover.png" alt="FilaViva overview" width="100%" />
</p>

> **Lab / demo notice:** the public demo uses a **precomputed synthetic snapshot** (`frontend/public/demo/snapshot.json`). It is **not** a production call-center / clinic queue system. Custom simulations require the local FastAPI backend. No real patient/customer PII.

---

## PT-BR

### Visão geral
O **FilaViva** configura cenários de capacidade, no-show e agenda, simula dias com dados sintéticos reproduzíveis e compara espera, utilização, overtime e risco **antes** de mudar a operação real.

### Problema
Mudanças de capacidade e política de agenda costumam ir para produção sem simulação prévia — e o custo aparece em fila, overtime e insatisfação.

### Para quem
Gestores de operação/atendimento, analistas de capacidade e profissionais de dados que precisam testar “e se” com métricas claras.

### Funcionalidades
- Scenario builder e simulação discreta (engine Python)
- Métricas de espera, utilização e overtime
- Risk score e breakdown de risco
- Comparação de cenários e brief executivo
- Lab one-click na Vercel (`/lab`) com snapshot estático
- Demo dashboard, comparison e risk views

### Escopo e limites (honestos)
- Demo pública = snapshot; **não** roda simulações custom no Vercel
- Dados sintéticos — sem PII real
- Não é WFM enterprise nem integração com ACD/CRM
- Backend local necessário para simulações novas

---

## English

### Overview
**FilaViva** configures capacity, no-show and schedule scenarios, simulates days with reproducible synthetic data, and compares wait, utilization, overtime and risk **before** changing real operations.

### Problem
Capacity and scheduling policy changes often ship without prior simulation — cost shows up as queues, overtime and poor experience.

### Who it is for
Ops/service managers, capacity analysts and data professionals who need what-if runs with clear metrics.

### Features
- Scenario builder and discrete simulation (Python engine)
- Wait, utilization and overtime metrics
- Risk score and risk breakdown
- Scenario comparison and executive brief
- One-click Vercel lab (`/lab`) with a static snapshot
- Demo dashboard, comparison and risk views

### Scope and honest limits
- Public demo = snapshot; **no** custom simulations on Vercel
- Synthetic data — no real PII
- Not enterprise WFM or ACD/CRM integration
- Local backend required for new simulations

---

## Live Demo

| Surface | URL |
|---|---|
| **One-click lab** | [https://filaviva-alpha.vercel.app/lab](https://filaviva-alpha.vercel.app/lab) |
| **Homepage** | [https://filaviva-alpha.vercel.app](https://filaviva-alpha.vercel.app) |
| **Demo dashboard** | [/demo](https://filaviva-alpha.vercel.app/demo) |
| **GitHub** | [https://github.com/BarujaFe1/FilaViva](https://github.com/BarujaFe1/FilaViva) |

**How to try:** open `/lab` → walk simulate → risk → compare using the precomputed snapshot. For custom runs, start the FastAPI backend locally.

---

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="./assets/screenshots/01-home.png" alt="Home" /><br /><sub><strong>Home</strong></sub></td>
    <td width="50%"><img src="./assets/screenshots/02-demo-dashboard.png" alt="Demo" /><br /><sub><strong>Demo dashboard</strong></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./assets/screenshots/03-risk-breakdown.png" alt="Risk" /><br /><sub><strong>Risk breakdown</strong></sub></td>
    <td width="50%"><img src="./assets/screenshots/04-executive-brief.png" alt="Brief" /><br /><sub><strong>Executive brief</strong></sub></td>
  </tr>
</table>

<p align="center"><img src="./assets/screenshots/05-scenario-builder.png" alt="Scenario builder" width="80%" /><br /><sub><strong>Scenario builder</strong></sub></p>

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, Recharts, TanStack Table |
| Backend | FastAPI, Pydantic, Pandas, NumPy, pytest (`backend/`) |

---

## Architecture

```txt
frontend/                 Next.js UI + public/demo/snapshot.json
backend/
  engine/                 generator, simulator, metrics, risk_score
  api/                    FastAPI routes
  tests/
scripts/                  snapshot generation helpers
assets/
```

Flow: scenario params → synthetic generation → discrete simulation → metrics + risk → comparison / brief. Public lab reads the static snapshot.

---

## Quick Start

**Prerequisites:** Node.js 20+, Python 3.12+, Git.

### Backend (start Uvicorn from monorepo root)
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
npm run dev
```

Optional: copy `frontend/.env.example` → `.env.local` and set `NEXT_PUBLIC_API_BASE`.

---

## Technical decisions

- **Simulate before changing capacity** — what-if beats post-mortem dashboards
- **Static snapshot on Vercel** for a reliable lab without hosting the simulator
- **Reproducible synthetic data** — no PII, interview-safe demos
- **Risk score** to translate queue metrics into an operational signal

---

## Roadmap

- Richer scenario templates (overbooking, multi-skill)
- Batch comparison exports
- Optional hosted API when infra allows
- Stronger calibration docs vs. real service times

---

## Author

**Felipe Alirio Baruja** — data / product / full-stack portfolio.

- Portfolio: [https://barujafe.vercel.app/](https://barujafe.vercel.app/)
- GitHub: [https://github.com/BarujaFe1](https://github.com/BarujaFe1)
- LinkedIn: [https://www.linkedin.com/in/barujafe/](https://www.linkedin.com/in/barujafe/)

---

## License

MIT — see [`LICENSE`](./LICENSE).
