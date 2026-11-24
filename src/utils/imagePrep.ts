import { validateImageFileMeta } from './curiozStore';

const MAX_DIMENSION = 1600;

export async function prepareImageDataUrl(file: File): Promise<string> {
  const validationError = validateImageFileMeta(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  // HEIC/HEIF cannot always be drawn on Canvas in every browser; pass through directly if valid
  const lowerType = file.type.toLowerCase();
  if (lowerType === 'image/heic' || lowerType === 'image/heif') {
    return rawDataUrl;
  }

  try {
    return await compressImageIfNeeded(rawDataUrl, lowerType);
  } catch {
    return rawDataUrl;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Impossible de lire le fichier image sélectionné."));
      }
    };
    reader.onerror = () => reject(new Error("Erreur lors de la lecture de l'image."));
    reader.readAsDataURL(file);
  });
}

function compressImageIfNeeded(dataUrl: string, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && dataUrl.length < 1_800_000) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const outputMime = mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(outputMime, 0.86));
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}
