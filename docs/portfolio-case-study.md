# FilaViva — Case Study de Portfólio

## Headline

**FilaViva — Simulação operacional para decisões de capacidade em filas de atendimento**

## Resumo

Produto analítico que usa dados sintéticos e simulação de cenários para estimar espera, utilização, overtime e risco operacional antes de alterar uma agenda.

## Problema resolvido

Operações de atendimento tomam decisões de capacidade e agenda por intuição, sem simulação prévia. O FilaViva permite testar cenários hipotéticos e quantificar trade-offs antes de implementar mudanças.

## Diferencial técnico

- Motor de simulação próprio em Python (loop discreto por dia)
- Geração de dados sintéticos reproduzível com seed fixa
- 8 métricas operacionais calculadas, incluindo p90/p95 e risk score
- Comparação quantitativa entre cenários com deltas percentuais
- Executive Brief determinístico (sem IA generativa)
- UI decisória com linguagem responsável e limitações explícitas

## Stack

Python, FastAPI, NumPy, Pandas, Next.js 15, TypeScript, Tailwind CSS, Recharts

## Resultado para o portfólio

Este projeto demonstra capacidade de:
- Modelagem de processos operacionais
- Simulação e análise de cenários
- Cálculo e visualização de métricas de fila
- Construção de produto full-stack com testes
- Comunicação de incerteza e trade-offs
- Responsabilidade analítica e ética em dados
