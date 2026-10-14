import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const KEY_PATH = path.join(process.cwd(), 'temporary', 'search-console-511516-53b5aa1fef08.json');
const SITE_URL = 'sc-domain:glitzandglamours.com';
const CANONICAL_SITEMAP = 'https://www.glitzandglamours.com/sitemap.xml';
const LEGACY_SITEMAP = 'https://glitzandglamours.com/sitemap.xml';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(keyFile) {
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  const signature = signer
    .sign(key.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${header}.${payload}.${signature}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to obtain token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function listSitemaps(token) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function submitSitemap(token, feedpath) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(feedpath)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Length': '0' },
  });
  return { status: res.status, statusText: res.statusText, body: await res.text() };
}

async function deleteSitemap(token, feedpath) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(feedpath)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, statusText: res.statusText, body: await res.text() };
}

async function main() {
  console.log('🔐 Authenticating with Google Search Console API (webmasters full scope)...');
  const token = await getAccessToken(KEY_PATH);

  console.log('\n📋 Before Cutover — Current Sitemaps in GSC:');
  const before = await listSitemaps(token);
  console.log(JSON.stringify(before, null, 2));

  console.log(`\n🚀 Submitting canonical www sitemap: ${CANONICAL_SITEMAP}`);
  const submitRes = await submitSitemap(token, CANONICAL_SITEMAP);
  console.log('Submit result:', submitRes);

  console.log(`\n🗑️ Deleting legacy non-www redirecting sitemap: ${LEGACY_SITEMAP}`);
  const deleteRes = await deleteSitemap(token, LEGACY_SITEMAP);
  console.log('Delete result:', deleteRes);

  console.log('\n✅ After Cutover — Active Sitemaps in GSC:');
  const after = await listSitemaps(token);
  console.log(JSON.stringify(after, null, 2));
}

main().catch((err) => {
  console.error('❌ GSC Sync Error:', err);
  process.exit(1);
});
