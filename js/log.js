let selectedEx = '';
let currentFilter = 'todos';

function getLogExercises() {
  const fromRoutine = getAllExercises(getRoutine());
  return fromRoutine.length ? fromRoutine : [];
}

function getLogs() {
  try {
    return JSON.parse(localStorage.getItem('gym_logs') || '[]');
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  try {
    localStorage.setItem('gym_logs', JSON.stringify(logs));
  } catch {}
}

function parseLogDate(log) {
  if (log.ts) return new Date(log.ts);
  const parts = (log.date || '').split('/');
  if (parts.length === 3) {
    const day = +parts[0];
    const month = +parts[1] - 1;
    let year = +parts[2];
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }
  return new Date(0);
}

function getLogsForExercise(name) {
  return getLogs()
    .filter((l) => l.ex === name)
    .sort((a, b) => parseLogDate(a) - parseLogDate(b));
}

function getLastLogForExercise(name) {
  const logs = getLogsForExercise(name);
  return logs.length ? logs[logs.length - 1] : null;
}

function formatLogSummary(log) {
  if (!log) return '';
  let s = `${log.peso}kg`;
  if (log.series) s += ` · ${log.series} series`;
  if (log.reps) s += ` × ${log.reps} reps`;
  if (log.nota) s += ` — ${log.nota}`;
  return s;
}

function addLogEntry(exName, peso, series, reps, nota) {
  const logs = getLogs();
  const now = new Date();
  logs.unshift({
    ex: exName,
    peso,
    series,
    reps,
    nota: nota || '',
    date: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    ts: now.getTime(),
    id: Date.now(),
  });
  saveLogs(logs);
  afterLogSaved();
}

function afterLogSaved() {
  renderLogs();
  renderPicker();
  if (typeof renderProgressCharts === 'function') renderProgressCharts();
  const routine = getRoutine();
  if (routine) renderRoutineView(routine);
}

function saveQuickLog(exName, btn) {
  const card = btn.closest('.ex-card');
  const peso = card.querySelector('.quick-peso')?.value;
  const series = card.querySelector('.quick-series')?.value;
  const reps = card.querySelector('.quick-reps')?.value;
  if (!peso) return alert('Ingresá el peso.');
  addLogEntry(exName, peso, series, reps, '');
  card.querySelector('.quick-peso').value = '';
  card.querySelector('.quick-series').value = '';
  card.querySelector('.quick-reps').value = '';
}

function filterMuscle(m, btn) {
  currentFilter = m;
  document.querySelectorAll('.mf-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  renderPicker();
}

function renderPicker() {
  const el = document.getElementById('exPicker');
  if (!el) return;

  const all = getLogExercises();
  if (!all.length) {
    el.innerHTML = '<p class="empty-log">Agregá ejercicios en tu rutina primero.</p>';
    return;
  }

  const list = currentFilter === 'todos' ? all : all.filter((e) => e.muscle === currentFilter);

  el.innerHTML = list
    .map(
      (e) => `
    <button class="ex-option${selectedEx === e.name ? ' selected' : ''}"
      onclick="selectEx('${e.name.replace(/'/g, "\\'")}', this)">
      ${e.name}
    </button>`
    )
    .join('');
}

function selectEx(name, btn) {
  selectedEx = name;
  document.querySelectorAll('.ex-option').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('exSelected').textContent = '✓ ' + name;
}

function saveLog() {
  if (!selectedEx) return alert('Seleccioná un ejercicio primero.');
  const peso = document.getElementById('logPeso').value;
  const series = document.getElementById('logSeries').value;
  const reps = document.getElementById('logReps').value;
  const nota = document.getElementById('logNota').value.trim();
  if (!peso) return alert('Ingresá el peso.');
  addLogEntry(selectedEx, peso, series, reps, nota);
  document.getElementById('logPeso').value = '';
  document.getElementById('logSeries').value = '';
  document.getElementById('logReps').value = '';
  document.getElementById('logNota').value = '';
}

function deleteLog(id) {
  saveLogs(getLogs().filter((l) => l.id !== id));
  afterLogSaved();
}

function copyLogs() {
  const logs = getLogs();
  if (!logs.length) return alert('No hay registros todavía.');
  const text = logs
    .map(
      (l) =>
        `📅 ${l.date} — ${l.ex}\n   ${l.peso}kg${l.series ? ' · ' + l.series + ' series' : ''}${l.reps ? ' × ' + l.reps + ' reps' : ''}${l.nota ? ' — ' + l.nota : ''}`
    )
    .join('\n\n');
  navigator.clipboard
    .writeText(text)
    .then(() => alert('Copiado al portapapeles ✓'))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Copiado ✓');
    });
}

function renderLogs() {
  const logs = getLogs();
  const el = document.getElementById('logEntries');
  if (!el) return;
  if (!logs.length) {
    el.innerHTML =
      '<div class="empty-log">No hay registros todavía.<br>Seleccioná un ejercicio y cargá tu peso.</div>';
    return;
  }
  el.innerHTML = logs
    .map(
      (l) => `
    <div class="log-entry">
      <div class="log-entry-left">
        <div class="log-entry-name">${l.ex}</div>
        <div class="log-entry-detail">${l.peso}kg${l.series ? ' · ' + l.series + ' series' : ''}${l.reps ? ' × ' + l.reps + ' reps' : ''}${l.nota ? ' — ' + l.nota : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="log-entry-date">${l.date}</div>
        <button class="log-delete" onclick="deleteLog(${l.id})">×</button>
      </div>
    </div>`
    )
    .join('');
}

function initLog() {
  renderPicker();
  renderLogs();
}

function refreshLogExercises() {
  renderPicker();
}

function renderQuickLogBlock(ex) {
  const last = getLastLogForExercise(ex.name);
  const lastHtml = last
    ? `<div class="ex-last-log">Último (${last.date}): <span>${escapeHtml(formatLogSummary(last))}</span></div>`
    : '<div class="ex-last-log muted">Sin registros todavía</div>';
  const safeName = ex.name.replace(/'/g, "\\'");

  return `
    <div class="ex-quick-log">
      ${lastHtml}
      <div class="quick-log-row">
        <input class="quick-peso" type="number" placeholder="kg" min="0" step="0.5" onclick="event.stopPropagation()">
        <input class="quick-series" type="number" placeholder="series" min="1" max="10" onclick="event.stopPropagation()">
        <input class="quick-reps" type="number" placeholder="reps" min="1" max="30" onclick="event.stopPropagation()">
      </div>
      <button type="button" class="quick-log-btn" onclick="event.stopPropagation(); saveQuickLog('${safeName}', this)">Guardar registro</button>
    </div>`;
}
