import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRateLimiter,
  MAX_IMAGE_BASE64_LENGTH,
  MAX_SUBJECT_LENGTH,
  normalizeLevel,
  parseDataUrl,
  sanitizeMysterySubject,
  validateCuriozPayload,
} from './curioz';

test('parseDataUrl accepts valid JPEG, JPG normalized to JPEG, PNG, WebP, and HEIC data URLs', () => {
  const jpg = parseDataUrl('data:image/jpg;base64,AAAA');
  assert.deepEqual(jpg, { mimeType: 'image/jpeg', data: 'AAAA' });

  const png = parseDataUrl('data:image/png;base64,iVBORw0KGgo=');
  assert.deepEqual(png, { mimeType: 'image/png', data: 'iVBORw0KGgo=' });

  const webp = parseDataUrl('data:IMAGE/WEBP;base64,UklGRg==');
  assert.deepEqual(webp, { mimeType: 'image/webp', data: 'UklGRg==' });

  const heic = parseDataUrl('data:image/heic;base64,AAAA');
  assert.deepEqual(heic, { mimeType: 'image/heic', data: 'AAAA' });
});

test('parseDataUrl rejects invalid formats, unsupported MIME types, and oversized payloads', () => {
  assert.equal(parseDataUrl('not-a-data-url'), null);
  assert.equal(parseDataUrl('data:image/svg+xml;base64,PHN2Zz4='), null);
  assert.equal(parseDataUrl('data:text/html;base64,PGgxPg=='), null);
  assert.equal(parseDataUrl('data:image/jpeg;base64,'), null);
  assert.equal(
    parseDataUrl(`data:image/jpeg;base64,${'A'.repeat(MAX_IMAGE_BASE64_LENGTH + 1)}`),
    null,
  );
});

test('normalizeLevel defaults unknown values to public and preserves valid levels', () => {
  assert.equal(normalizeLevel('enfant'), 'enfant');
  assert.equal(normalizeLevel('expert'), 'expert');
  assert.equal(normalizeLevel('public'), 'public');
  assert.equal(normalizeLevel('autre'), 'public');
  assert.equal(normalizeLevel(undefined), 'public');
});

test('sanitizeMysterySubject trims whitespace and clamps length to 120 chars', () => {
  assert.equal(sanitizeMysterySubject('  Astrolabe   en laiton  '), 'Astrolabe en laiton');
  assert.equal(sanitizeMysterySubject(12345), '');
  const longText = 'x'.repeat(200);
  assert.equal(sanitizeMysterySubject(longText).length, MAX_SUBJECT_LENGTH);
});

test('validateCuriozPayload accepts complete responses and rejects incomplete ones', () => {
  assert.deepEqual(
    validateCuriozPayload({
      name: 'Astrolabe',
      origin: 'XVIIe siècle',
      usage: 'Mesure la hauteur des astres.',
      story: 'Il guidait un navire marchand vers Lisbonne.',
    }),
    {
      name: 'Astrolabe',
      origin: 'XVIIe siècle',
      usage: 'Mesure la hauteur des astres.',
      story: 'Il guidait un navire marchand vers Lisbonne.',
    },
  );

  assert.equal(validateCuriozPayload({ name: 'Astrolabe', origin: '', usage: 'x', story: 'y' }), null);
  assert.equal(validateCuriozPayload(null), null);
});

test('createRateLimiter enforces request ceilings and resets after the window', () => {
  const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
  assert.equal(limiter.check('127.0.0.1', 100).allowed, true);
  assert.equal(limiter.check('127.0.0.1', 200).allowed, true);
  const blocked = limiter.check('127.0.0.1', 300);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSec, 1);
  assert.equal(limiter.check('127.0.0.1', 1150).allowed, true);
});
