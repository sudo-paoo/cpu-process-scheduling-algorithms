// TODO: Add max limiter for burst and arrival inputs
const MIN_PROCESSES = 3;
const MAX_PROCESSES = 10;
const ALGORITHM_NAMES = {
  FCFS: 'First Come, First Served',
  SJF: 'Shortest Job First',
  SRT: 'Shortest Remaining Time',
  RR: 'Round Robin',
  Priority: 'Priority',
  PriorityRR: 'Priority + Round Robin',
};

let currentAlgorithm = '';
let processCount = 0;
let snackbarHideTimer = null;
let lastResult = null;

const tableBody = document.getElementById('process-tbody');
const algorithmSelect = document.getElementById('algorithm-select');
const processCountDisplay = document.getElementById('process-count-display');
const quantumContainer = document.getElementById('quantum-container');
const priorityModeContainer = document.getElementById('priority-mode-container');
const preemptionContainer = document.getElementById('preemption-container');
const snackbarEl = document.getElementById('app-snackbar');

// UI bindings
document.getElementById('btn-add-process')?.addEventListener('click', addProcess);
document.getElementById('btn-remove-process')?.addEventListener('click', removeLastProcess);
document.getElementById('btn-run')?.addEventListener('click', runSimulation);
document.getElementById('btn-reset')?.addEventListener('click', resetAll);
document.getElementById('btn-replay')?.addEventListener('click', replayAnimation);
algorithmSelect?.addEventListener('change', event => setAlgorithm(event.target.value));

initTemplate();

function initTemplate() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }

  // Default rows
  for (let i = 0; i < MIN_PROCESSES; i += 1) {
    addProcess();
  }
  setAlgorithm('');
}

function setAlgorithm(algo) {
  // Selected algorithm
  currentAlgorithm = algo;
  if (algorithmSelect && algorithmSelect.value !== algo) {
    algorithmSelect.value = algo;
  }

  const showQuantum = algo === 'RR' || algo === 'PriorityRR';
  const showPriority = algo === 'Priority' || algo === 'PriorityRR';
  const showPreemption = algo === 'Priority';

  // Conditional controls
  quantumContainer?.classList.toggle('hidden', !showQuantum);
  priorityModeContainer?.classList.toggle('hidden', !showPriority);
  preemptionContainer?.classList.toggle('hidden', !showPreemption);

  document.querySelectorAll('.priority-header').forEach(el => el.classList.toggle('hidden', !showPriority));
  document.querySelectorAll('.priority-cell').forEach(el => el.classList.toggle('hidden', !showPriority));
}

function addProcess() {
  if (!tableBody || !processCountDisplay) return;
  if (processCount >= MAX_PROCESSES) {
    showNotice(`Maximum ${MAX_PROCESSES} processes allowed.`);
    return;
  }

  processCount += 1;
  processCountDisplay.textContent = String(processCount);

  // New process row
  const pid = `P${processCount}`;
  const row = document.createElement('tr');
  row.className = 'process-row';
  row.id = `row-p${processCount}`;

  const pidCell = document.createElement('td');
  pidCell.className = 'process-cell';
  const pill = document.createElement('span');
  pill.className = `pid-pill ${getPidColorClass(pid)}`;
  pill.textContent = pid;
  pidCell.appendChild(pill);

  const arrivalCell = document.createElement('td');
  arrivalCell.className = 'process-cell';
  const arrivalInput = buildNumberInput('arrival-input', 0, 0);
  arrivalCell.appendChild(arrivalInput);

  const burstCell = document.createElement('td');
  burstCell.className = 'process-cell';
  const burstInput = buildNumberInput('burst-input', processCount * 2, 1);
  burstCell.appendChild(burstInput);

  const priorityCell = document.createElement('td');
  const showPriority = currentAlgorithm === 'Priority' || currentAlgorithm === 'PriorityRR';
  priorityCell.className = `process-cell priority-cell ${showPriority ? '' : 'hidden'}`.trim();
  const priorityInput = buildNumberInput('priority-input', processCount, 1);
  priorityCell.appendChild(priorityInput);

  row.appendChild(pidCell);
  row.appendChild(arrivalCell);
  row.appendChild(burstCell);
  row.appendChild(priorityCell);
  tableBody.appendChild(row);
}

function removeLastProcess() {
  if (!processCountDisplay || processCount <= MIN_PROCESSES) {
    showNotice(`Minimum ${MIN_PROCESSES} processes required.`);
    return;
  }

  const lastRow = document.getElementById(`row-p${processCount}`);
  if (lastRow) {
    lastRow.remove();
    processCount -= 1;
    processCountDisplay.textContent = String(processCount);
  }
}

function buildNumberInput(inputClass, value, min) {
  const input = document.createElement('input');
  input.type = 'number';
  input.className = `process-input ${inputClass}`;
  input.value = String(value);
  input.min = String(min);
  return input;
}

function readProcessInputs() {
  // Read table inputs
  const rows = document.querySelectorAll('.process-row');
  return Array.from(rows).map((row, index) => ({
    pid: `P${index + 1}`,
    arrival: Number.parseInt(row.querySelector('.arrival-input')?.value ?? '0', 10) || 0,
    burst: Number.parseInt(row.querySelector('.burst-input')?.value ?? '1', 10) || 1,
    priority: Number.parseInt(row.querySelector('.priority-input')?.value ?? '1', 10) || 1,
  }));
}

function validateInputs(processes, quantumRequired, quantum) {
  // Clear validation styles
  let isValid = true;
  document.querySelectorAll('.process-input').forEach(el => el.classList.remove('is-invalid'));
  document.getElementById('time-quantum')?.classList.remove('is-invalid');

  processes.forEach((p, index) => {
    const row = document.getElementById(`row-p${index + 1}`);
    if (!row) return;

    const arrivalInput = row.querySelector('.arrival-input');
    const burstInput = row.querySelector('.burst-input');

    if (Number.isNaN(p.arrival) || p.arrival < 0) {
      arrivalInput?.classList.add('is-invalid');
      isValid = false;
    }
    if (Number.isNaN(p.burst) || p.burst < 1) {
      burstInput?.classList.add('is-invalid');
      isValid = false;
    }
  });

  if (quantumRequired && (Number.isNaN(quantum) || quantum < 1)) {
    document.getElementById('time-quantum')?.classList.add('is-invalid');
    isValid = false;
  }

  return isValid;
}

function runSimulation() {
  if (!currentAlgorithm) {
    // Missing algorithm
    showNotice('Select an algorithm first.');
    return;
  }

  const algorithmName = getAlgorithmName(currentAlgorithm);

  const processes = readProcessInputs();
  const quantum = Number.parseInt(document.getElementById('time-quantum')?.value ?? '2', 10) || 2;
  const needsQuantum = currentAlgorithm === 'RR' || currentAlgorithm === 'PriorityRR';

  if (!validateInputs(processes, needsQuantum, quantum)) {
    // Invalid inputs
    showNotice('Fix highlighted fields before running.');
    return;
  }

  if (typeof window.runSelectedAlgorithm !== 'function') {
    // No algorithm yet
    showNotice(`No algorithm yet for ${algorithmName}.`);
    return;
  }

  let result;
  try {
    result = window.runSelectedAlgorithm({
      algorithm: currentAlgorithm,
      processes,
      quantum,
      priorityMode: document.querySelector('input[name="priority-mode"]:checked')?.value ?? 'lower-higher',
      preemptionMode: document.querySelector('input[name="preemption-mode"]:checked')?.value ?? 'non-preemptive',
    });
  } catch {
    showNotice(`No algorithm yet for ${algorithmName}.`);
    return;
  }

  if (!result || !Array.isArray(result.ganttBlocks) || !Array.isArray(result.results)) {
    showNotice(`No algorithm yet for ${algorithmName}.`);
    return;
  }

  lastResult = result;
  // Render outputs
  renderGantt(result.ganttBlocks, result.results);
  renderResultsTable(result.results);
  renderMetrics(result.results);

  document.getElementById('simulation-empty')?.classList.add('hidden');
  document.getElementById('gantt-panel')?.classList.remove('hidden');
  const label = document.getElementById('gantt-algo-label');
  if (label) label.textContent = `${algorithmName} — Gantt Chart`;
}

function renderGantt(ganttBlocks, results) {
  const container = document.getElementById('gantt-container');
  const timeRow = document.getElementById('gantt-time');
  if (!container || !timeRow) return;

  // Clear gantt
  container.innerHTML = '';
  timeRow.innerHTML = '';

  const totalTime = Math.max(...ganttBlocks.map(b => b.end), 1);

  ganttBlocks.forEach(block => {
    // Segment width
    const duration = Math.max(block.end - block.start, 0);
    const widthPercent = (duration / totalTime) * 100;

    const bar = document.createElement('div');
    bar.className = `block ${getPidColorClass(block.pid)}`;
    bar.style.width = `${widthPercent}%`;
    bar.textContent = block.pid;
    container.appendChild(bar);
  });

  if (window.anime) {
    anime({
      targets: '#gantt-container .block',
      width: ['0%', el => el.style.width],
      easing: 'easeOutQuart',
      duration: 600,
      delay: anime.stagger(100),
    });
  }

  ganttBlocks.forEach(block => {
    // Start marker
    const marker = document.createElement('span');
    marker.textContent = String(block.start);
    marker.style.position = 'absolute';
    marker.style.left = `${(block.start / totalTime) * 100}%`;
    marker.style.transform = 'translateX(-50%)';
    timeRow.appendChild(marker);
  });

  const finalMarker = document.createElement('span');
  // End marker
  finalMarker.textContent = String(totalTime);
  finalMarker.style.position = 'absolute';
  finalMarker.style.left = '100%';
  finalMarker.style.transform = 'translateX(-50%)';
  timeRow.appendChild(finalMarker);

  renderGanttLegend(results, ganttBlocks.some(b => b.pid === 'IDLE'));
}

function renderGanttLegend(results, hasIdle) {
  const legend = document.getElementById('gantt-legend');
  if (!legend) return;
  legend.innerHTML = '';

  results.forEach(p => {
    const item = document.createElement('span');
    item.className = 'legend-item';

    const dot = document.createElement('span');
    dot.className = `legend-dot ${getPidColorClass(p.pid)}`;
    item.appendChild(dot);

    item.appendChild(document.createTextNode(p.pid));
    legend.appendChild(item);
  });

  if (hasIdle) {
    const idleItem = document.createElement('span');
    idleItem.className = 'legend-item';

    const idleDot = document.createElement('span');
    idleDot.className = 'legend-dot pid-color-idle';
    idleItem.appendChild(idleDot);
    idleItem.appendChild(document.createTextNode('IDLE'));
    legend.appendChild(idleItem);
  }
}

function renderResultsTable(results) {
  const tbody = document.getElementById('results-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const displayResults = [...results].sort((a, b) => {
    const aNum = Number.parseInt(String(a.pid).replace(/^P/i, ''), 10);
    const bNum = Number.parseInt(String(b.pid).replace(/^P/i, ''), 10);

    if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }

    return String(a.pid).localeCompare(String(b.pid), undefined, { numeric: true });
  });

  // Result rows
  displayResults.forEach(p => {
    const row = document.createElement('tr');
    row.appendChild(buildPidResultCell(p.pid));
    row.appendChild(buildTextCell(p.arrival));
    row.appendChild(buildTextCell(p.burst));
    row.appendChild(buildTextCell(p.ct, true));
    row.appendChild(buildTextCell(p.tat, true));
    row.appendChild(buildTextCell(p.wt, true));
    tbody.appendChild(row);
  });
}

function buildPidResultCell(pid) {
  const td = document.createElement('td');
  const pill = document.createElement('span');
  pill.className = 'pid-colored-pill';

  const dot = document.createElement('span');
  dot.className = `pid-color-dot ${getPidColorClass(pid)}`;
  pill.appendChild(dot);
  pill.appendChild(document.createTextNode(pid));
  td.appendChild(pill);

  return td;
}

function buildTextCell(value, center = false) {
  const td = document.createElement('td');
  if (center) td.className = 'text-center';
  td.textContent = value === null || value === undefined ? '-' : String(value);
  return td;
}

function renderMetrics(results) {
  // Metric placeholders
  const hasComputedMetrics = results.every(p => Number.isFinite(p.wt) && Number.isFinite(p.tat));
  if (!hasComputedMetrics) {
    setText('avg-wt-display', '-');
    setText('avg-tat-display', '-');
    return;
  }

  const avgWt = results.reduce((sum, p) => sum + p.wt, 0) / results.length;
  const avgTat = results.reduce((sum, p) => sum + p.tat, 0) / results.length;
  setText('avg-wt-display', avgWt.toFixed(2));
  setText('avg-tat-display', avgTat.toFixed(2));
}

function replayAnimation() {
  if (!lastResult) return;
  const btn = document.getElementById('btn-replay');
  btn?.classList.add('btn-replaying');
  setTimeout(() => btn?.classList.remove('btn-replaying'), 500);
  renderGantt(lastResult.ganttBlocks, lastResult.results);
}

function resetAll() {
  // Reset template
  if (tableBody) tableBody.innerHTML = '';
  processCount = 0;
  for (let i = 0; i < MIN_PROCESSES; i += 1) {
    addProcess();
  }

  setAlgorithm('');
  setText('avg-wt-display', '-');
  setText('avg-tat-display', '-');

  const legend = document.getElementById('gantt-legend');
  if (legend) legend.innerHTML = '';

  const tbody = document.getElementById('results-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td>-</td>
        <td class="text-center">-</td>
        <td class="text-center">-</td>
        <td class="text-center">-</td>
        <td class="text-center">-</td>
        <td class="text-center">-</td>
      </tr>
    `;
  }

  document.getElementById('simulation-empty')?.classList.remove('hidden');
  document.getElementById('gantt-panel')?.classList.add('hidden');
  lastResult = null;
}

function getPidColorClass(pid) {
  // PID color slot
  if (pid === 'IDLE') return 'pid-color-idle';
  const pidNumber = Number.parseInt(String(pid).replace(/^P/i, ''), 10);
  if (!Number.isFinite(pidNumber) || pidNumber < 1) return 'pid-color-idle';
  const slot = ((pidNumber - 1) % 10) + 1;
  return `pid-color-${slot}`;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showNotice(message, tone = 'error', duration = 2600) {
  // Snackbar message
  if (!snackbarEl) return;

  if (snackbarHideTimer) {
    clearTimeout(snackbarHideTimer);
  }

  snackbarEl.textContent = message;
  snackbarEl.classList.remove('show', 'snackbar-error', 'snackbar-info');
  snackbarEl.classList.add(tone === 'info' ? 'snackbar-info' : 'snackbar-error');

  requestAnimationFrame(() => {
    snackbarEl.classList.add('show');
  });

  snackbarHideTimer = setTimeout(() => {
    snackbarEl.classList.remove('show');
  }, duration);
}

function getAlgorithmName(code) {
  return ALGORITHM_NAMES[code] ?? code;
}