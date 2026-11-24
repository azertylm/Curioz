import type { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export type CuriozLevel = 'enfant' | 'public' | 'expert';

export interface CuriozScanResult {
  name: string;
  origin: string;
  usage: string;
  story: string;
}

const MODEL_NAME = 'gemini-4-hydrogen';
export const MAX_IMAGE_BASE64_LENGTH = 14_000_000;
export const MAX_SUBJECT_LENGTH = 120;

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export const LEVEL_LABELS: Record<CuriozLevel, string> = {
  enfant: 'Enfant de 10 ans (curieux, ludique, imagé, mots simples)',
  public: 'Grand Public (clair, culturel, vivant, accessible à tous)',
  expert: 'Expert / Conservateur (vocabulaire technique précis, datation fine, matériaux et procédé)',
};

export function normalizeLevel(level: unknown): CuriozLevel {
  return level === 'enfant' || level === 'expert' ? level : 'public';
}

export function sanitizeMysterySubject(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim().slice(0, MAX_SUBJECT_LENGTH);
}

export function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const rawMime = match[1].toLowerCase().trim();
  const mimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) return null;
  const data = match[2].trim();
  if (!data || data.length > MAX_IMAGE_BASE64_LENGTH) return null;
  return { mimeType, data };
}

export function validateCuriozPayload(raw: unknown): CuriozScanResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const origin = typeof candidate.origin === 'string' ? candidate.origin.trim() : '';
  const usage = typeof candidate.usage === 'string' ? candidate.usage.trim() : '';
  const story = typeof candidate.story === 'string' ? candidate.story.trim() : '';
  if (!name || !origin || !usage || !story) return null;
  return { name, origin, usage, story };
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key: string, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
      const existing = hits.get(key);
      if (!existing || now >= existing.resetAt) {
        hits.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, retryAfterSec: 0 };
      }
      if (existing.count >= options.maxRequests) {
        return {
          allowed: false,
          retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
      }
      existing.count += 1;
      return { allowed: true, retryAfterSec: 0 };
    },
    middleware(req: Request, res: Response, next: NextFunction): void {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const verdict = this.check(ip);
      if (!verdict.allowed) {
        res.setHeader('Retry-After', String(verdict.retryAfterSec));
        res.status(429).json({
          error: 'Trop de requêtes en peu de temps. Patientez quelques instants avant une nouvelle analyse.',
        });
        return;
      }
      next();
    },
  };
}

// Monté sur Express : app.post('/api/curioz/scan', handleScanObject);
export async function handleScanObject(req: Request, res: Response): Promise<void> {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({ error: 'Clé GEMINI_API_KEY manquante sur le serveur.' });
      return;
    }

    const validLevel = normalizeLevel(req.body?.level);
    const imageDataUrl = typeof req.body?.imageDataUrl === 'string' ? req.body.imageDataUrl : '';
    const mysterySubject = sanitizeMysterySubject(req.body?.mysterySubject);

    if (!imageDataUrl && !mysterySubject) {
      res.status(400).json({ error: 'Ajoutez une photo ou choisissez un objet mystère à analyser.' });
      return;
    }

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if (imageDataUrl) {
      const parsedImage = parseDataUrl(imageDataUrl);
      if (!parsedImage) {
        res.status(400).json({ error: "Format d'image non pris en charge (JPEG, PNG ou WebP requis)." });
        return;
      }
      parts.push({ inlineData: parsedImage });
      parts.push({
        text: "Identifie précisément l'objet principal (ou plante, outil, détail architectural) visible sur cette photo et rédige sa fiche de curiosité adaptée au niveau demandé.",
      });
    } else {
      parts.push({
        text: `Présente cet objet de curiosité : "${mysterySubject}", et rédige sa fiche complète adaptée au niveau demandé.`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: `Tu es un conservateur de musée doublé d'un conteur plein d'esprit. Adapte ton ton et ton vocabulaire au niveau : ${LEVEL_LABELS[validLevel]}. Réponds en français uniquement en JSON strict.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nom précis de l'objet identifié." },
            origin: { type: Type.STRING, description: 'Époque, provenance géographique ou contexte de fabrication.' },
            usage: { type: Type.STRING, description: 'Usage concret et fonctionnement en 2 phrases claires.' },
            story: {
              type: Type.STRING,
              description: "Petite histoire imaginaire, poétique ou décalée (2 à 3 phrases) sur la vie secrète de cet objet.",
            },
          },
          required: ['name', 'origin', 'usage', 'story'],
        },
      },
    });

    const parsed = validateCuriozPayload(JSON.parse((response.text ?? '{}').trim()));
    if (!parsed) {
      res.status(502).json({ error: 'Fiche objet incomplète.' });
      return;
    }

    res.json(parsed);
  } catch (err) {
    console.error('[Scanner API Error]', err);
    res.status(502).json({ error: "Impossible d'analyser cet objet pour le moment." });
  }
}
