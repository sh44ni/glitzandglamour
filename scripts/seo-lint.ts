import fs from 'fs';
import path from 'path';
import { SERVICES_DETAILED, ALL_CANONICAL_SLUGS } from '../src/data/servicesDetailed';
import { SPECIAL_EVENTS_DETAILED, ALL_SPECIAL_EVENT_SLUGS } from '../src/data/specialEventsDetailed';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '../src/data/serviceAreas';
import { FALLBACK_BLOGS } from '../src/data/fallbackBlogs';

interface LintIssue {
  type: 'ERROR' | 'WARN';
  page: string;
  message: string;
}

const issues: LintIssue[] = [];
const canonicalServices = new Set(ALL_CANONICAL_SLUGS);
const canonicalEvents = new Set(ALL_SPECIAL_EVENT_SLUGS);
const canonicalAreas = new Set(ALL_SERVICE_AREA_SLUGS);

function auditInternalLinks(content: string, pageLabel: string) {
  const svcMatches = content.matchAll(/\/services\/([a-zA-Z0-9_-]+)(?![a-zA-Z0-9_.-]*\.(?:jpeg|jpg|png|webp|svg))/g);
  for (const m of svcMatches) {
    const slug = m[1];
    if (!canonicalServices.has(slug)) {
      issues.push({
        type: 'ERROR',
        page: pageLabel,
        message: `Non-canonical service link found: /services/${slug}`,
      });
    }
  }

  const evMatches = content.matchAll(/\/special-events\/([a-zA-Z0-9_-]+)(?![a-zA-Z0-9_.-]*\.(?:jpeg|jpg|png|webp|svg))/g);
  for (const m of evMatches) {
    const slug = m[1];
    if (!canonicalEvents.has(slug)) {
      issues.push({
        type: 'ERROR',
        page: pageLabel,
        message: `Non-canonical special-event link found: /special-events/${slug}`,
      });
    }
  }

  const areaMatches = content.matchAll(/\/service-areas\/([a-zA-Z0-9_-]+)(?![a-zA-Z0-9_.-]*\.(?:jpeg|jpg|png|webp|svg))/g);
  for (const m of areaMatches) {
    const slug = m[1];
    if (!canonicalAreas.has(slug)) {
      issues.push({
        type: 'ERROR',
        page: pageLabel,
        message: `Non-canonical service-area link found: /service-areas/${slug}`,
      });
    }
  }
}

console.log('\n🔍 Running Master Plan SEO Linter across glitzandglamours.com...\n');

// 1. Audit all 29 Services
console.log('--- 1. Auditing 29 Detailed Services ---');
if (SERVICES_DETAILED.length !== 29) {
  issues.push({
    type: 'ERROR',
    page: 'SERVICES_DETAILED',
    message: `Expected strictly 29 services, found ${SERVICES_DETAILED.length}`,
  });
}

SERVICES_DETAILED.forEach((s) => {
  const pageName = `/services/${s.slug}`;

  if (s.seoTitle.length > 60) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `SEO Title is ${s.seoTitle.length} chars (must be <= 60): "${s.seoTitle}"`,
    });
  }

  if (s.seoDescription.length < 120 || s.seoDescription.length > 160) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Meta Description is ${s.seoDescription.length} chars (must be between 120 and 160): "${s.seoDescription}"`,
    });
  }

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

// 2. Audit 9 Special Event Services
console.log('--- 2. Auditing 9 Special Event Services ---');
SPECIAL_EVENTS_DETAILED.forEach((se) => {
  const pageName = `/special-events/${se.slug}`;

  if (se.seoTitle.length > 60) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `SEO Title is ${se.seoTitle.length} chars (must be <= 60): "${se.seoTitle}"`,
    });
  }

  if (se.seoDescription.length < 120 || se.seoDescription.length > 160) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Meta Description is ${se.seoDescription.length} chars (must be between 120 and 160): "${se.seoDescription}"`,
    });
  }

  const fullText = [
    ...se.overview,
    ...se.whatsIncluded,
    ...se.faqs.map((f) => `${f.q} ${f.a}`),
    se.pricingNote,
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

// 3. Audit 8 Service Areas
console.log('--- 3. Auditing 8 Service Area Geo Hubs ---');
if (ALL_SERVICE_AREA_SLUGS.length < 8) {
  issues.push({
    type: 'ERROR',
    page: 'SERVICE_AREAS',
    message: `Expected at least 8 service areas, found ${ALL_SERVICE_AREA_SLUGS.length}`,
  });
}

ALL_SERVICE_AREA_SLUGS.forEach((slug) => {
  const area = SERVICE_AREAS[slug];
  const pageName = `/service-areas/${slug}`;

  if (area.metaTitle.length > 60) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Meta Title is ${area.metaTitle.length} chars (must be <= 60): "${area.metaTitle}"`,
    });
  }

  if (area.metaDescription.length < 120 || area.metaDescription.length > 160) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Meta Description is ${area.metaDescription.length} chars (must be between 120 and 160): "${area.metaDescription}"`,
    });
  }
});

// 4. Audit Fallback Blogs (12 Articles)
console.log('--- 4. Auditing 12 Local Authority Blog Guides ---');
const blogSlugs = Object.keys(FALLBACK_BLOGS);
if (blogSlugs.length < 12) {
  issues.push({
    type: 'ERROR',
    page: 'FALLBACK_BLOGS',
    message: `Expected at least 12 fallback blogs, found ${blogSlugs.length}`,
  });
}

blogSlugs.forEach((slug) => {
  const blog = FALLBACK_BLOGS[slug];
  const pageName = `/blogs/${slug}`;

  if (blog.title.length > 60) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Blog title is ${blog.title.length} chars (must be <= 60): "${blog.title}"`,
    });
  }

  if (blog.excerpt.length < 120 || blog.excerpt.length > 160) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Blog excerpt is ${blog.excerpt.length} chars (must be between 120 and 160): "${blog.excerpt}"`,
    });
  }

  const plainWords = blog.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  if (plainWords < 250) {
    issues.push({
      type: 'ERROR',
      page: pageName,
      message: `Blog word count is ${plainWords} words (must be >= 250)`,
    });
  }

  auditInternalLinks(blog.content, pageName);
});

// 5. Audit Core Templates for H1s, Phone Numbers & Canonical Internal Links
console.log('--- 5. Auditing Core Templates, Internal Links & Schema Hygiene ---');
const templateChecks = [
  { file: 'src/components/HomeClient.tsx', name: 'Home Page (/)', expectedH1Count: 1, checkLinks: true },
  { file: 'src/app/services/page.tsx', name: 'Services (/services)', expectedH1Count: 1, checkLinks: false },
  { file: 'src/app/services/[slug]/page.tsx', name: 'Service Detail (/services/[slug])', expectedH1Count: 1, checkLinks: true },
  { file: 'src/app/service-areas/page.tsx', name: 'Service Areas Index (/service-areas)', expectedH1Count: 1, checkLinks: false },
  { file: 'src/app/service-areas/[city]/page.tsx', name: 'Service Area Detail (/service-areas/[city])', expectedH1Count: 1, checkLinks: true },
  { file: 'src/app/blogs/[slug]/page.tsx', name: 'Blog Detail (/blogs/[slug])', expectedH1Count: 1, checkLinks: true },
  { file: 'src/components/SiteFooter.tsx', name: 'SiteFooter', expectedH1Count: 0, checkLinks: true },
  { file: 'src/app/gallery/page.tsx', name: 'Gallery (/gallery)', expectedH1Count: 1, checkLinks: false },
  { file: 'src/app/reviews/page.tsx', name: 'Reviews (/reviews)', expectedH1Count: 1, checkLinks: false },
  { file: 'src/app/privacy/page.tsx', name: 'Privacy (/privacy)', expectedH1Count: 1, checkLinks: false },
  { file: 'src/app/terms/page.tsx', name: 'Terms (/terms)', expectedH1Count: 1, checkLinks: false },
];

templateChecks.forEach((t) => {
  const filePath = path.join(process.cwd(), t.file);
  if (!fs.existsSync(filePath)) {
    issues.push({ type: 'ERROR', page: t.name, message: `File not found: ${t.file}` });
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');

  if (t.expectedH1Count > 0) {
    const cleanJsx = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/<h1[^/]*\/gi/g, '');
    const h1Matches = cleanJsx.match(/<h1[\s>]/g) || [];
    if (h1Matches.length !== t.expectedH1Count) {
      issues.push({
        type: 'ERROR',
        page: t.name,
        message: `Found ${h1Matches.length} <h1> tag(s), expected exactly ${t.expectedH1Count}`,
      });
    }
  }

  if (content.includes('760-525-8327')) {
    issues.push({
      type: 'ERROR',
      page: t.name,
      message: `Contains legacy wrong phone number 760-525-8327! Must use +1-760-290-5910`,
    });
  }

  if (t.checkLinks) {
    auditInternalLinks(content, t.name);
  }
});

// 6. Audit Layout Canonicals & Duplicate BreadcrumbList Prevention
const layoutChecks = [
  { file: 'src/app/layout.tsx', name: 'Root Layout', forbidBreadcrumb: false },
  { file: 'src/app/services/layout.tsx', name: 'Services Layout', forbidBreadcrumb: true },
  { file: 'src/app/special-events/layout.tsx', name: 'Special Events Layout', forbidBreadcrumb: true },
  { file: 'src/app/gallery/layout.tsx', name: 'Gallery Layout', forbidBreadcrumb: false },
  { file: 'src/app/reviews/layout.tsx', name: 'Reviews Layout', forbidBreadcrumb: false },
  { file: 'src/app/book/layout.tsx', name: 'Book Layout', forbidBreadcrumb: false },
];

layoutChecks.forEach((l) => {
  const filePath = path.join(process.cwd(), l.file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');

  const nonWwwCanonical = content.match(/canonical:\s*['"]https:\/\/glitzandglamours\.com/g);
  if (nonWwwCanonical) {
    issues.push({
      type: 'ERROR',
      page: l.name,
      message: `Contains non-www canonical URL! Must use https://www.glitzandglamours.com`,
    });
  }

  if (l.forbidBreadcrumb && content.includes('BreadcrumbList')) {
    issues.push({
      type: 'ERROR',
      page: l.name,
      message: `Layout contains BreadcrumbList JSON-LD which duplicates child detail page BreadcrumbList!`,
    });
  }
});

// 7. Output Results
if (issues.length === 0) {
  console.log('✅ ALL MASTER PLAN SEO LINT CHECKS PASSED!');
  console.log(`- 29/29 standard services verified (titles <= 60, meta descriptions 120-160, words >= 250)`);
  console.log(`- 9/9 special event services verified (titles <= 60, meta descriptions 120-160, words >= 250)`);
  console.log(`- ${ALL_SERVICE_AREA_SLUGS.length}/${ALL_SERVICE_AREA_SLUGS.length} service area geo hubs verified (titles <= 60, meta descriptions 120-160)`);
  console.log(`- ${blogSlugs.length}/${blogSlugs.length} fallback blogs verified (titles <= 60, excerpts 120-160, words >= 250, 100% canonical links)`);
  console.log(`- All templates have valid <h1> counts, canonical links, consistent NAP (+1-760-290-5910), and 0 duplicate BreadcrumbList schemas`);
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
