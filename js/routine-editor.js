let editorDayIndex = 0;
let currentRoutine = null;

function getCurrentRoutine() {
  return currentRoutine || getRoutine();
}

function setCurrentRoutine(routine) {
  currentRoutine = cloneRoutine(routine);
  saveRoutine(currentRoutine);
  renderRoutineView(currentRoutine);
  refreshLogExercises();
}

async function startBlankRoutine() {
  setCurrentRoutine(createEmptyRoutine());
  hideWelcome();
  showPage('editor', document.querySelector('[data-page="editor"]'));
}

async function startTemplateRoutine() {
  const template = await loadDefaultRoutine();
  setCurrentRoutine(template);
  hideWelcome();
  showPage('rutina', document.querySelector('[data-page="rutina"]'));
}

async function resetToTemplate() {
  if (!confirm('¿Reemplazar tu rutina con el ejemplo? Se pierden los cambios actuales.')) return;
  const template = await loadDefaultRoutine();
  setCurrentRoutine(template);
  renderEditor();
}

function hideWelcome() {
  const modal = document.getElementById('welcomeModal');
  if (modal) modal.classList.remove('show');
}

function showWelcome() {
  const modal = document.getElementById('welcomeModal');
  if (modal) modal.classList.add('show');
}

function renderEditor() {
  const routine = getCurrentRoutine();
  if (!routine) return;

  const el = document.getElementById('page-editor');
  if (!routine.days.length) {
    routine.days.push({
      id: uid(),
      name: 'Día 1',
      short: 'D1',
      focus: '',
      tag: null,
      sections: [],
    });
  }

  if (editorDayIndex >= routine.days.length) editorDayIndex = 0;
  const day = routine.days[editorDayIndex];

  el.innerHTML = `
    <h2>Editar rutina</h2>
    <p class="sub">Los cambios se guardan automáticamente en tu dispositivo</p>

    <div class="editor-card">
      <label>Nombre de la rutina</label>
      <input type="text" id="edTitle" value="${escapeHtml(routine.title)}" placeholder="Mi Rutina">
      <label>Descripción</label>
      <input type="text" id="edSubtitle" value="${escapeHtml(routine.subtitle)}" placeholder="Ej: Fuerza · 4 días">
    </div>

    <div class="editor-day-tabs">
      ${routine.days
        .map(
          (d, i) =>
            `<button type="button" class="tab${i === editorDayIndex ? ' active' : ''}" onclick="selectEditorDay(${i})">${escapeHtml(d.short || d.name)}</button>`
        )
        .join('')}
      <button type="button" class="tab tab-add" onclick="addEditorDay()">+</button>
    </div>

    <div class="editor-card">
      <label>Día — nombre completo</label>
      <input type="text" id="edDayName" value="${escapeHtml(day.name)}">
      <div class="editor-row">
        <div>
          <label>Abreviatura (pestaña)</label>
          <input type="text" id="edDayShort" value="${escapeHtml(day.short)}" maxlength="4">
        </div>
        <div>
          <label>Enfoque</label>
          <input type="text" id="edDayFocus" value="${escapeHtml(day.focus)}" placeholder="Ej: Pecho + Tríceps">
        </div>
      </div>
      <label>Etiqueta (opcional)</label>
      <input type="text" id="edDayTag" value="${escapeHtml(day.tag?.text || '')}" placeholder="Ej: Día de prioridad">
      <div class="editor-actions-row">
        ${routine.days.length > 1 ? `<button type="button" class="btn-danger" onclick="deleteEditorDay()">Eliminar este día</button>` : ''}
      </div>
    </div>

    <div id="editorSections">
      ${renderEditorSections(day)}
    </div>

    <button type="button" class="btn-secondary" onclick="addEditorSection()">+ Agregar sección</button>

    <div class="editor-footer">
      <button type="button" class="btn-secondary" onclick="resetToTemplate()">Restaurar ejemplo</button>
      <button type="button" class="log-btn" onclick="showPage('rutina', document.querySelector('[data-page=rutina]'))">Ver rutina</button>
    </div>
  `;

  bindEditorInputs(routine, day);
}

function renderEditorSections(day) {
  if (!day.sections.length) {
    return '<p class="empty-day">Sin secciones. Agregá una para empezar.</p>';
  }

  return day.sections
    .map(
      (section, si) => `
    <div class="editor-card editor-section" data-section="${si}">
      <div class="editor-section-head">
        <input type="text" class="ed-section-label" data-section="${si}" value="${escapeHtml(section.label)}" placeholder="Nombre de la sección">
        <button type="button" class="btn-icon-danger" onclick="deleteEditorSection(${si})" title="Eliminar sección">×</button>
      </div>
      ${(section.exercises || [])
        .map(
          (ex, ei) => `
        <div class="editor-exercise" data-section="${si}" data-exercise="${ei}">
          <input type="text" class="ed-ex-name" data-s="${si}" data-e="${ei}" value="${escapeHtml(ex.name)}" placeholder="Nombre del ejercicio">
          <input type="text" class="ed-ex-sets" data-s="${si}" data-e="${ei}" value="${escapeHtml(ex.sets)}" placeholder="Ej: 3 series × 10 reps">
          <textarea class="ed-ex-tip" data-s="${si}" data-e="${ei}" rows="2" placeholder="Tips / notas (opcional)">${escapeHtml(ex.tip)}</textarea>
          <input type="text" class="ed-ex-muscles" data-s="${si}" data-e="${ei}" value="${escapeHtml((ex.muscles || []).join(', '))}" placeholder="Músculos (separados por coma)">
          <input type="url" class="ed-ex-link" data-s="${si}" data-e="${ei}" value="${escapeHtml(ex.linkUrl)}" placeholder="Link de técnica (opcional)">
          <button type="button" class="btn-danger-sm" onclick="deleteEditorExercise(${si}, ${ei})">Eliminar ejercicio</button>
        </div>`
        )
        .join('')}
      <button type="button" class="btn-secondary-sm" onclick="addEditorExercise(${si})">+ Ejercicio</button>
    </div>`
    )
    .join('');
}

function bindEditorInputs(routine, day) {
  const save = () => persistEditor();

  document.getElementById('edTitle')?.addEventListener('input', save);
  document.getElementById('edSubtitle')?.addEventListener('input', save);
  document.getElementById('edDayName')?.addEventListener('input', save);
  document.getElementById('edDayShort')?.addEventListener('input', save);
  document.getElementById('edDayFocus')?.addEventListener('input', save);
  document.getElementById('edDayTag')?.addEventListener('input', save);

  document.querySelectorAll('.ed-section-label, .ed-ex-name, .ed-ex-sets, .ed-ex-tip, .ed-ex-muscles, .ed-ex-link').forEach((input) => {
    input.addEventListener('input', save);
  });
}

function persistEditor() {
  const routine = getCurrentRoutine();
  if (!routine) return;

  routine.title = document.getElementById('edTitle')?.value.trim() || 'Mi Rutina';
  routine.subtitle = document.getElementById('edSubtitle')?.value.trim() || '';

  const day = routine.days[editorDayIndex];
  if (!day) return;

  day.name = document.getElementById('edDayName')?.value.trim() || 'Día';
  day.short = document.getElementById('edDayShort')?.value.trim() || day.name.slice(0, 3);
  day.focus = document.getElementById('edDayFocus')?.value.trim() || '';

  const tagText = document.getElementById('edDayTag')?.value.trim();
  day.tag = tagText
    ? { text: tagText, bg: day.tag?.bg || '#1a2540', color: day.tag?.color || '#57c8ff' }
    : null;

  document.querySelectorAll('.ed-section-label').forEach((input) => {
    const si = +input.dataset.section;
    if (routine.days[editorDayIndex].sections[si]) {
      routine.days[editorDayIndex].sections[si].label = input.value.trim() || 'Sección';
    }
  });

  document.querySelectorAll('.ed-ex-name').forEach((input) => {
    const si = +input.dataset.s;
    const ei = +input.dataset.e;
    const ex = routine.days[editorDayIndex].sections[si]?.exercises[ei];
    if (ex) ex.name = input.value.trim();
  });

  document.querySelectorAll('.ed-ex-sets').forEach((input) => {
    const si = +input.dataset.s;
    const ei = +input.dataset.e;
    const ex = routine.days[editorDayIndex].sections[si]?.exercises[ei];
    if (ex) ex.sets = input.value.trim();
  });

  document.querySelectorAll('.ed-ex-tip').forEach((input) => {
    const si = +input.dataset.s;
    const ei = +input.dataset.e;
    const ex = routine.days[editorDayIndex].sections[si]?.exercises[ei];
    if (ex) ex.tip = input.value.trim();
  });

  document.querySelectorAll('.ed-ex-muscles').forEach((input) => {
    const si = +input.dataset.s;
    const ei = +input.dataset.e;
    const ex = routine.days[editorDayIndex].sections[si]?.exercises[ei];
    if (ex) {
      ex.muscles = input.value.split(',').map((m) => m.trim()).filter(Boolean);
    }
  });

  document.querySelectorAll('.ed-ex-link').forEach((input) => {
    const si = +input.dataset.s;
    const ei = +input.dataset.e;
    const ex = routine.days[editorDayIndex].sections[si]?.exercises[ei];
    if (ex) {
      ex.linkUrl = input.value.trim();
      ex.linkLabel = ex.linkUrl.includes('youtube') ? '▶ Buscar técnica en YouTube' : '▶ Ver técnica';
    }
  });

  saveRoutine(routine);
  renderRoutineView(routine);
  refreshLogExercises();
}

function selectEditorDay(i) {
  persistEditor();
  editorDayIndex = i;
  renderEditor();
}

function addEditorDay() {
  persistEditor();
  const routine = getCurrentRoutine();
  const n = routine.days.length + 1;
  routine.days.push({
    id: uid(),
    name: `Día ${n}`,
    short: `D${n}`,
    focus: '',
    tag: null,
    sections: [],
  });
  saveRoutine(routine);
  editorDayIndex = routine.days.length - 1;
  renderEditor();
  renderRoutineView(routine);
}

function deleteEditorDay() {
  const routine = getCurrentRoutine();
  if (routine.days.length <= 1) return;
  if (!confirm('¿Eliminar este día?')) return;
  routine.days.splice(editorDayIndex, 1);
  editorDayIndex = Math.max(0, editorDayIndex - 1);
  saveRoutine(routine);
  renderEditor();
  renderRoutineView(routine);
}

function addEditorSection() {
  persistEditor();
  const routine = getCurrentRoutine();
  routine.days[editorDayIndex].sections.push({
    id: uid(),
    label: 'Nueva sección',
    exercises: [],
  });
  saveRoutine(routine);
  renderEditor();
}

function deleteEditorSection(si) {
  if (!confirm('¿Eliminar esta sección y sus ejercicios?')) return;
  persistEditor();
  const routine = getCurrentRoutine();
  routine.days[editorDayIndex].sections.splice(si, 1);
  saveRoutine(routine);
  renderEditor();
  renderRoutineView(routine);
}

function addEditorExercise(si) {
  persistEditor();
  const routine = getCurrentRoutine();
  routine.days[editorDayIndex].sections[si].exercises.push({
    id: uid(),
    name: '',
    sets: '',
    tip: '',
    muscles: [],
    linkUrl: '',
    linkLabel: '',
  });
  saveRoutine(routine);
  renderEditor();
}

function deleteEditorExercise(si, ei) {
  persistEditor();
  const routine = getCurrentRoutine();
  routine.days[editorDayIndex].sections[si].exercises.splice(ei, 1);
  saveRoutine(routine);
  renderEditor();
  renderRoutineView(routine);
}

function openEditorPage() {
  if (!hasRoutine()) {
    showWelcome();
    return;
  }
  currentRoutine = getRoutine();
  renderEditor();
}
