import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSpeechText,
  filterSpecimens,
  formatAccessionCode,
  removeSpecimenById,
  upsertSpecimen,
  validateImageFileMeta,
} from './curiozStore';
import type { CuriozSpecimen } from '../types/curioz';

const SAMPLE_ITEMS: CuriozSpecimen[] = [
  {
    id: 'a1',
    accessionCode: 'ACC. CZ-2026-001',
    level: 'public',
    sourceType: 'archive',
    createdAt: '2026-11-24T08:00:00.000Z',
    name: 'Astrolabe de marine',
    origin: 'Lisbonne, XVIIe siècle',
    usage: 'Mesurer la latitude en mer.',
    story: 'Il guidait les marins vers les ports bretons.',
  },
  {
    id: 'a2',
    accessionCode: 'ACC. CZ-2026-002',
    level: 'enfant',
    sourceType: 'mystery',
    createdAt: '2026-11-24T09:00:00.000Z',
    name: 'Boussole de poche',
    origin: 'France, XIXe siècle',
    usage: 'Indiquer toujours le nord magnétique.',
    story: 'Elle adore les randonnées en forêt.',
  },
];

test('formatAccessionCode pads sequence numbers to three digits', () => {
  assert.equal(formatAccessionCode(1, 2026), 'ACC. CZ-2026-001');
  assert.equal(formatAccessionCode(42, 2026), 'ACC. CZ-2026-042');
  assert.equal(formatAccessionCode(0, 2026), 'ACC. CZ-2026-001');
});

test('filterSpecimens filters by reading level and search query', () => {
  assert.equal(filterSpecimens(SAMPLE_ITEMS, 'all', '').length, 2);
  assert.equal(filterSpecimens(SAMPLE_ITEMS, 'enfant', '').length, 1);
  assert.equal(filterSpecimens(SAMPLE_ITEMS, 'expert', '').length, 0);
  const byQuery = filterSpecimens(SAMPLE_ITEMS, 'all', 'lisbonne');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'a1');
});

test('upsertSpecimen prepends new items and removes cleanly by id', () => {
  const { specimens, saved } = upsertSpecimen(SAMPLE_ITEMS, {
    name: 'Longue-vue en cuivre',
    origin: 'Angleterre, XVIIIe siècle',
    usage: 'Observer les navires à l’horizon.',
    story: 'Elle guette les baleines blanches.',
    level: 'expert',
    sourceType: 'mystery',
  });
  assert.equal(specimens.length, 3);
  assert.equal(specimens[0].id, saved.id);
  assert.equal(specimens[0].accessionCode, 'ACC. CZ-2026-003');

  const afterRemove = removeSpecimenById(specimens, saved.id);
  assert.equal(afterRemove.length, 2);
});

test('buildSpeechText generates structured French narration', () => {
  const spoken = buildSpeechText(SAMPLE_ITEMS[0]);
  assert.match(spoken, /niveau Grand public/);
  assert.match(spoken, /Astrolabe de marine/);
  assert.match(spoken, /La vie secrète de l'objet/);
});

test('validateImageFileMeta validates allowed MIME types and file size limits', () => {
  assert.equal(validateImageFileMeta({ type: 'image/jpeg', size: 250_000, name: 'photo.jpg' }), null);
  assert.equal(validateImageFileMeta({ type: 'image/webp', size: 100_000, name: 'objet.webp' }), null);
  assert.ok(validateImageFileMeta({ type: 'application/pdf', size: 100_000, name: 'doc.pdf' }));
  assert.ok(validateImageFileMeta({ type: 'image/png', size: 0, name: 'empty.png' }));
  assert.ok(validateImageFileMeta({ type: 'image/jpeg', size: 15 * 1024 * 1024, name: 'huge.jpg' }));
});
