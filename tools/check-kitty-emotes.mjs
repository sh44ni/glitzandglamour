// Focused self-check for Hello Kitty 2.0 helper logic.
// Usage: node --experimental-strip-types tools/check-kitty-emotes.mjs
import assert from 'node:assert/strict';
import {
  KITTY_EMOTES,
  extractKittyEmote,
  isValidChatUploadUrl,
  extractUploadKey,
  sanitizeChatAttachments,
  isHelloKittyBooking,
  formatClientNotes,
  normalizeDiscoverySource,
} from '../src/lib/kittyEmotes.ts';

assert.equal(KITTY_EMOTES.length, 8, 'Expected 8 Kitty emotes');

// 1. Emote tag parsing & stripping
assert.deepEqual(extractKittyEmote('[emote:sparkle] Hello gorgeous!'), {
  text: 'Hello gorgeous!',
  emote: 'sparkle',
});
assert.deepEqual(extractKittyEmote('[emote:CELEBRATE]\n\n\n\nAll set!'), {
  text: 'All set!',
  emote: 'celebrate',
});
assert.deepEqual(extractKittyEmote('[emote:unknown] Hi there'), {
  text: 'Hi there',
  emote: 'happy',
});
assert.deepEqual(extractKittyEmote('Plain message'), {
  text: 'Plain message',
  emote: 'happy',
});
assert.deepEqual(extractKittyEmote(''), { text: '', emote: 'happy' });

// 2. Upload allowlist & sanitization (SSRF / path traversal / HEIC protection)
assert.equal(isValidChatUploadUrl('/api/images/uploads/inspo-123.webp'), true);
assert.equal(isValidChatUploadUrl('/api/images/uploads/photo_01.JPEG'), true);
assert.equal(isValidChatUploadUrl('/api/images/uploads/photo.heic'), false);
assert.equal(isValidChatUploadUrl('/api/images/uploads/../secret.webp'), false);
assert.equal(isValidChatUploadUrl('/api/images/uploads\\bad.webp'), false);
assert.equal(isValidChatUploadUrl('https://evil.example/a.png'), false);

assert.equal(extractUploadKey('/api/images/uploads/abc-123.webp'), 'uploads/abc-123.webp');
assert.equal(extractUploadKey('https://evil.example/a.png'), null);

assert.deepEqual(
  sanitizeChatAttachments(
    [
      '/api/images/uploads/1.webp',
      '/api/images/uploads/1.webp',
      'https://evil.com/x.png',
      '/api/images/uploads/2.png',
      '/api/images/uploads/3.jpg',
      '/api/images/uploads/4.gif',
      '/api/images/uploads/5.webp',
    ],
    4,
  ),
  [
    '/api/images/uploads/1.webp',
    '/api/images/uploads/2.png',
    '/api/images/uploads/3.jpg',
    '/api/images/uploads/4.gif',
  ],
);

// 3. Channel detection & legacy prefix stripping
assert.equal(
  isHelloKittyBooking({ bookingChannel: 'HELLO_KITTY', notes: 'Balayage shoulder length' }),
  true,
);
assert.equal(
  isHelloKittyBooking({ bookingChannel: null, notes: '[Booked via Hello Kitty 🐱] Gel-X medium' }),
  true,
);
assert.equal(
  isHelloKittyBooking({ bookingChannel: 'WEBSITE', notes: 'Regular manicure' }),
  false,
);
assert.equal(formatClientNotes('[Booked via Hello Kitty 🐱] Gel-X almond'), 'Gel-X almond');
assert.equal(formatClientNotes('[Booked via Hello Kitty 🐱]'), null);
assert.equal(formatClientNotes('No virgin hair, shoulder length'), 'No virgin hair, shoulder length');

// 4. Discovery source normalization
assert.equal(normalizeDiscoverySource('fb'), 'Facebook');
assert.equal(normalizeDiscoverySource('ig reels'), 'Instagram');
assert.equal(normalizeDiscoverySource('saw the sign outside'), 'Walked / Drove By');
assert.equal(normalizeDiscoverySource('referred by my sister'), 'Word of Mouth');
assert.equal(normalizeDiscoverySource('Google Maps'), 'Google');
assert.equal(normalizeDiscoverySource('tiktok'), 'TikTok');
assert.equal(normalizeDiscoverySource('yelp'), 'Yelp');
assert.equal(normalizeDiscoverySource('Local flyer'), 'Local flyer');
assert.equal(normalizeDiscoverySource('   '), null);

console.log('Kitty emotes & helpers check passed.');
