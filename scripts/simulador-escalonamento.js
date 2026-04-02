// ── RELÓGIO ──
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
setInterval(updateClock, 1000); updateClock();

// ── PROCESSOS ──
const PROCESSES = [
  { id:'P1', name:'SENSOR IR',   desc:'Leitura da linha\ndetecção de desvio', color:'#00d4ff', priority:1, burst:2,  totalBurst:2  },
  { id:'P2', name:'MOTOR CTRL',  desc:'Ajuste de velocidade\ne direção',        color:'#ff6b35', priority:2, burst:4,  totalBurst:4  },
  { id:'P3', name:'TELEMETRIA',  desc:'Envio de dados\nvia serial/USB',        color:'#39ff7a', priority:4, burst:6,  totalBurst:6  },
  { id:'P4', name:'OBSTÁCULO',   desc:'Sensor ultrassônico\ndetecção',          color:'#c77dff', priority:0, burst:1,  totalBurst:1  },
];

let algo = 'rr';
let running = false;
let simTimer = null;
let speed = 3;
let cpuTime = 0;
let ctxSwitches = 0;
let currentProc = null;
let timeline = [];
let quantum = 3;
let quantumCount = 0;

// Estado dos processos
let procState = [];

function initProcState() {
  procState = PROCESSES.map(p => ({
    ...p,
    remaining: p.totalBurst,
    waited: 0,
    ran: 0,
    status: 'waiting',
    active: p.id !== 'P4'
  }));
}

function selectAlgo(a, btn) {
  algo = a;
  document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('quantum-row').style.display = a === 'rr' ? 'flex' : 'none';
  if (running) { resetSim(); }
}

function updateSpeed(v) {
  speed = parseInt(v);
  document.getElementById('speed-val').textContent = v + 'x';
  if (running) {
    clearInterval(simTimer);
    simTimer = setInterval(tick, Math.max(50, 400 / speed));
  }
}

// ── RENDER CARDS ──
function renderCards() {
  const grid = document.getElementById('proc-grid');
  grid.innerHTML = '';
  procState.forEach(p => {
    const pct = p.active ? Math.round(((p.totalBurst - p.remaining) / p.totalBurst) * 100) : 100;
    const isRun = currentProc && currentProc.id === p.id;
    const card = document.createElement('div');
    card.className = 'proc-card' + (isRun ? ' running' : '');
    card.id = 'card-' + p.id;

    let badge = p.status === 'done' ? 'done' : (isRun ? '' : 'waiting');
    let badgeText = p.status === 'done' ? 'CONCLUÍDO' : (isRun ? 'EXECUTANDO' : 'AGUARDANDO');
    let badgeClass = p.status === 'done' ? 'done' : (isRun ? '' : 'waiting');

    card.innerHTML = `
      <div class="proc-color" style="background:${p.color};box-shadow:0 0 8px ${p.color}44"></div>
      <span class="proc-status-badge ${badgeClass}">${badgeText}</span>
      <div class="proc-name" style="color:${p.color}">${p.name}</div>
      <div class="proc-desc">${p.desc.replace('\n','<br>')}</div>
      <div class="proc-stat"><span>PRIORIDADE</span><span>${p.priority === 0 ? '⚡ INT' : p.priority}</span></div>
      <div class="proc-stat"><span>RESTANTE</span><span>${p.remaining}ms</span></div>
      <div class="proc-stat"><span>ESPERA</span><span>${p.waited}ms</span></div>
      <div class="proc-bar-wrap">
        <div class="proc-bar" style="width:${pct}%;background:${p.color};box-shadow:0 0 6px ${p.color}66"></div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Legend
  const leg = document.getElementById('legend');
  leg.innerHTML = procState.map(p =>
    `<div class="legend-item"><div class="legend-dot" style="background:${p.color}"></div>${p.name}</div>`
  ).join('');
}

// ── TIMELINE CANVAS ──
function drawTimeline() {
  const canvas = document.getElementById('timeline-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 180;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (timeline.length === 0) return;

  const totalTime = cpuTime || 1;
  const h = 28;
  const y0 = 30;
  const xStart = 60;
  const xEnd = canvas.width - 20;
  const xRange = xEnd - xStart;

  // Labels dos processos
  PROCESSES.forEach((p, i) => {
    ctx.font = '9px "Share Tech Mono"';
    ctx.fillStyle = p.color;
    ctx.textAlign = 'right';
    ctx.fillText(p.id, xStart - 6, y0 + i * (h + 8) + h/2 + 4);

    // faixa de fundo
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(xStart, y0 + i*(h+8), xRange, h);
  });

  // Blocos
  timeline.forEach(block => {
    const pi = PROCESSES.findIndex(p => p.id === block.pid);
    if (pi < 0) return;
    const p = PROCESSES[pi];
    const x = xStart + (block.start / totalTime) * xRange;
    const w = Math.max(2, (block.dur / totalTime) * xRange);
    const y = y0 + pi * (h + 8);

    ctx.fillStyle = p.color + 'cc';
    ctx.fillRect(x, y, w, h);

    if (block.interrupt) {
      ctx.fillStyle = '#fff3';
      ctx.fillRect(x, y, w, h);
    }

    if (w > 20) {
      ctx.font = '8px "Share Tech Mono"';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(block.start + 'ms', x + w/2, y + h/2 + 3);
    }
  });

  // Linha de tempo (marcações)
  ctx.strokeStyle = 'rgba(0,212,255,0.15)';
  ctx.lineWidth = 1;
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const x = xStart + (i/steps) * xRange;
    ctx.beginPath();
    ctx.moveTo(x, y0 - 8);
    ctx.lineTo(x, y0 + PROCESSES.length * (h+8));
    ctx.stroke();
    ctx.font = '8px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,212,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(i/steps * totalTime) + 'ms', x, y0 - 12);
  }
}

// ── ESCALONADORES ──
function pickNext() {
  const ready = procState.filter(p => p.active && p.remaining > 0);
  if (ready.length === 0) return null;

  if (algo === 'rr') {
    // Round Robin: pega o próximo da fila circular
    let idx = 0;
    if (currentProc) {
      const ci = ready.findIndex(p => p.id === currentProc.id);
      idx = (ci + 1) % ready.length;
    }
    return ready[idx];
  }

  if (algo === 'priority' || algo === 'preemptive') {
    // Menor número = maior prioridade
    return ready.sort((a,b) => a.priority - b.priority)[0];
  }
}

// ── LOG ──
function log(msg, type='') {
  const el = document.getElementById('log-output');
  const line = document.createElement('span');
  line.className = 'log-line ' + type;
  const ts = cpuTime.toString().padStart(4,'0');
  line.textContent = `[${ts}ms] ${msg}`;
  el.appendChild(line);
  el.appendChild(document.createElement('br'));
  el.parentElement.scrollTop = el.parentElement.scrollHeight;
}

// ── TICK ──
function tick() {
  // Incrementa espera dos que não estão rodando
  procState.forEach(p => {
    if (p.active && p.remaining > 0 && (!currentProc || p.id !== currentProc.id)) {
      p.waited++;
    }
  });

  // Round Robin: verifica quantum
  if (algo === 'rr' && currentProc) {
    quantumCount++;
    if (quantumCount >= quantum) {
      quantumCount = 0;
      currentProc = null;
    }
  }

  // Preemptivo: reavalia a cada tick
  if (algo === 'preemptive') {
    currentProc = null;
  }

  // Escolhe próximo se não tem ninguém
  if (!currentProc || currentProc.remaining <= 0) {
    const next = pickNext();
    if (next !== currentProc) {
      if (currentProc) ctxSwitches++;
      currentProc = next;
      quantumCount = 0;
      if (next) log(`▶ ${next.name} ganhou a CPU`, 'highlight');
    }
  }

  if (!currentProc) {
    // Verifica se acabou
    const allDone = procState.every(p => !p.active || p.remaining <= 0);
    if (allDone) {
      finishSim();
      return;
    }
    cpuTime++;
    updateMetrics();
    drawTimeline();
    renderCards();
    return;
  }

  // Executa
  currentProc.remaining--;
  currentProc.ran++;
  cpuTime++;

  timeline.push({ pid: currentProc.id, start: cpuTime - 1, dur: 1, interrupt: false });

  if (currentProc.remaining <= 0) {
    currentProc.status = 'done';
    log(`✓ ${currentProc.name} concluído`, 'ok');
    currentProc = null;
  }

  updateMetrics();
  drawTimeline();
  renderCards();
}

function updateMetrics() {
  document.getElementById('m-cpu').textContent = cpuTime;
  document.getElementById('m-ctx').textContent = ctxSwitches;
  const waited = procState.filter(p=>p.active);
  const avg = waited.length ? Math.round(waited.reduce((s,p)=>s+p.waited,0)/waited.length) : 0;
  document.getElementById('m-wait').textContent = avg;
}

// ── INTERRUPÇÃO ──
function triggerInterrupt() {
  const p4 = procState.find(p => p.id === 'P4');
  if (!p4) return;
  p4.active = true;
  p4.remaining = p4.totalBurst;
  p4.status = 'waiting';

  if (algo === 'preemptive' || algo === 'priority') {
    if (currentProc) ctxSwitches++;
    currentProc = p4;
    quantumCount = 0;
    timeline.push({ pid:'P4', start: cpuTime, dur:0, interrupt: true });
    log('⚡ INTERRUPÇÃO! Obstáculo detectado — P4 preempta CPU', 'warn');
  } else {
    log('⚡ Obstáculo detectado — P4 entra na fila (Round-Robin)', 'warn');
  }

  if (!running) startSim();
}

// ── SIM CONTROL ──
function startSim() {
  if (running) return;
  running = true;
  document.getElementById('btn-start').disabled = true;
  log('▶ Simulação iniciada — algoritmo: ' + algo.toUpperCase(), 'highlight');
  simTimer = setInterval(tick, Math.max(50, 400 / speed));
}

function finishSim() {
  clearInterval(simTimer);
  running = false;
  document.getElementById('btn-start').disabled = false;
  log('■ Simulação concluída. CPU total: ' + cpuTime + 'ms', 'ok');
}

function resetSim() {
  clearInterval(simTimer);
  running = false;
  cpuTime = 0; ctxSwitches = 0; currentProc = null;
  timeline = []; quantumCount = 0;
  document.getElementById('btn-start').disabled = false;
  document.getElementById('log-output').innerHTML = '';
  document.getElementById('m-cpu').textContent = '0';
  document.getElementById('m-ctx').textContent = '0';
  document.getElementById('m-wait').textContent = '0';
  initProcState();
  renderCards();
  drawTimeline();
  log('Sistema reiniciado. Selecione um algoritmo e inicie.', '');
}

// ── INIT ──
document.getElementById('quantum-row').style.display = 'flex';
document.getElementById('quantum-slider').oninput = function() {
  quantum = parseInt(this.value);
  document.getElementById('qval').textContent = this.value + 'ms';
};

initProcState();
renderCards();
drawTimeline();
log('Sistema pronto. Veteranos Tech — ADS Anhanguera.', 'highlight');

window.addEventListener('resize', drawTimeline);
