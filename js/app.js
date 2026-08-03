function showDay(i) {
  document.querySelectorAll('.day-panel').forEach((p, j) => p.classList.toggle('active', j === i));
  document.querySelectorAll('#dayTabs .tab').forEach((b, j) => b.classList.toggle('active', j === i));
}

function toggleEx(btn) {
  btn.closest('.ex-card').classList.toggle('open');
}

function toggleProg(btn) {
  btn.closest('.prog-section').classList.toggle('open');
}

function showPage(name, btn) {
  document.querySelectorAll('[id^="page-"]').forEach((p) => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('nav button').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const tabs = document.querySelector('.day-tabs');
  if (tabs) tabs.style.display = name === 'rutina' ? 'flex' : 'none';

  if (name === 'editor') openEditorPage();
  if (name === 'prog' && typeof renderProgressCharts === 'function') renderProgressCharts();
}

async function loadHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo cargar ' + url);
  return res.text();
}

async function initApp() {
  await Promise.all([
    loadHtml('content/progression.html').then((html) => {
      document.getElementById('page-prog').innerHTML =
        '<div id="progressCharts"></div><div class="prog-theory">' + html + '</div>';
      renderProgressCharts();
    }),
    loadHtml('content/log.html').then((html) => {
      document.getElementById('page-log').innerHTML = html;
      initLog();
    }),
  ]);

  const routine = getRoutine();
  if (routine) {
    currentRoutine = routine;
    renderRoutineView(routine);
    refreshLogExercises();
  } else {
    showWelcome();
    document.getElementById('routineDays').innerHTML =
      '<p class="empty-day">Creá tu rutina para empezar.</p>';
  }
}

initApp().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    '<p style="padding:16px;color:#eb5757">Error cargando la app. Usá <code>npm start</code> para servirla.</p>'
  );
});
