import fs from 'fs';
import path from 'path';
import { SERVICES_DETAILED } from '../src/data/servicesDetailed';

interface LintIssue {
  type: 'ERROR' | 'WARN';
  page: string;
  message: string;
}

const issues: LintIssue[] = [];

console.log('\n🔍 Running SEO Linter across glitzandglamours.com...\n');

// 1. Audit all 29 Services
console.log('--- Auditing 29 Detailed Services ---');
if (SERVICES_DETAILED.length !== 29) {
  issues.push({
    type: 'ERROR',
    page: 'SERVICES_DETAILED',
    message: `Expected strictly 29 services, found ${SERVICES_DETAILED.length}`,
  });
}

SERVICES_DETAILED.forEach((s) => {
  const pageName = `/services/${s.slug}`;

  // Title check (<= 60 chars)
  if (s.seoTitle.length > 60) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `SEO Title is ${s.seoTitle.length} chars (must be <= 60): "${s.seoTitle}"`,
    });
  }

  // Meta description check (120 - 160 chars)
  if (s.seoDescription.length < 120 || s.seoDescription.length > 160) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Meta Description is ${s.seoDescription.length} chars (must be between 120 and 160): "${s.seoDescription}"`,
    });
  }

  // Word count check (>= 250 words)
  const fullText = [
    ...s.overview,
    ...s.whoItsFor,
    ...s.whatsIncluded,
    ...s.faqs.map((f) => `${f.q} ${f.a}`),
    s.pricingDisclaimer,
  ].join(' ');

  const words = fullText.trim().split(/\s+/).filter(Boolean).length;
  if (words < 250) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Body word count is ${words} words (must be >= 250)`,
    });
  }
});

// 2. Audit Core Templates for Canonical URLs and H1s
console.log('--- Auditing Core Layouts and Templates ---');
const templateChecks = [
  {
    file: 'src/components/HomeClient.tsx',
    name: 'Home Page (/)',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/services/page.tsx',
    name: 'Services (/services)',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/services/[slug]/page.tsx',
    name: 'Service Detail (/services/[slug])',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/gallery/page.tsx',
    name: 'Gallery (/gallery)',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/reviews/page.tsx',
    name: 'Reviews (/reviews)',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/privacy/page.tsx',
    name: 'Privacy (/privacy)',
    expectedH1Count: 1,
  },
  {
    file: 'src/app/terms/page.tsx',
    name: 'Terms (/terms)',
    expectedH1Count: 1,
  },
];

templateChecks.forEach((t) => {
  const filePath = path.join(process.cwd(), t.file);
  if (!fs.existsSync(filePath)) {
    issues.push({ type: 'ERROR', page: t.name, message: `File not found: ${t.file}` });
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');

  // Count <h1> tags (excluding comments or strings if feasible)
  const h1Matches = content.match(/<h1[\s>]/g) || [];
  if (h1Matches.length !== t.expectedH1Count) {
    issues.push({
      type: 'ERROR',
      page: t.name,
      message: `Found ${h1Matches.length} <h1> tag(s), expected exactly ${t.expectedH1Count}`,
    });
  }
});

// 3. Audit Layout Canonicals
const layoutChecks = [
  { file: 'src/app/layout.tsx', name: 'Root Layout' },
  { file: 'src/app/services/layout.tsx', name: 'Services Layout' },
  { file: 'src/app/gallery/layout.tsx', name: 'Gallery Layout' },
  { file: 'src/app/reviews/layout.tsx', name: 'Reviews Layout' },
  { file: 'src/app/book/layout.tsx', name: 'Book Layout' },
];

layoutChecks.forEach((l) => {
  const filePath = path.join(process.cwd(), l.file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for non-www canonical
  const nonWwwCanonical = content.match(/canonical:\s*['"]https:\/\/glitzandglamours\.com/g);
  if (nonWwwCanonical) {
    issues.push({
      type: 'ERROR',
      page: l.name,
      message: `Contains non-www canonical URL! Must use https://www.glitzandglamours.com`,
    });
  }
});

// 4. Output Results
if (issues.length === 0) {
  console.log('✅ ALL SEO LINT CHECKS PASSED!');
  console.log(`- 29/29 services verified (titles <= 60, meta descriptions 120-160, words >= 250)`);
  console.log(`- All templates have exactly 1 <h1>`);
  console.log(`- All canonical tags strictly enforce https://www.glitzandglamours.com\n`);
  process.exit(0);
} else {
  console.error(`\n❌ FOUND ${issues.length} SEO LINT ISSUES:\n`);
  issues.forEach((iss, idx) => {
    console.error(`  ${idx + 1}. [${iss.type}] ${iss.page}: ${iss.message}`);
  });
  console.log('\n');
  process.exit(1);
}
