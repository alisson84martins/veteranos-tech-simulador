# 🦁 Veteranos Tech — Simulador de Escalonamento de SO

**Projeto ADS — Análise e Desenvolvimento de Sistemas**  
Anhanguera | 3º Semestre  
Equipe: Veteranos Tech

---

## 📋 Sobre o projeto

Simulador visual de algoritmos de escalonamento de processos aplicado ao contexto de um **robô seguidor de linha**.  
Cada tarefa do robô (sensor IR, controle de motor, telemetria, detecção de obstáculo) é modelada como um processo de SO, permitindo comparar algoritmos antes de gravar o firmware no Arduino.

---

## ⚙️ Algoritmos implementados

| Algoritmo | Descrição |
|---|---|
| **Round-Robin** | Cada processo recebe um quantum fixo de tempo em rodízio |
| **Por Prioridade** | Processos de maior prioridade sempre executam primeiro |
| **Preemptivo** | Alta prioridade interrompe imediatamente o processo atual |

---

## 🚀 Como usar

1. Acesse o simulador pelo link do GitHub Pages abaixo
2. Selecione o algoritmo desejado
3. Ajuste o quantum (Round-Robin) ou a velocidade
4. Clique em **▶ INICIAR**
5. Use **⚡ SIMULAR OBSTÁCULO** para ver preempção em ação

---

## 🗂️ Estrutura do projeto

```
veteranos-tech-simulator/
├── index.html                          # Página principal
├── assets/
│   └── logo.jpg                        # Logo Veteranos Tech
├── styles/
│   └── simulador-escalonamento.css     # Estilos do dashboard
├── scripts/
│   └── simulador-escalonamento.js      # Lógica dos algoritmos
└── README.md
```

---

## 🔗 Matérias relacionadas

- **Sistemas Operacionais** — escalonamento, preempção, context switch, starvation
- **Desenvolvimento JavaScript** — DOM, Canvas API, Web Serial API (fase 2)

---

*Veteranos Tech © 2025 — Anhanguera*
