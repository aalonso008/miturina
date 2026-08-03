function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderExerciseCard(ex) {
  const muscles = (ex.muscles || [])
    .map((m) => `<span class="muscle-tag">${escapeHtml(m)}</span>`)
    .join('');
  const link = ex.linkUrl
    ? `<a class="ex-link" href="${escapeHtml(ex.linkUrl)}" target="_blank" rel="noopener">${escapeHtml(ex.linkLabel || 'Ver técnica')}</a>`
    : '';
  const tip = ex.tip ? `<p class="ex-tip">${escapeHtml(ex.tip)}</p>` : '';
  const quickLog = renderQuickLogBlock(ex);
  const safeName = ex.name.replace(/'/g, "\\'");

  return `
    <div class="ex-card" data-ex="${escapeHtml(ex.name)}">
      <div class="ex-main" onclick="toggleEx(this)">
        <div class="ex-left">
          <div class="ex-name">${escapeHtml(ex.name)}</div>
          <div class="ex-sets">${escapeHtml(ex.sets)}</div>
        </div>
        <div class="ex-main-actions">
          <button type="button" class="ex-log-btn" onclick="event.stopPropagation(); openQuickLog('${safeName}', this)" title="Registrar peso">+</button>
          <div class="ex-chevron">⌄</div>
        </div>
      </div>
      <div class="ex-detail">
        ${tip}
        ${muscles ? `<div class="ex-muscles">${muscles}</div>` : ''}
        <div class="ex-detail-actions">
          ${link}
          ${quickLog}
        </div>
      </div>
    </div>`;
}

function openQuickLog(exName, btn) {
  const card = btn.closest('.ex-card');
  card.classList.add('open');
  const input = card.querySelector('.quick-peso');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function renderDayPanel(day, index, active) {
  const tag = day.tag
    ? `<span class="focus-tag" style="background:${escapeHtml(day.tag.bg)};color:${escapeHtml(day.tag.color)};">${escapeHtml(day.tag.text)}</span>`
    : '';

  const sections = (day.sections || [])
    .map((section) => {
      const exercises = (section.exercises || []).map(renderExerciseCard).join('');
      return `
        <div class="section-label">${escapeHtml(section.label)}</div>
        ${exercises || '<p class="empty-day">Sin ejercicios en esta sección.</p>'}
      `;
    })
    .join('');

  return `
    <div class="day-panel${active ? ' active' : ''}" id="day-${index}">
      <div class="day-header">
        <h2>${escapeHtml(day.name)}</h2>
        ${day.focus ? `<div class="focus">${escapeHtml(day.focus)}</div>` : ''}
        ${tag}
      </div>
      ${sections || '<p class="empty-day">Este día no tiene ejercicios todavía.<br>Andá a <strong>Editar</strong> para agregar.</p>'}
    </div>`;
}

function renderRoutineView(routine) {
  const headerTitle = document.getElementById('headerTitle');
  const headerSub = document.getElementById('headerSub');
  if (headerTitle) headerTitle.textContent = routine.title || 'Mi Rutina';
  if (headerSub) headerSub.textContent = routine.subtitle || '';

  const tabsEl = document.getElementById('dayTabs');
  const daysEl = document.getElementById('routineDays');

  if (!routine.days.length) {
    tabsEl.innerHTML = '';
    daysEl.innerHTML = '<p class="empty-day">No hay días en tu rutina. Andá a <strong>Editar</strong> para crear uno.</p>';
    return;
  }

  tabsEl.innerHTML = routine.days
    .map(
      (day, i) =>
        `<button class="tab${i === 0 ? ' active' : ''}" onclick="showDay(${i})">${escapeHtml(day.short || day.name.slice(0, 3))}</button>`
    )
    .join('');

  daysEl.innerHTML = routine.days
    .map((day, i) => renderDayPanel(day, i, i === 0))
    .join('');
}
