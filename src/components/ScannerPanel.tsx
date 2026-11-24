import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Search, Trash2, ArrowRight, Compass } from 'lucide-react';
import { LEVEL_OPTIONS, MYSTERY_PRESETS } from '../data/curiozData';
import type { CuriozLevel, MysteryPreset } from '../types/curioz';
import { prepareImageDataUrl } from '../utils/imagePrep';

interface ScannerPanelProps {
  level: CuriozLevel;
  onChangeLevel: (level: CuriozLevel) => void;
  isScanning: boolean;
  simpleMode: boolean;
  onScanPhoto: (imageDataUrl: string) => void;
  onScanMystery: (subject: string, imageUrl?: string) => void;
}

export function ScannerPanel({
  level,
  onChangeLevel,
  isScanning,
  simpleMode,
  onScanPhoto,
  onScanMystery,
}: ScannerPanelProps) {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const [mysteryInput, setMysteryInput] = useState('');
  const [mysteryError, setMysteryError] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const activeLevelInfo = LEVEL_OPTIONS.find((item) => item.id === level) ?? LEVEL_OPTIONS[1];

  const handleFilePicked = async (file: File | null | undefined) => {
    if (!file) return;
    setPhotoError('');
    try {
      const prepared = await prepareImageDataUrl(file);
      setSelectedPhotoUrl(prepared);
      setSelectedFileName(file.name);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Impossible de lire cette image.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    void handleFilePicked(file);
  };

  const handlePhotoSubmit = () => {
    if (!selectedPhotoUrl) {
      setPhotoError('Ajoutez d’abord une photo d’objet, de plante ou de détail architectural.');
      return;
    }
    setPhotoError('');
    onScanPhoto(selectedPhotoUrl);
  };

  const handleMysterySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = mysteryInput.trim();
    if (!cleaned) {
      setMysteryError('Indiquez le nom d’un objet mystère à explorer (ex. : cadran solaire, clef ancienne).');
      return;
    }
    setMysteryError('');
    onScanMystery(cleaned);
  };

  const handlePresetClick = (preset: MysteryPreset) => {
    setMysteryError('');
    setMysteryInput(preset.title);
    onScanMystery(preset.subjectPrompt, preset.imageUrl);
  };

  return (
    <section aria-labelledby="scanner-heading" className="space-y-6">
      <div className="bg-white dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] rounded-2xl p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#EFECE5] dark:border-[#273449]">
          <div>
            <p className="curioz-meta text-xs uppercase tracking-widest text-[#78716C] dark:text-slate-400">
              Table d’examen
            </p>
            <h1
              id="scanner-heading"
              className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-[28px] font-semibold tracking-tight text-[#1C1917] dark:text-white leading-tight text-balance"
            >
              Identifier une curiosité
            </h1>
          </div>
        </div>

        {/* Sélecteur de niveau de lecture */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold text-[#292524] dark:text-slate-200">
              Ton du conservateur
            </span>
          </div>
          <div
            role="group"
            aria-label="Niveau de lecture de la fiche"
            className="grid grid-cols-[1fr_1.45fr_1fr] gap-1 p-1 rounded-xl bg-[#F3F0E8] dark:bg-[#0B1220] border border-[#E7E2D8] dark:border-[#273449]"
          >
            {LEVEL_OPTIONS.map((option) => {
              const active = level === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChangeLevel(option.id)}
                  aria-pressed={active}
                  className={`min-h-[42px] px-1.5 sm:px-2.5 py-2 rounded-lg text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f51b5] ${
                    active
                      ? 'bg-white dark:bg-[#1E2B44] text-[#1E3A8A] dark:text-white shadow-xs'
                      : 'text-[#57534E] dark:text-slate-400 hover:text-[#1C1917] dark:hover:text-white'
                  }`}
                >
                  {option.shortLabel}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-[#57534E] dark:text-slate-400">{activeLevelInfo.description}</p>
        </div>

        {/* Zone Photo / Appareil photo */}
        <div className="mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
            id="curioz-photo-upload"
            onChange={(e) => {
              void handleFilePicked(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
            id="curioz-camera-capture"
            onChange={(e) => {
              void handleFilePicked(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          {selectedPhotoUrl ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-[#E7E2D8] dark:border-[#273449] bg-[#F3F0E8] dark:bg-[#0B1220] aspect-[4/3]">
                <img
                  src={selectedPhotoUrl}
                  alt={`Aperçu de la photo sélectionnée : ${selectedFileName || 'objet à identifier'}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl(null);
                    setSelectedFileName('');
                    setPhotoError('');
                  }}
                  aria-label="Retirer la photo sélectionnée"
                  className="absolute top-3 right-3 min-h-[40px] px-3 rounded-lg bg-[#182334]/85 hover:bg-[#182334] text-white text-sm font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Retirer</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handlePhotoSubmit}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#172D6B] disabled:opacity-60 text-white font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  <span>{isScanning ? 'Analyse en cours…' : 'Identifier cet objet'}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[48px] px-4 py-3 rounded-xl border border-[#D6CEBE] dark:border-[#334155] text-[#292524] dark:text-slate-200 hover:bg-[#F3F0E8] dark:hover:bg-[#1E2B44] font-medium text-sm whitespace-nowrap transition-colors cursor-pointer"
                >
                  Changer de photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border border-dashed p-5 text-center transition-colors ${
                isDragging
                  ? 'border-[#1E3A8A] bg-indigo-50/60 dark:bg-indigo-950/30'
                  : 'border-[#CFC7B8] dark:border-[#334155] bg-[#FAF8F4] dark:bg-[#0F172A]'
              }`}
            >
              <p className="font-medium text-[#1C1917] dark:text-slate-100">
                Déposez ou photographiez un objet, une plante ou un détail d’architecture
              </p>
              <p className="mt-1 text-sm text-[#78716C] dark:text-slate-400">
                Formats JPEG, PNG, WebP ou HEIC · Jusqu’à 12 Mo
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172D6B] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  <Camera size={17} aria-hidden="true" />
                  <span>Prendre une photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#162033] border border-[#D6CEBE] dark:border-[#334155] text-[#1C1917] dark:text-slate-100 hover:bg-[#F3F0E8] dark:hover:bg-[#1E2B44] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ImagePlus size={17} aria-hidden="true" />
                  <span>Importer une image</span>
                </button>
              </div>
            </div>
          )}

          {photoError && (
            <p role="alert" className="mt-2.5 text-sm font-medium text-[#9A3412] dark:text-amber-300">
              {photoError}
            </p>
          )}
        </div>

        {/* Séparateur éditorial */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E7E2D8] dark:bg-[#273449]" />
          <span className="text-xs uppercase tracking-widest text-[#78716C] dark:text-slate-400">
            Ou explorer un objet mystère
          </span>
          <div className="h-px flex-1 bg-[#E7E2D8] dark:bg-[#273449]" />
        </div>

        {/* Formulaire Objet Mystère libre */}
        <form onSubmit={handleMysterySubmit} noValidate className="space-y-2">
          <label
            htmlFor="curioz-mystery-input"
            className="block text-sm font-semibold text-[#292524] dark:text-slate-200"
          >
            Saisir un sujet ou un objet curieux
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] dark:text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="curioz-mystery-input"
                type="text"
                maxLength={120}
                value={mysteryInput}
                onChange={(e) => {
                  setMysteryInput(e.target.value);
                  if (mysteryError) setMysteryError('');
                }}
                placeholder="Ex. : cadran solaire de poche, boîte à musique…"
                className="w-full min-h-[46px] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D6CEBE] dark:border-[#334155] bg-[#FAF8F4] dark:bg-[#0F172A] text-[#1C1917] dark:text-white placeholder:text-[#8A8177] dark:placeholder:text-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-[#3f51b5]"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#292524] hover:bg-[#1C1917] dark:bg-slate-100 dark:hover:bg-white text-white dark:text-[#0F172A] disabled:opacity-60 font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              {isScanning ? 'Analyse…' : 'Révéler la fiche'}
            </button>
          </div>
          {mysteryError && (
            <p role="alert" className="text-sm font-medium text-[#9A3412] dark:text-amber-300">
              {mysteryError}
            </p>
          )}
        </form>
      </div>

      {/* Vitrines d'objets mystères illustrés (masqués en Mode simple pour alléger) */}
      {!simpleMode && (
        <div className="bg-white dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] rounded-2xl p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#EFECE5] dark:border-[#273449]">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#1C1917] dark:text-white">
              Objets mystères du cabinet
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#78716C] dark:text-slate-400">
              4 pièces
            </span>
          </div>
          <p className="mt-2.5 text-sm text-[#57534E] dark:text-slate-400">
            Sélectionnez une pièce pour demander au conservateur une fiche inédite au niveau choisi.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MYSTERY_PRESETS.map((preset) => {
              const isBroken = brokenImages[preset.id];
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isScanning}
                  onClick={() => handlePresetClick(preset)}
                  className="group text-left rounded-xl border border-[#E7E2D8] dark:border-[#273449] bg-[#FAF8F4] dark:bg-[#0F172A] hover:border-[#1E3A8A] dark:hover:border-sky-400 overflow-hidden transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f51b5]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFECE5] dark:bg-[#0B1220]">
                    {isBroken ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#78716C] dark:text-slate-400">
                        <Compass size={26} aria-hidden="true" />
                        <span className="mt-2 text-xs font-medium">{preset.title}</span>
                      </div>
                    ) : (
                      <img
                        src={preset.imageUrl}
                        alt={preset.imageAlt}
                        referrerPolicy="no-referrer"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [preset.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="text-xs text-[#78716C] dark:text-slate-400 truncate">{preset.subtitle}</div>
                    <div className="mt-0.5 font-[family-name:var(--font-display)] text-base font-semibold text-[#1C1917] dark:text-white leading-snug">
                      {preset.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
