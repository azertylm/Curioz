export type CuriozLevel = 'enfant' | 'public' | 'expert';

export interface CuriozFiche {
  name: string;
  origin: string;
  usage: string;
  story: string;
}

export interface CuriozSpecimen extends CuriozFiche {
  id: string;
  accessionCode: string;
  level: CuriozLevel;
  sourceType: 'photo' | 'mystery' | 'archive';
  subjectPrompt?: string;
  imageUrl?: string;
  createdAt: string;
  isSeeded?: boolean;
}

export interface MysteryPreset {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  subjectPrompt: string;
  imageUrl: string;
  imageAlt: string;
}

export interface AlphabetteAppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  isNew?: boolean;
  releaseLabel?: string;
}

export type LanguageCode = 'FR' | 'EN' | 'ES';
