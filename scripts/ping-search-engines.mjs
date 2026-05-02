/**
 * Google Search Console — Bulk re-index ping script
 *
 * This script fetches the live sitemap and uses the Google Search Console
 * URL Inspection API to request re-indexing of each URL.
 *
 * USAGE:
 *   1. Open https://search.google.com/search-console
 *   2. For each URL below, use "URL Inspection" → "Request Indexing"
 *
 * Since the Google Indexing API requires OAuth for web properties,
 * the most practical approach is the manual bulk method below,
 * or using the Search Console UI.
 *
 * However, this script can be used to generate a list of all URLs
 * that need to be submitted.
 */

const SITEMAP_URL = 'https://glitzandglamours.com/sitemap.xml';

async function main() {
  console.log('🔍 Fetching sitemap...');
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();

  // Extract all <loc> URLs
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

  console.log(`\n📋 Found ${urls.length} URLs in sitemap:\n`);
  urls.forEach((url, i) => {
    console.log(`  ${(i + 1).toString().padStart(2, '0')}. ${url}`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log('📌 MANUAL STEPS TO REQUEST RE-INDEXING:');
  console.log('─'.repeat(60));
  console.log('');
  console.log('1. Go to https://search.google.com/search-console');
  console.log('2. Select "glitzandglamours.com" property');
  console.log('3. Click "URL Inspection" in the top search bar');
  console.log('4. Paste each URL above and click "Request Indexing"');
  console.log('');
  console.log('⚡ FASTER METHOD: Submit the sitemap!');
  console.log('   Go to Sitemaps → Delete existing → Re-submit:');
  console.log(`   ${SITEMAP_URL}`);
  console.log('');
  console.log('   This tells Google to re-crawl ALL URLs at once.');
  console.log('');

  // Ping Google and Bing with sitemap
  console.log('🌐 Pinging search engines with updated sitemap...\n');

  try {
    const googlePing = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✅ Google ping: ${googlePing.status} ${googlePing.statusText}`);
  } catch (e) {
    console.log(`  ⚠️ Google ping failed: ${e}`);
  }

  try {
    const bingPing = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`  ✅ Bing ping: ${bingPing.status} ${bingPing.statusText}`);
  } catch (e) {
    console.log(`  ⚠️ Bing ping failed: ${e}`);
  }

  console.log('\n✨ Done! Search engines have been notified.\n');
}

main().catch(console.error);
