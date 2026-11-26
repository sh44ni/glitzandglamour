import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';
import { SERVICES_DETAILED } from '../src/data/servicesDetailed';
import { SERVICE_CATEGORIES } from '../src/data/serviceCategories';
import { SPECIAL_EVENTS_DETAILED } from '../src/data/specialEventsDetailed';
import { SERVICE_AREAS } from '../src/data/serviceAreas';
import { FALLBACK_BLOGS } from '../src/data/fallbackBlogs';

// Run with --baseline=/private/path/keyword-preservation-manifest.json.
// Add --base-url=http://127.0.0.1:PORT to check the production-backed preview
// or deployed site. This performs GET requests only and never submits indexing.
const option = (name: string) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);

async function main() {
  const baselineFile = option('baseline');
  assert(baselineFile, '--baseline is required');
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')) as {
    pages: { url: string; path: string; repository_keyword_entries: string[] }[];
  };
  const keywords = new Map([
    ...SERVICE_CATEGORIES.map((item) => [`/services/${item.slug}`, item.targetKeywords] as const),
    ...SERVICES_DETAILED.map((item) => [`/services/${item.slug}`, item.targetKeywords] as const),
    ...SPECIAL_EVENTS_DETAILED.map((item) => [`/special-events/${item.slug}`, item.targetKeywords] as const),
    ...Object.values(SERVICE_AREAS).map((item) => [`/service-areas/${item.slug}`, item.keywords] as const),
    ...Object.values(FALLBACK_BLOGS).map((item) => [`/blogs/${item.slug}`, item.tags.split(',').map((value) => value.trim())] as const),
  ]);
  for (const [path, values] of keywords) {
    const before = baseline.pages.find((page) => page.path === path);
    assert(before, `Page missing from baseline: ${path}`);
    assert.deepEqual(values, before.repository_keyword_entries, `Keyword list changed: ${path}`);
  }
  console.log(`Preserved ${keywords.size} existing keyword/tag lists.`);

  const base = option('base-url');
  if (!base) return;
  const get = async (path: string, agent?: string) => {
    const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(60000), headers: agent ? { 'user-agent': agent } : undefined });
    return { response, html: await response.text() };
  };
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const listed = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(listed).size, listed.length, 'Duplicate sitemap URL');
  assert.deepEqual([...listed].sort(), baseline.pages.map((page) => page.url).sort(), 'Intended sitemap URLs changed');

  for (const path of ['/services/this-page-does-not-exist-audit', '/blogs/this-page-does-not-exist-audit', '/blogs/blog-img-chrome-nails.jpg']) {
    for (const agent of [undefined, 'Googlebot/2.1 (+http://www.google.com/bot.html)']) {
      const { response } = await get(path, agent);
      assert.equal(response.status, 404, `Invalid route must be 404: ${path}`);
    }
  }
  const alias = await get('/services/gel-x');
  assert([301, 308].includes(alias.response.status), 'Canonical alias must permanently redirect');
  assert.equal(alias.response.headers.get('location'), '/services/gelx');

  let next = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < baseline.pages.length) {
      const page = baseline.pages[next++];
      const { response, html } = await get(page.path);
      assert.equal(response.status, 200, `Intended page must be 200: ${page.path}`);
      const $ = load(html);
      assert.equal($('link[rel="canonical"]').length, 1, `Canonical count: ${page.path}`);
      const canonical = $('link[rel="canonical"]').attr('href');
      assert.equal(new URL(canonical!).href, new URL(page.url).href, `Canonical changed: ${page.path}`);
      assert($('h1').length > 0, `Missing server-rendered heading: ${page.path}`);
      assert(!/noindex/i.test($('meta[name="robots"],meta[name="googlebot"]').map((_, element) => $(element).attr('content')).get().join(' ')), `Noindex: ${page.path}`);
      assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `Noindex header: ${page.path}`);
      if (['nails', 'pedicures', 'waxing', 'facials'].some((slug) => page.path === `/services/${slug}`)) {
        assert.equal($('#choose-your-service').length, 1, `Selection guide missing: ${page.path}`);
      }
      if (page.path.includes('/blogs/')) {
        assert(!/SEO depth/.test($('body').text()), `Drafting text: ${page.path}`);
      }
    }
  }));
  console.log(`HTTP, canonical, indexability and content checks passed for all ${baseline.pages.length} intended URLs; invalid routes and alias checked.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'SEO verification failed');
  process.exitCode = 1;
});
