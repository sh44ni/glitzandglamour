/**
 * Script to extract the contract body from GGS-SVC-002_v1.2 and generate
 * a properly chunked contract-only template.
 */
const fs = require('fs');
const { load } = require('cheerio');

const v12 = fs.readFileSync('./GGS-SVC-002_v1.2 (1).html', 'utf-8');
const $ = load(v12);

// Extract letterhead
const lh = $('.c-lh').first();
const letterheadHtml = $.html(lh);

// Extract the c-body content
const body = $('.c-body').first();
const title = body.find('.c-title').first().html();
const sub = body.find('.c-sub').first().html();

// Get all sections and dividers in order
const sections = [];
body.children().each((_, child) => {
  const $c = $(child);
  const tag = child.tagName?.toLowerCase();
  if (tag === 'div' && $c.hasClass('c-sec')) {
    const secNum = $c.find('.c-sec-num').first().text().trim();
    const num = parseInt(secNum.replace('Section ', ''));
    // Remove script tags and onclick attrs from init-rows
    $c.find('script').remove();
    sections.push({ type: 'section', num, html: $.html($c) });
  } else if (tag === 'hr') {
    sections.push({ type: 'hr', html: $.html($c) });
  }
});

console.log(`Found ${sections.filter(s => s.type === 'section').length} sections`);

// Define wizard chunk groupings (which sections go in which chunk)
// Based on the existing contract-only template structure
const chunkGroups = [
  [1, 2, 3, 4, 5],       // Chunk 1: Sec 01-05
  [6, 7, 8, 9, 10],      // Chunk 2: Sec 06-10
  [11, 12, 13, 14, 15],  // Chunk 3: Sec 11-15
  [16, 17, 18, 19, 20],  // Chunk 4: Sec 16-20
  [21, 22, 23, 24, 25, 26], // Chunk 5: Sec 21-26
  [27, 28, 29, 30],      // Chunk 6: Sec 27-30
  [31],                   // Chunk 7: Sec 31
];

// Build the output
let out = '';
out += '<div class="contract">\n\n';
out += '  <!-- LETTERHEAD -->\n';
out += `  ${letterheadHtml}\n\n`;
out += '  <div class="c-body">\n';
out += `    <div class="c-title">${title}</div>\n`;
out += `    <div class="c-sub">${sub}</div>\n`;
out += '    <hr class="divider gold">\n\n';

for (const group of chunkGroups) {
  out += '    <div class="ggs-wizard-chunk">\n';
  for (let i = 0; i < group.length; i++) {
    const secNum = group[i];
    const secItem = sections.find(s => s.type === 'section' && s.num === secNum);
    if (secItem) {
      if (i > 0) {
        out += '\n    <hr class="divider">\n\n';
      }
      // Remove onclick attributes
      const cleanHtml = secItem.html.replace(/\s*onclick="[^"]*"/g, '');
      out += cleanHtml + '\n';
    }
  }
  out += '\n    <hr class="divider">\n\n';
  out += '    </div>\n';
}

out += '  </div><!-- /c-body -->\n';
out += '</div><!-- /contract -->\n';

fs.writeFileSync('./src/contracts/templates/special-events-v1-contract-only.html', out, 'utf-8');
console.log('Written to special-events-v1-contract-only.html');

// Also print the init labels for updating specialEventInitLabels.ts
const initLabels = {};
$('.init-row').each((_, el) => {
  const id = $(el).attr('id');
  const label = $(el).find('.init-label').first().html()?.trim();
  if (id && label) {
    initLabels[id] = label;
  }
});
console.log('\n--- Init Labels ---');
for (const [id, label] of Object.entries(initLabels)) {
  console.log(`${id}: ${label.substring(0, 80)}...`);
}
