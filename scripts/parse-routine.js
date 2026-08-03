const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const daysDir = path.join(root, 'content', 'days');
const dayFiles = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
const shorts = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}

function parseDay(html, short) {
  const name = html.match(/<h2>(.*?)<\/h2>/)?.[1] || 'Día';
  const focus = html.match(/<div class="focus">(.*?)<\/div>/)?.[1] || '';
  const tagMatch = html.match(/<span class="focus-tag" style="background:([^;]+);color:([^;]+);">(.*?)<\/span>/);
  const tag = tagMatch
    ? { text: tagMatch[3], bg: tagMatch[1], color: tagMatch[2] }
    : null;

  const sections = [];
  const parts = html.split(/<div class="section-label">/);
  parts.slice(1).forEach((part) => {
    const label = part.match(/^([^<]+)<\/div>/)?.[1]?.trim();
    if (!label) return;

    const section = { id: uid(), label, exercises: [] };
    const cardRegex = /<div class="ex-card">([\s\S]*?)<\/div>\s*(?=<div class="ex-card">|<div class="section-label">|$)/g;
    let match;
    while ((match = cardRegex.exec(part)) !== null) {
      const card = match[1];
      const exName = card.match(/<div class="ex-name">(.*?)<\/div>/)?.[1] || '';
      const sets = card.match(/<div class="ex-sets">(.*?)<\/div>/)?.[1] || '';
      const tip = card.match(/<p class="ex-tip">([\s\S]*?)<\/p>/)?.[1]?.trim() || '';
      const muscles = [...card.matchAll(/<span class="muscle-tag">(.*?)<\/span>/g)].map(m => m[1]);
      const link = card.match(/<a class="ex-link" href="([^"]+)"[^>]*>(.*?)<\/a>/);

      section.exercises.push({
        id: uid(),
        name: exName,
        sets,
        tip,
        muscles,
        linkUrl: link?.[1] || '',
        linkLabel: link?.[2] || '',
      });
    }
    if (section.exercises.length) sections.push(section);
  });

  return { id: uid(), name, short, focus, tag, sections };
}

const routine = {
  title: '💪 Rutina 5 Días',
  subtitle: 'Tren superior · Pecho superior · Hombros · Fuerza',
  days: dayFiles.map((file, i) => {
    const html = fs.readFileSync(path.join(daysDir, file + '.html'), 'utf8');
    const day = parseDay(html, shorts[i]);
    day.short = shorts[i];
    return day;
  }),
};

const outDir = path.join(root, 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'default-routine.json'), JSON.stringify(routine, null, 2));
console.log('Generado data/default-routine.json');
