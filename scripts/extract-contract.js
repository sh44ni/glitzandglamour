/**
 * Build contract-only HTML fragments from raw extractions.
 * Follows the same ggs-wizard-chunk grouping as special-events-v1-contract-only.html:
 * Chunk 1: Sections 01-05
 * Chunk 2: Sections 06-10
 * Chunk 3: Sections 11-15
 * Chunk 4: Sections 16-20
 * Chunk 5: Sections 21-25
 * Chunk 6: Sections 26-29 (data/privacy, no signature section)
 * Chunk 7: Section 31 (signatures)
 */
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'contracts', 'templates');

function buildContractOnly(rawPath, outputPath, contractTitle) {
  const rawHtml = fs.readFileSync(rawPath, 'utf8');
  const $ = cheerio.load(rawHtml);
  
  // Remove builder content, scripts, topbar, etc — we only want the contract div
  $('script').remove();
  $('[onclick]').removeAttr('onclick');
  
  // Get the letterhead
  const lh = $('.c-lh');
  const letterheadHtml = lh.length ? $.html(lh) : '';
  
  // Get all c-sec elements
  const sections = [];
  const cBody = $('.c-body');
  
  // We need to find all c-sec and hr.divider elements in order
  cBody.children().each((_, el) => {
    const $el = $(el);
    if ($el.hasClass('c-sec') || $el.is('hr.divider') || ($el.is('hr') && $el.hasClass('divider'))) {
      sections.push({ type: $el.hasClass('c-sec') ? 'section' : 'divider', html: $.html($el) });
    }
  });
  
  // Find all c-sec elements
  const cSecs = [];
  cBody.find('.c-sec').each((i, el) => {
    cSecs.push($.html($(el)));
  });
  
  console.log(`${contractTitle}: Found ${cSecs.length} sections`);
  
  // Build the chunk groupings based on section numbers
  // The existing template uses this grouping:
  // Chunk 1: 01-05 (client info, services, travel/studio, payment, payment plan)
  // Chunk 2: 06-10 (min booking, same-day, gratuity, cancel, reschedule)
  // Chunk 3: 11-15 (timeline, late, overtime, allergy, photo)
  // Chunk 4: 16-20 (artist rights, comms, sub-artist, trial, minors)
  // Chunk 5: 21-25 (force majeure, independent, dispute, liability, governing law)
  // Chunk 6: 26-29 (severability, entire agreement, expiration, privacy) + optional 30
  // Chunk 7: Section 31 (signatures)
  
  const chunkGroups = [
    [0, 1, 2, 3, 4],     // Sections 01-05 (index 0-4)
    [5, 6, 7, 8, 9],     // Sections 06-10 (index 5-9)
    [10, 11, 12, 13, 14], // Sections 11-15 (index 10-14)
    [15, 16, 17, 18, 19], // Sections 16-20 (index 15-19)
    [20, 21, 22, 23, 24], // Sections 21-25 (index 20-24)
    [25, 26, 27, 28],     // Sections 26-29 (index 25-28)
    [29, 30],             // Section 30-31 (index 29-30) - signatures
  ];
  
  // For in-studio which has only 31 sections (but may skip 30):
  // Adjust if needed
  const totalSections = cSecs.length;
  console.log(`Total sections for ${contractTitle}: ${totalSections}`);
  
  // Build the output
  let output = '<div class="contract">\n\n';
  output += '  <!-- LETTERHEAD -->\n';
  output += letterheadHtml + '\n\n';
  output += '  <div class="c-body">\n';
  
  // Title
  output += `    <div class="c-title">${contractTitle}</div>\n`;
  output += '    <div class="c-sub">Glitz &amp; Glamour Studio · glitzandglamours.com · Vista, CA · @glitzandglamourstudio</div>\n';
  output += '    <hr class="divider gold">\n\n';
  
  // Build each chunk
  for (let ci = 0; ci < chunkGroups.length; ci++) {
    const group = chunkGroups[ci];
    output += '    <div class="ggs-wizard-chunk">\n';
    
    for (let gi = 0; gi < group.length; gi++) {
      const secIdx = group[gi];
      if (secIdx < totalSections) {
        output += cSecs[secIdx] + '\n';
        
        // Add divider between sections within the same chunk (not after last)
        if (gi < group.length - 1 && (secIdx + 1) < totalSections) {
          output += '\n    <hr class="divider">\n\n';
        }
      }
    }
    
    output += '\n    <hr class="divider">\n\n';
    output += '    </div>\n';
  }
  
  output += '  </div><!-- /c-body -->\n\n';
  
  // Footer
  output += '  <div class="c-footer">\n';
  output += '    <span>Glitz &amp; Glamour Studio · glitzandglamours.com · @glitzandglamourstudio</span>\n';
  output += '    <span>Vista, CA · Licensed Cosmetologist · License No. KK635220 · San Diego County</span>\n';
  output += '    <span id="c_footer_ref"></span>\n';
  output += '  </div>\n\n';
  output += '</div><!-- /contract -->\n';
  
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`Wrote ${outputPath} (${output.length} bytes)`);
}

buildContractOnly(
  path.join(OUT_DIR, 'in-studio-raw-extract.html'),
  path.join(OUT_DIR, 'in-studio-v1-contract-only.html'),
  'In-Studio Beauty &amp; Event Services Agreement'
);

buildContractOnly(
  path.join(OUT_DIR, 'on-location-raw-extract.html'),
  path.join(OUT_DIR, 'on-location-v1-contract-only.html'),
  'On-Location Beauty &amp; Event Services Agreement'
);

// Clean up raw extracts
fs.unlinkSync(path.join(OUT_DIR, 'in-studio-raw-extract.html'));
fs.unlinkSync(path.join(OUT_DIR, 'on-location-raw-extract.html'));
console.log('Cleaned up raw extracts');
