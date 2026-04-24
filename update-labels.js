const fs = require('fs');
const { load } = require('cheerio');
const html = fs.readFileSync('GGS-SVC-002_v1.2 (1).html', 'utf-8');
const $ = load(html);
const labels = {};
$('.init-row').each((_, el) => {
  const id = $(el).attr('id');
  const label = $(el).find('.init-label').first().html()?.trim();
  if (id && label) labels[id] = label;
});
let tsContent = 'import type { SpecialEventInitId } from \'./specialEventConstants\';\n\nexport const SPECIAL_EVENT_INIT_LABELS: Record<SpecialEventInitId, string> = {\n';
for (const [key, val] of Object.entries(labels)) {
  tsContent += `    ${key}: '${val.replace(/'/g, "\\'")}',\n`;
}
tsContent += '};\n';
fs.writeFileSync('src/lib/contracts/specialEventInitLabels.ts', tsContent);
console.log('Updated specialEventInitLabels.ts');
