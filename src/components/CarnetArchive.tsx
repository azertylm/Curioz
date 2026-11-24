import React, { useState } from 'react';
import { Compass, Search, Trash2 } from 'lucide-react';
import { LEVEL_OPTIONS } from '../data/curiozData';
import type { CuriozLevel, CuriozSpecimen } from '../types/curioz';
import { filterSpecimens, getLevelDisplayLabel } from '../utils/curiozStore';

interface CarnetArchiveProps {
  specimens: CuriozSpecimen[];
  activeSpecimenId: string | null;
  onSelectSpecimen: (specimen: CuriozSpecimen) => void;
  onDeleteSpecimen: (id: string) => void;
}

export function CarnetArchive({
  specimens,
  activeSpecimenId,
  onSelectSpecimen,
  onDeleteSpecimen,
}: CarnetArchiveProps) {
  const [levelFilter, setLevelFilter] = useState<CuriozLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const filtered = filterSpecimens(specimens, levelFilter, searchQuery);

  return (
    <section
      aria-labelledby="carnet-heading"
      className="mt-10 pt-8 border-t border-[#E7E2D8] dark:border-[#273449] no-print"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="curioz-meta text-xs uppercase tracking-widest text-[#78716C] dark:text-slate-400">
            Collection personnelle
          </p>
          <h2
            id="carnet-heading"
            className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-white"
          >
            Mon carnet de curiosités
          </h2>
          <p className="mt-1 text-sm text-[#57534E] dark:text-slate-400">
            <span className="font-mono tabular-nums">{specimens.length}</span>{' '}
            {specimens.length > 1 ? 'fiches conservées sur cet appareil.' : 'fiche conservée sur cet appareil.'}
          </p>
        </div>

        {/* Filtres par niveau + recherche */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div
            role="group"
            aria-label="Filtrer le carnet par niveau"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFECE5] dark:bg-[#162033] border border-[#E7E2D8] dark:border-[#273449] overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              aria-pressed={levelFilter === 'all'}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                levelFilter === 'all'
                  ? 'bg-white dark:bg-[#24324D] text-[#1C1917] dark:text-white shadow-xs'
                  : 'text-[#57534E] dark:text-slate-400 hover:text-[#1C1917] dark:hover:text-white'
              }`}
            >
              Tous
            </button>
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLevelFilter(opt.id)}
                aria-pressed={levelFilter === opt.id}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  levelFilter === opt.id
                    ? 'bg-white dark:bg-[#24324D] text-[#1C1917] dark:text-white shadow-xs'
                    : 'text-[#57534E] dark:text-slate-400 hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>

          <div className="relative sm:w-60">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C] dark:text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher dans mon carnet de curiosités"
              placeholder="Rechercher une fiche…"
              className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-[#D6CEBE] dark:border-[#334155] bg-white dark:bg-[#162033] text-sm text-[#1C1917] dark:text-white placeholder:text-[#8A8177] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3f51b5]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#E7E2D8] dark:border-[#273449] bg-white dark:bg-[#162033] p-8 text-center">
          <p className="text-base font-medium text-[#1C1917] dark:text-white">
            Aucune fiche ne correspond à votre filtre.
          </p>
          <p className="mt-1 text-sm text-[#57534E] dark:text-slate-400">
            Effacez la recherche ou choisissez un autre niveau pour retrouver vos curiosités.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isSelected = item.id === activeSpecimenId;
            const imgBroken = !item.imageUrl || brokenImages[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white dark:bg-[#162033] overflow-hidden flex flex-col transition-colors ${
                  isSelected
                    ? 'border-[#1E3A8A] dark:border-sky-400 ring-1 ring-[#1E3A8A]/25 dark:ring-sky-400/25'
                    : 'border-[#E7E2D8] dark:border-[#273449] hover:border-[#C6BEB0] dark:hover:border-[#3D4E6B]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSpecimen(item)}
                  className="text-left flex-1 flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3f51b5]"
                >
                  <div className="aspect-[16/10] w-full bg-[#EFECE5] dark:bg-[#0B1220] overflow-hidden">
                    {imgBroken ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#78716C] dark:text-slate-400 p-4">
                        <Compass size={26} aria-hidden="true" />
                        <span className="mt-1.5 text-xs font-mono">{item.accessionCode}</span>
                      </div>
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#78716C] dark:text-slate-400">
                      <span>{item.accessionCode}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">{getLevelDisplayLabel(item.level)}</span>
                    </div>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold text-[#1C1917] dark:text-white leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#57534E] dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.origin}
                    </p>
                  </div>
                </button>

                <div className="px-4 py-2.5 border-t border-[#EFECE5] dark:border-[#273449] flex items-center justify-between gap-2 bg-[#FAF8F4] dark:bg-[#0F172A]">
                  <button
                    type="button"
                    onClick={() => onSelectSpecimen(item)}
                    className="text-xs font-semibold text-[#1E3A8A] dark:text-sky-300 hover:underline cursor-pointer min-h-[36px] px-1"
                  >
                    {isSelected ? 'Fiche affichée' : 'Ouvrir la fiche'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSpecimen(item.id)}
                    aria-label={`Supprimer '${item.name}' du carnet`}
                    className="min-w-[36px] min-h-[36px] rounded-lg text-[#78716C] hover:text-[#9A3412] dark:text-slate-400 dark:hover:text-rose-300 hover:bg-[#EFECE5] dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
