import type { CuriozFiche, CuriozLevel, CuriozSpecimen } from '../types/curioz';

export const CARNET_STORAGE_KEY = 'curioz_carnet_v1';
export const MAX_CARNET_ITEMS = 40;

export const ALLOWED_CLIENT_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export function formatAccessionCode(index: number, year = 2026): string {
  const padded = String(Math.max(1, index)).padStart(3, '0');
  return `ACC. CZ-${year}-${padded}`;
}

export function getLevelDisplayLabel(level: CuriozLevel): string {
  if (level === 'enfant') return 'Enfant';
  if (level === 'expert') return 'Expert';
  return 'Grand public';
}

export function filterSpecimens(
  specimens: CuriozSpecimen[],
  levelFilter: CuriozLevel | 'all',
  query: string,
): CuriozSpecimen[] {
  const normalizedQuery = query.trim().toLowerCase();
  return specimens.filter((item) => {
    if (levelFilter !== 'all' && item.level !== levelFilter) {
      return false;
    }
    if (!normalizedQuery) return true;
    const haystack = `${item.name} ${item.origin} ${item.usage} ${item.story} ${item.accessionCode}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function upsertSpecimen(
  current: CuriozSpecimen[],
  next: Omit<CuriozSpecimen, 'id' | 'accessionCode' | 'createdAt'> & {
    id?: string;
    accessionCode?: string;
    createdAt?: string;
  },
): { specimens: CuriozSpecimen[]; saved: CuriozSpecimen } {
  const now = next.createdAt ?? new Date().toISOString();
  const id = next.id ?? `cz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nextNumber = current.length + 1;
  const saved: CuriozSpecimen = {
    ...next,
    id,
    accessionCode: next.accessionCode ?? formatAccessionCode(nextNumber),
    createdAt: now,
  };

  const withoutDuplicate = current.filter((item) => item.id !== saved.id);
  const specimens = [saved, ...withoutDuplicate].slice(0, MAX_CARNET_ITEMS);
  return { specimens, saved };
}

export function removeSpecimenById(current: CuriozSpecimen[], id: string): CuriozSpecimen[] {
  return current.filter((item) => item.id !== id);
}

export function buildSpeechText(specimen: CuriozFiche & { level?: CuriozLevel }): string {
  const levelPrefix = specimen.level
    ? `Fiche Curioz, niveau ${getLevelDisplayLabel(specimen.level)}. `
    : 'Fiche Curioz. ';
  return `${levelPrefix}${specimen.name}. Origine et époque : ${specimen.origin}. Usage : ${specimen.usage}. La vie secrète de l'objet : ${specimen.story}`;
}

export function validateImageFileMeta(file: { type: string; size: number; name?: string }): string | null {
  const mime = file.type.toLowerCase();
  const ext = (file.name ?? '').toLowerCase();
  const hasAllowedExt = /\.(jpe?g|png|webp|heic|heif)$/.test(ext);
  if (!ALLOWED_CLIENT_MIMES.has(mime) && !hasAllowedExt) {
    return 'Format non pris en charge. Choisissez une photo JPEG, PNG, WebP ou HEIC.';
  }
  if (file.size <= 0) {
    return 'Le fichier sélectionné est vide.';
  }
  if (file.size > 12 * 1024 * 1024) {
    return 'Cette photo dépasse 12 Mo. Choisissez une image plus légère.';
  }
  return null;
}

export function loadCarnetSpecimens(fallback: CuriozSpecimen[]): CuriozSpecimen[] {
  try {
    const raw = window.localStorage.getItem(CARNET_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed as CuriozSpecimen[];
  } catch {
    return fallback;
  }
}

export function saveCarnetSpecimens(specimens: CuriozSpecimen[]): void {
  try {
    // Avoid exceeding localStorage quota with giant inline photos by keeping recent photo previews reasonable
    window.localStorage.setItem(CARNET_STORAGE_KEY, JSON.stringify(specimens.slice(0, MAX_CARNET_ITEMS)));
  } catch {
    try {
      const compact = specimens.slice(0, 12).map((item) => ({
        ...item,
        imageUrl: item.imageUrl?.startsWith('data:') ? undefined : item.imageUrl,
      }));
      window.localStorage.setItem(CARNET_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }
}
