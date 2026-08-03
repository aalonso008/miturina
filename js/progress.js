function toggleProgEx(header) {
  header.closest('.prog-ex-card').classList.toggle('open');
}

function getRoutineExerciseNames() {
  const routine = getRoutine();
  if (!routine) return [];
  const names = [];
  routine.days.forEach((day) => {
    day.sections.forEach((section) => {
      section.exercises.forEach((ex) => {
        if (ex.name && !names.includes(ex.name)) names.push(ex.name);
      });
    });
  });
  return names;
}

function getExerciseStats(name) {
  const logs = getLogsForExercise(name);
  if (!logs.length) return null;
  const weights = logs.map((l) => parseFloat(l.peso)).filter((n) => !isNaN(n));
  const pr = weights.length ? Math.max(...weights) : 0;
  const latest = logs[logs.length - 1];
  const first = logs[0];
  const delta = weights.length >= 2 ? (parseFloat(latest.peso) - parseFloat(first.peso)).toFixed(1) : null;
  return { logs, pr, latest, delta, count: logs.length };
}

function renderMiniChart(logs) {
  const recent = logs.slice(-8);
  const weights = recent.map((l) => parseFloat(l.peso)).filter((n) => !isNaN(n));
  const max = Math.max(...weights, 1);

  return `
    <div class="chart-bars">
      ${recent
        .map((log) => {
          const w = parseFloat(log.peso) || 0;
          const h = Math.round((w / max) * 100);
          return `
          <div class="chart-col">
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height:${h}%"></div>
            </div>
            <span class="chart-val">${log.peso}</span>
            <span class="chart-date">${log.date}</span>
          </div>`;
        })
        .join('')}
    </div>`;
}

function renderProgressCharts() {
  const el = document.getElementById('progressCharts');
  if (!el) return;

  const names = getRoutineExerciseNames();
  if (!names.length) {
    el.innerHTML = '<p class="empty-day">Creá tu rutina para ver el progreso.</p>';
    return;
  }

  const withData = names.map((name) => ({ name, stats: getExerciseStats(name) })).filter((x) => x.stats);
  const withoutData = names.filter((name) => !getExerciseStats(name));

  if (!withData.length) {
    el.innerHTML = `
      <p class="section-label" style="padding-top:0">Tu progreso</p>
      <p class="empty-day">Todavía no hay registros.<br>Usá <strong>Guardar registro</strong> en cada ejercicio para empezar a trackear.</p>`;
    return;
  }

  el.innerHTML = `
    <p class="section-label" style="padding-top:0">Tu progreso</p>
    ${withData
      .map(({ name, stats }) => {
        const deltaText =
          stats.delta !== null
            ? parseFloat(stats.delta) >= 0
              ? `<span class="prog-delta up">+${stats.delta} kg</span>`
              : `<span class="prog-delta down">${stats.delta} kg</span>`
            : '';
        const history = [...stats.logs]
          .reverse()
          .slice(0, 5)
          .map(
            (l) =>
              `<div class="prog-history-row"><span>${l.date}</span><span>${formatLogSummary(l)}</span></div>`
          )
          .join('');

        return `
        <div class="prog-ex-card">
          <div class="prog-ex-header" onclick="toggleProgEx(this)">
            <div class="prog-ex-left">
              <div class="prog-ex-name">${escapeHtml(name)}</div>
              <div class="prog-ex-meta">PR ${stats.pr}kg · ${stats.count} registro${stats.count !== 1 ? 's' : ''} ${deltaText}</div>
            </div>
            <div class="ex-chevron">⌄</div>
          </div>
          <div class="prog-ex-body">
            <div class="chart-label">Peso en el tiempo (últimas sesiones)</div>
            ${renderMiniChart(stats.logs)}
            <div class="chart-label" style="margin-top:14px">Historial reciente</div>
            <div class="prog-history">${history}</div>
          </div>
        </div>`;
      })
      .join('')}
    ${
      withoutData.length
        ? `<p class="prog-pending">${withoutData.length} ejercicio${withoutData.length !== 1 ? 's' : ''} sin registros todavía</p>`
        : ''
    }`;
}
