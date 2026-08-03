const STORAGE_KEY = 'tu_rutina_data';

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}

function getRoutine() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoutine(routine) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routine));
}

function hasRoutine() {
  return !!getRoutine();
}

async function loadDefaultRoutine() {
  const res = await fetch('data/default-routine.json');
  if (!res.ok) throw new Error('No se pudo cargar la plantilla');
  return res.json();
}

function createEmptyRoutine() {
  return {
    title: 'Mi Rutina',
    subtitle: 'Personalizá tus días de entrenamiento',
    days: [
      {
        id: uid(),
        name: 'Día 1',
        short: 'D1',
        focus: '',
        tag: null,
        sections: [],
      },
    ],
  };
}

function getAllExercises(routine) {
  const list = [];
  if (!routine) return list;
  routine.days.forEach((day) => {
    day.sections.forEach((section) => {
      section.exercises.forEach((ex) => {
        if (ex.name) list.push({ name: ex.name, muscle: ex.muscle || inferMuscle(ex) });
      });
    });
  });
  return list;
}

function inferMuscle(ex) {
  const text = (ex.muscles || []).join(' ').toLowerCase();
  if (text.includes('pecho')) return 'pecho';
  if (text.includes('dorsal') || text.includes('espalda') || text.includes('romboide')) return 'espalda';
  if (text.includes('deltoid') || text.includes('hombro') || text.includes('manguito')) return 'hombros';
  if (text.includes('bíceps') || text.includes('biceps') || text.includes('braquial')) return 'biceps';
  if (text.includes('tríceps') || text.includes('triceps')) return 'triceps';
  if (text.includes('glúteo') || text.includes('cuádr') || text.includes('isquio') || text.includes('gemelo') || text.includes('pierna')) return 'piernas';
  return 'todos';
}

function cloneRoutine(routine) {
  return JSON.parse(JSON.stringify(routine));
}
