import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookmarkCheck,
  Compass,
  Printer,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LEVEL_OPTIONS } from '../data/curiozData';
import type { CuriozLevel, CuriozSpecimen } from '../types/curioz';
import { getLevelDisplayLabel } from '../utils/curiozStore';

interface SpecimenFicheProps {
  specimen: CuriozSpecimen | null;
  isScanning: boolean;
  scanError: string | null;
  onRetryScan: () => void;
  onReanalyzeAtLevel: (targetLevel: CuriozLevel) => void;
  isSpeaking: boolean;
  onToggleSpeakSpecimen: () => void;
  isSavedInCarnet: boolean;
}

export function SpecimenFiche({
  specimen,
  isScanning,
  scanError,
  onRetryScan,
  onReanalyzeAtLevel,
  isSpeaking,
  onToggleSpeakSpecimen,
  isSavedInCarnet,
}: SpecimenFicheProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [specimen?.id, specimen?.imageUrl]);

  if (isScanning) {
    return (
      <section
        aria-live="polite"
        aria-busy="true"
        className="bg-white dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-sm font-medium text-[#1E3A8A] dark:text-sky-300">
            <RefreshCw size={18} className="animate-spin shrink-0" aria-hidden="true" />
            <span>Le conservateur examine la pièce et rédige votre fiche de curiosité…</span>
          </div>
          <div className="aspect-[16/10] w-full rounded-xl bg-[#EFECE5] dark:bg-[#0F172A] animate-pulse" />
          <div className="h-8 w-2/3 rounded-lg bg-[#EFECE5] dark:bg-[#0F172A] animate-pulse" />
          <div className="space-y-2.5 pt-2">
            <div className="h-4 w-full rounded bg-[#EFECE5] dark:bg-[#0F172A] animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-[#EFECE5] dark:bg-[#0F172A] animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-[#EFECE5] dark:bg-[#0F172A] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="specimen-title" className="space-y-4">
      {scanError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#F5C2B4] dark:border-rose-800/70 bg-[#FFF5F2] dark:bg-rose-950/30 p-5 text-[#7C2D12] dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-[#9A3412] dark:text-rose-300" aria-hidden="true" />
            <div>
              <p className="font-semibold text-base">Analyse indisponible</p>
              <p className="mt-0.5 text-sm leading-relaxed">{scanError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetryScan}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {!specimen ? (
        <div className="bg-white dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] rounded-2xl p-8 text-center">
          <Compass size={32} className="mx-auto text-[#78716C] dark:text-slate-400" aria-hidden="true" />
          <h2
            id="specimen-title"
            className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1C1917] dark:text-white"
          >
            Aucune fiche sélectionnée
          </h2>
          <p className="mt-2 max-w-md mx-auto text-[#57534E] dark:text-slate-400">
            Importez une photo ou choisissez un objet mystère dans la table d’examen pour ouvrir sa fiche de musée.
          </p>
        </div>
      ) : (
        <article className="bg-white dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] rounded-2xl overflow-hidden">
          {/* En-tête muséal d'inventaire (zéro pilule, métadonnées typographiques épurées) */}
          <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-[#EFECE5] dark:border-[#273449]">
            <div className="curioz-meta flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono tabular-nums uppercase tracking-wider text-[#78716C] dark:text-slate-400">
                <span>{specimen.accessionCode}</span>
                <span aria-hidden="true">·</span>
                <span>Niveau {getLevelDisplayLabel(specimen.level)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {specimen.sourceType === 'photo'
                    ? 'Photographie'
                    : specimen.sourceType === 'mystery'
                      ? 'Objet mystère'
                      : 'Archive du cabinet'}
                </span>
              </div>
              {isSavedInCarnet && (
                <span className="inline-flex items-center gap-1.5 text-[#14532D] dark:text-emerald-300 font-medium whitespace-nowrap">
                  <BookmarkCheck size={14} aria-hidden="true" />
                  <span>Enregistré dans le carnet</span>
                </span>
              )}
            </div>

            <h2
              id="specimen-title"
              className="curioz-title mt-3 font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] dark:text-white leading-[1.15] text-balance"
            >
              {specimen.name}
            </h2>
          </div>

          {/* Photographie d'archive */}
          {specimen.imageUrl && (
            <figure className="px-6 sm:px-8 pt-6">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#EFECE5] dark:bg-[#0B1220] border border-[#E7E2D8] dark:border-[#273449]">
                {imageFailed ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#78716C] dark:text-slate-400">
                    <Compass size={32} aria-hidden="true" />
                    <span className="mt-2 text-sm font-medium">{specimen.name}</span>
                  </div>
                ) : (
                  <img
                    src={specimen.imageUrl}
                    alt={specimen.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <figcaption className="mt-2 text-xs font-[family-name:var(--font-display)] italic text-[#78716C] dark:text-slate-400">
                Fig. — {specimen.name} ({specimen.accessionCode})
              </figcaption>
            </figure>
          )}

          {/* Fiche structurée : Origine, Usage et Vie secrète */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            <dl className="divide-y divide-[#EFECE5] dark:divide-[#273449]">
              <div className="pb-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <dt className="sm:col-span-4 text-xs uppercase tracking-widest font-semibold text-[#78716C] dark:text-slate-400 pt-1">
                  Origine & époque
                </dt>
                <dd className="sm:col-span-8 curioz-prose text-[#1C1917] dark:text-slate-100 leading-relaxed max-w-prose">
                  {specimen.origin}
                </dd>
              </div>

              <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4">
                <dt className="sm:col-span-4 text-xs uppercase tracking-widest font-semibold text-[#78716C] dark:text-slate-400 pt-1">
                  Usage & fonctionnement
                </dt>
                <dd className="sm:col-span-8 curioz-prose text-[#1C1917] dark:text-slate-100 leading-relaxed max-w-prose">
                  {specimen.usage}
                </dd>
              </div>
            </dl>

            {/* Récit poétique avec lettrine éditoriale (sans bordure épaisse à gauche) */}
            <div className="pt-5 pb-2 border-t border-[#E7E2D8] dark:border-[#273449]">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#9A3412] dark:text-amber-300">
                La vie secrète de l’objet
              </h3>
              <p className="curioz-prose mt-3 font-[family-name:var(--font-display)] text-lg sm:text-[19px] text-[#292524] dark:text-slate-100 leading-[1.78] max-w-prose first-letter:text-5xl first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.85] first-letter:text-[#1E3A8A] dark:first-letter:text-sky-300">
                {specimen.story}
              </p>
            </div>
          </div>

          {/* Barre d'actions de la fiche */}
          <div className="px-6 sm:px-8 py-4 bg-[#FAF8F4] dark:bg-[#0F172A] border-t border-[#EFECE5] dark:border-[#273449] flex flex-col gap-3 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleSpeakSpecimen}
                  aria-pressed={isSpeaking}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#047857] text-white'
                      : 'bg-white dark:bg-[#162033] border border-[#D6CEBE] dark:border-[#334155] text-[#1C1917] dark:text-slate-100 hover:bg-[#EFECE5] dark:hover:bg-[#1E2B44]'
                  }`}
                >
                  {isSpeaking ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
                  <span>{isSpeaking ? 'Arrêter la lecture' : 'Écouter la fiche'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-white dark:bg-[#162033] border border-[#D6CEBE] dark:border-[#334155] text-[#1C1917] dark:text-slate-100 hover:bg-[#EFECE5] dark:hover:bg-[#1E2B44] text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer size={16} aria-hidden="true" />
                  <span>Imprimer</span>
                </button>
              </div>

              {/* Relire la même pièce à un autre niveau via l'API */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#78716C] dark:text-slate-400 mr-1">Relire en :</span>
                {LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={specimen.level === opt.id}
                    onClick={() => onReanalyzeAtLevel(opt.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      specimen.level === opt.id
                        ? 'bg-[#1E3A8A] text-white cursor-default'
                        : 'bg-white dark:bg-[#162033] border border-[#D6CEBE] dark:border-[#334155] text-[#292524] dark:text-slate-200 hover:border-[#1E3A8A] dark:hover:border-sky-400 cursor-pointer'
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
