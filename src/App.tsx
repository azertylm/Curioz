import { useCallback, useEffect, useRef, useState } from 'react';
import { AlphabetteHeader } from './components/AlphabetteHeader';
import { ScannerPanel } from './components/ScannerPanel';
import { SpecimenFiche } from './components/SpecimenFiche';
import { CarnetArchive } from './components/CarnetArchive';
import { SEEDED_SPECIMENS } from './data/curiozData';
import type { CuriozFiche, CuriozLevel, CuriozSpecimen, LanguageCode } from './types/curioz';
import {
  buildSpeechText,
  loadCarnetSpecimens,
  removeSpecimenById,
  saveCarnetSpecimens,
  upsertSpecimen,
} from './utils/curiozStore';

const THEME_STORAGE_KEY = 'alphabette_theme';
const BIG_STORAGE_KEY = 'alphabette_big_mode';

interface LastScanRequest {
  imageDataUrl?: string;
  mysterySubject?: string;
  previewImageUrl?: string;
  level: CuriozLevel;
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });
  const [bigMode, setBigMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(BIG_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [simpleMode, setSimpleMode] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('FR');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [level, setLevel] = useState<CuriozLevel>('public');
  const [specimens, setSpecimens] = useState<CuriozSpecimen[]>(() =>
    loadCarnetSpecimens(SEEDED_SPECIMENS),
  );
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(() => {
    const initial = loadCarnetSpecimens(SEEDED_SPECIMENS);
    return initial[0]?.id ?? null;
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const lastRequestRef = useRef<LastScanRequest | null>(null);
  const ficheAnchorRef = useRef<HTMLDivElement | null>(null);

  const activeSpecimen = specimens.find((item) => item.id === activeSpecimenId) ?? specimens[0] ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BIG_STORAGE_KEY, String(bigMode));
    } catch {
      // Ignore storage errors
    }
  }, [bigMode]);

  useEffect(() => {
    saveCarnetSpecimens(specimens);
  }, [specimens]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const handleToggleSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const textToSpeak = activeSpecimen
      ? buildSpeechText(activeSpecimen)
      : 'Curioz, cabinet de curiosités Alphabette. Ajoutez une photo ou choisissez un objet mystère pour découvrir son histoire.';

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.98;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [activeSpecimen, isSpeaking, stopSpeech]);

  const runScan = useCallback(
    async (request: LastScanRequest) => {
      stopSpeech();
      setIsScanning(true);
      setScanError(null);
      lastRequestRef.current = request;

      try {
        const response = await fetch('/api/curioz/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: request.level,
            imageDataUrl: request.imageDataUrl,
            mysterySubject: request.mysterySubject,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as Partial<CuriozFiche> & {
          error?: string;
        };

        if (!response.ok || !data.name || !data.origin || !data.usage || !data.story) {
          throw new Error(data.error || "Impossible d'analyser cet objet pour le moment.");
        }

        setSpecimens((prev) => {
          const { specimens: nextList, saved } = upsertSpecimen(prev, {
            name: data.name!,
            origin: data.origin!,
            usage: data.usage!,
            story: data.story!,
            level: request.level,
            sourceType: request.imageDataUrl ? 'photo' : 'mystery',
            subjectPrompt: request.mysterySubject ?? data.name!,
            imageUrl: request.imageDataUrl ?? request.previewImageUrl,
          });
          setActiveSpecimenId(saved.id);
          return nextList;
        });

        if (window.innerWidth < 1024 && ficheAnchorRef.current) {
          ficheAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) {
        setScanError(
          err instanceof Error ? err.message : "Impossible d'analyser cet objet pour le moment.",
        );
      } finally {
        setIsScanning(false);
      }
    },
    [stopSpeech],
  );

  const handleScanPhoto = (imageDataUrl: string) => {
    void runScan({ imageDataUrl, level });
  };

  const handleScanMystery = (subject: string, previewImageUrl?: string) => {
    void runScan({ mysterySubject: subject, previewImageUrl, level });
  };

  const handleReanalyzeAtLevel = (targetLevel: CuriozLevel) => {
    if (!activeSpecimen) return;
    setLevel(targetLevel);
    const isInlinePhoto = activeSpecimen.imageUrl?.startsWith('data:');
    void runScan({
      level: targetLevel,
      imageDataUrl: isInlinePhoto ? activeSpecimen.imageUrl : undefined,
      mysterySubject: isInlinePhoto ? undefined : activeSpecimen.subjectPrompt || activeSpecimen.name,
      previewImageUrl: isInlinePhoto ? undefined : activeSpecimen.imageUrl,
    });
  };

  const handleRetryScan = () => {
    if (lastRequestRef.current) {
      void runScan(lastRequestRef.current);
    }
  };

  const handleDeleteSpecimen = (id: string) => {
    stopSpeech();
    setSpecimens((prev) => {
      const next = removeSpecimenById(prev, id);
      if (activeSpecimenId === id) {
        setActiveSpecimenId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleToggleSimpleMode = () => {
    setSimpleMode((prev) => {
      const next = !prev;
      if (next) {
        setBigMode(true);
      }
      return next;
    });
  };

  const handleReturnHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1] text-[#1C1917] dark:bg-[#0B1220] dark:text-[#F1F5F9]">
      <AlphabetteHeader
        bigMode={bigMode}
        onToggleBigMode={() => setBigMode((prev) => !prev)}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        simpleMode={simpleMode}
        onToggleSimpleMode={handleToggleSimpleMode}
        language={language}
        onChangeLanguage={setLanguage}
        onReturnHome={handleReturnHome}
      />

      <main
        className="curioz-content flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        data-big={bigMode ? 'true' : 'false'}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Colonne gauche : Table d'examen & Objets mystères */}
          <div className="lg:col-span-5">
            <ScannerPanel
              level={level}
              onChangeLevel={setLevel}
              isScanning={isScanning}
              simpleMode={simpleMode}
              onScanPhoto={handleScanPhoto}
              onScanMystery={handleScanMystery}
            />
          </div>

          {/* Colonne droite : Fiche de curiosité muséale */}
          <div className="lg:col-span-7" ref={ficheAnchorRef}>
            <SpecimenFiche
              specimen={activeSpecimen}
              isScanning={isScanning}
              scanError={scanError}
              onRetryScan={handleRetryScan}
              onReanalyzeAtLevel={handleReanalyzeAtLevel}
              isSpeaking={isSpeaking}
              onToggleSpeakSpecimen={handleToggleSpeech}
              isSavedInCarnet={Boolean(activeSpecimen)}
            />
          </div>
        </div>

        {/* Section inférieure : Carnet de Curiosités sauvegardées */}
        {!simpleMode && (
          <CarnetArchive
            specimens={specimens}
            activeSpecimenId={activeSpecimen?.id ?? null}
            onSelectSpecimen={(item) => {
              stopSpeech();
              setScanError(null);
              setActiveSpecimenId(item.id);
              setLevel(item.level);
              if (ficheAnchorRef.current) {
                ficheAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            onDeleteSpecimen={handleDeleteSpecimen}
          />
        )}
      </main>

      <footer className="mt-12 border-t border-[#E7E2D8] dark:border-[#273449] bg-[#F3F0E8]/70 dark:bg-[#0F172A]/80 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#57534E] dark:text-slate-400">
          <p>Curioz · Une application du cabinet Alphabette</p>
          <div className="flex items-center gap-4">
            <a
              href="https://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1917] dark:hover:text-white underline-offset-4 hover:underline"
            >
              alphabette.fr
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://alphabette.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1917] dark:hover:text-white underline-offset-4 hover:underline"
            >
              alphabette.eu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
