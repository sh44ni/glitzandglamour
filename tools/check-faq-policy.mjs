// Guard: FAQs (and other policy-restating text) must agree with the Studio Policies page.
// Usage: node tools/check-faq-policy.mjs      (exit 1 on any mismatch)
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const policy = read('src/app/policy/page.tsx');
const problems = [];
const need = (label, hay, needle) => { if (!(needle instanceof RegExp ? needle.test(hay) : hay.includes(needle))) problems.push(`${label}: missing ${needle}`); };
const ban = (label, hay, re) => { const m = hay.match(re); if (m) problems.push(`${label}: forbidden "${m[0]}"`); };

// 1) The facts we mirror must still be on the policy page itself (if the policy changes, this fails loudly).
for (const s of ['24-hour notice is required to transfer your retainer', 'at least 48 hours in advance', 'a $10 late fee applies', 'a $15 late fee applies',
  'A 10-minute grace period', 'Beyond 15 minutes', 'Beyond 20 minutes', 'Cash, Cash App, and Apple Pay accepted', 'Walk-ins are not available at this time',
  'at least 40% of your extensions', '$15 makeup removal fee', '1/4 inch', 'Mobile services based in Oceanside', 'Must be requested within 48 hours', 'complimentary fixes']) need('policy page', policy, s);

// 2) FAQ copy in both languages
for (const lang of ['en', 'es']) {
  const f = JSON.parse(read(`src/locales/${lang}.json`)).faq;
  const L = `${lang}.json faq`;
  need(`${L}.a0_8`, f.a0_8, '24'); need(`${L}.a0_8`, f.a0_8, '48'); need(`${L}.a0_8`, f.a0_8, '$10'); need(`${L}.a0_8`, f.a0_8, '$15');
  need(`${L}.a0_8`, f.a0_8, '10'); need(`${L}.a0_8`, f.a0_8, '15 '); need(`${L}.a0_8`, f.a0_8, '20 ');
  need(`${L}.a0_6`, f.a0_6, 'Cash App'); need(`${L}.a0_6`, f.a0_6, 'Apple Pay');
  ban(`${L}.a0_6`, f.a0_6, /venmo|zelle|stripe|credit|debit|cr[eé]dito|d[eé]bito/i);
  need(`${L}.a4_1`, f.a4_1, '$15'); need(`${L}.a4_2`, f.a4_2, '40%');
  need(`${L}.a3_3`, f.a3_3, 'Accutane'); need(`${L}.a3_3`, f.a3_3, 'Retin-A');
  ban(`${L}.a3_3`, f.a3_3, /6 (months|meses)|5-7/i);
  need(`${L}.a2_5`, f.a2_5, 'Oceanside');
  need(`${L}.a1_6`, f.a1_6, '48'); need(`${L}.a4_6`, f.a4_6, '48');
  if (lang === 'en') { need(`${L}.a0_5`, f.a0_5, 'not available'); ban(`${L}.a0_5`, f.a0_5, /same-day|primarily/i); }
  ban(`${L}.a2_2`, f.a2_2, /unwashed|no lavado|sin lavar/i);
  for (const k of Object.keys(f).filter((k) => /^a\d_\d+$/.test(k))) ban(`${L}.${k}`, f[k], /venmo|zelle|stripe/i);
}

// 3) Other places that restate policy
const footer = read('src/components/SiteFooter.tsx');
ban('SiteFooter', footer, /venmo|zelle|stripe/i);
for (const [file, re] of [['src/app/service-areas/[city]/ServiceAreaDetailClient.tsx', /walk-ins\s*(&amp;|&)\s*appointments welcome/i],
  ['src/data/specialEventsDetailed.ts', /credit card billing/i]]) ban(file, read(file), re);
need('special-events FAQ', read('src/app/special-events/page.tsx'), 'at least 48 hours in advance');

// 4) Kitty: grounded on the same facts, pinned to Sonnet 5.5 (checked once the files exist)
if (fs.existsSync('src/lib/studioPolicies.ts')) {
  const sp = read('src/lib/studioPolicies.ts');
  for (const s of ['24', '48', '$10', '$15', 'Cash App', 'Apple Pay', 'Walk-ins are not available']) need('studioPolicies.ts', sp, s);
  need('studioPolicies.ts', sp, 'NEVER say we accept credit/debit cards, Venmo, Zelle');
  const route = read('src/app/api/chat/route.ts');
  need('chat route', route, "KITTY_MODEL = 'claude-sonnet-5-5'");
  ban('chat route prompt', route, /\$25 deposit/i);
}

if (problems.length) { console.error('FAQ/policy check FAILED:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('FAQ/policy check passed.');
