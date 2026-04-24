const fs = require('fs');
const { load } = require('cheerio');

const v12 = fs.readFileSync('GGS-SVC-002_v1.2 (1).html', 'utf-8');
const $ = load(v12);

// Remove onclick attributes
$('*').removeAttr('onclick');
$('*').removeAttr('onchange');
$('*').removeAttr('oninput');

// Remove scripts
$('script').remove();

// Optional: remove buttons like print/PDF that aren't needed in the backend template
$('.action-buttons').remove();

// Re-write to the full template
fs.writeFileSync('src/contracts/templates/special-events-v1.html', $.html());
console.log('Updated special-events-v1.html');
