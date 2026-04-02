# 🦁 Veteranos Tech — Simulador de Escalonamento de SO

**Projeto Interdisciplinar — Análise e Desenvolvimento de Sistemas**
Anhanguera | 3º Semestre 
Equipe: Veteranos Tech

🔗 [Acessar o Simulador](https://alisson84martins.github.io/veteranos-tech-simulador/)
📁 [Repositório no GitHub](https://github.com/alisson84martins/veteranos-tech-simulador)

---

## 📋 Sobre o projeto

Um robô seguidor de linha parece simples por fora — ele segue uma fita preta no chão. Por dentro, ele é um sistema de tempo real gerenciando múltiplas tarefas simultaneamente: leitura de sensor IR, controle de motores, envio de telemetria e detecção de obstáculos. Com um único processador, alguém precisa decidir quem roda quando. Esse alguém é o escalonador — e é exatamente o que um Sistema Operacional faz.

Este simulador traduz essa realidade para o navegador. Cada tarefa do robô vira um processo. Cada algoritmo de escalonamento mostra um comportamento diferente na linha do tempo. A pergunta que o simulador responde é direta: qual algoritmo deixa o robô reagir mais rápido quando sai da linha?

**Round-Robin** trata todos os processos como iguais — cada um recebe uma fatia de tempo em rodízio. Justo, mas perigoso para tempo real: o sensor IR pode esperar três turnos completos para reagir enquanto o robô já desviou da pista.

**Por Prioridade** respeita a urgência de cada tarefa — o sensor sempre entra na frente. Mas se os dados chegarem sem parar, a telemetria nunca roda. É o starvation acontecendo na prática, visível no Gantt.

**Preemptivo** é o que um SO moderno usa em sistemas críticos — prioridade absoluta com interrupção imediata. Quando o sensor detecta um obstáculo, ele para qualquer processo em execução na hora e assume a CPU. É o mesmo mecanismo que o Linux usa para tratar interrupções de hardware. E é o algoritmo que será gravado no firmware do Arduino.

A camada de JavaScript não é decoração — ela é o sistema nervoso do projeto. O Gantt é desenhado em tempo real via Canvas API. Os processos são gerenciados com estado reativo. A Web Serial API (fase 2) vai conectar o navegador diretamente à porta USB do Arduino, transformando o simulador em um monitor de telemetria real durante os testes de bancada — sem instalar nada além do Chrome.

> *Entender Sistemas Operacionais não é só passar na matéria. É saber por que o seu robô perdeu a linha na curva.*

---

## 🎯 Objetivos

- Demonstrar na prática os algoritmos de escalonamento estudados em Sistemas Operacionais
- Conectar teoria de SO a um sistema embarcado real (robô seguidor de linha com Arduino)
- Usar JavaScript como ferramenta de visualização e análise de comportamento de processos
- Fundamentar a escolha do algoritmo que será gravado no firmware do Arduino com dados visuais
- Preparar a integração com hardware via Web Serial API (fase 2)

---

## ⚙️ Algoritmos implementados

| Algoritmo | Como funciona | Resultado no robô |
|---|---|---|
| **Round-Robin** | Cada processo recebe um quantum fixo em rodízio | Sensor IR pode demorar para reagir — robô sai da linha |
| **Por Prioridade** | Menor número = maior urgência, roda até terminar | Sensor sempre na frente, mas telemetria sofre starvation |
| **Preemptivo** | Prioridade absoluta com interrupção imediata | Obstáculo interrompe tudo na hora — comportamento ideal |

---

## 🤖 Processos simulados

| Processo | Tarefa no robô | Prioridade | Por quê |
|---|---|---|---|
| P1 — Sensor IR | Leitura da linha e detecção de desvio | 1 (máxima) | Crítico — atraso causa perda de linha |
| P2 — Motor CTRL | Ajuste de velocidade e direção | 2 | Responde diretamente ao sensor |
| P3 — Telemetria | Envio de dados via serial/USB | 4 (mínima) | Pode esperar — não afeta a corrida |
| P4 — Obstáculo | Sensor ultrassônico, detecção de barreira | 0 (interrupção) | Preempta tudo quando acionado |

---

## 🚀 Como usar o simulador

1. Acesse o link do GitHub Pages
2. Selecione o algoritmo no painel esquerdo
3. Ajuste o quantum (disponível no Round-Robin)
4. Clique em **▶ INICIAR**
5. Observe o Gantt, o log e as métricas em tempo real
6. Clique em **⚡ Simular Obstáculo** durante a execução para ver a preempção acontecer
7. Clique em **↺ RESETAR**, troque o algoritmo e compare os resultados

 rode os três algoritmos em sequência e anote a espera do P1 (Sensor IR) e o número de context switches. O algoritmo com menor espera no P1 é o ideal para o Arduino.

---

## 🗂️ Estrutura do projeto
```
veteranos-tech-simulador/
├── index.html                          ← página principal do simulador
├── assets/
│   └── logo.jpg                        ← identidade visual Veteranos Tech
├── styles/
│   └── simulador-escalonamento.css     ← tema dark, fontes e layout
├── scripts/
│   └── simulador-escalonamento.js      ← lógica dos algoritmos e Canvas API
└── README.md                           ← documentação do projeto
```

---

## 🔧 Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| HTML5 | Estrutura da interface |
| CSS3 | Tema dark, animações, layout responsivo |
| JavaScript (ES6+) | Lógica dos algoritmos, Canvas API, estado dos processos |
| Canvas API | Desenho do Gantt em tempo real |
| Web Serial API | Integração com Arduino via USB (fase 2) |
| GitHub Pages | Hospedagem e publicação do simulador |

---

## 📡 Próximas fases

- [ ] **Fase 2 — Integração Arduino:** botão de conexão USB via Web Serial API, Gantt com dados reais do hardware
- [ ] **Fase 3 — Código do robô:** firmware Arduino com escalonamento preemptivo, `attachInterrupt()` para sensor IR, telemetria via `Serial.println()`
- [ ] **Fase 4 — Análise comparativa:** relatório com métricas reais vs simuladas

---

## 📚 Matérias relacionadas

**Sistemas Operacionais** — escalonamento de processos, preempção, context switch, starvation, interrupções de hardware, sistemas de tempo real

**Desenvolvimento JavaScript** — DOM manipulation, Canvas API, Web Serial API, programação orientada a eventos, estado reativo

---

## 👥 Equipe

**Veteranos Tech** — ADS Anhanguera, 3º Semestre

---

*"Entender Sistemas Operacionais não é só passar na matéria. É saber por que o seu robô perdeu a linha na curva."*