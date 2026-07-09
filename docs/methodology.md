# Metodologia de Simulação

## Abordagem

O FilaViva utiliza simulação por evento discreto com granularidade de 1 dia operacional. Cada dia é simulado independentemente, com appointments gerados conforme a configuração do cenário.

## Algoritmo

1. Gerar lista de appointments para o dia (agendados + walk-ins)
2. Ordenar por arrival_time
3. Para cada appointment:
   - Se no_show → pular
   - Alocar servidor disponível mais cedo (FIFO)
   - Calcular wait_time = service_start - arrival_time
   - Se wait_time > abandonment_threshold → marcar como abandonado
   - Se service_end > closing_time + max_overtime → marcar overtime
   - Se wait_time > sla_wait_minutes → marcar SLA breach
4. Agregar métricas do dia
5. Repetir por N dias
6. Agregar métricas finais

## Distribuições

| Variável | Distribuição |
|---|---|
| Duração do atendimento | Lognormal(μ, σ) |
| Atraso na chegada | Normal(5, 5), truncado em 0 |
| No-show | Bernoulli(taxa) |
| Walk-ins | Poisson(taxa × total_slots) por dia |

## Reprodutibilidade

Todo cenário aceita uma seed inteira. Mesma seed + mesmos parâmetros → mesmos resultados.

## Risk Score

Composição demonstrativa:
- 25% p95 normalizado pelo SLA
- 25% taxa de SLA breach
- 20% probabilidade de overtime
- 15% utilização excessiva (acima de 85%)
- 15% variabilidade do p90

Os pesos são ilustrativos e não representam validação operacional real.
