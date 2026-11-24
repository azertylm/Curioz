import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart2,
  Crown,
  Heart,
  LayoutGrid,
  Moon,
  MoreHorizontal,
  Star,
  Sun,
  Volume2,
  VolumeX,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ALPHABETTE_APPS } from '../data/curiozData';
import type { LanguageCode } from '../types/curioz';

const FAVORITES_KEY = 'alphabette_favorite_apps_v1';
const PINNED_KEY = 'alphabette_pinned_curioz_v1';

interface AlphabetteHeaderProps {
  bigMode: boolean;
  onToggleBigMode: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onReturnHome: () => void;
}

type ActiveModal =
  | null
  | 'all-apps'
  | 'new-apps'
  | 'subscription'
  | 'donate'
  | 'install'
  | 'feedback'
  | 'language';

function loadStringSet(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return ['curioz'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : ['curioz'];
  } catch {
    return ['curioz'];
  }
}

export function AlphabetteHeader({
  bigMode,
  onToggleBigMode,
  isDark,
  onToggleDark,
  isSpeaking,
  onToggleSpeech,
  simpleMode,
  onToggleSimpleMode,
  language,
  onChangeLanguage,
  onReturnHome,
}: AlphabetteHeaderProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteApps, setFavoriteApps] = useState<string[]>(() => loadStringSet(FAVORITES_KEY));
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(PINNED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setActiveModal(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!noticeMessage) return;
    const timer = window.setTimeout(() => setNoticeMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [noticeMessage]);

  const toggleFavoriteApp = (appId: string) => {
    setFavoriteApps((prev) => {
      const next = prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId];
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(PINNED_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      setNoticeMessage(next ? 'Curioz a été épinglée en haut de votre écran.' : 'Curioz a été désépinglée.');
      return next;
    });
    setMenuOpen(false);
  };

  const handleSimpleModeClick = () => {
    onToggleSimpleMode();
    setNoticeMessage(
      !simpleMode
        ? 'Mode simple activé : affichage épuré et texte agrandi.'
        : 'Mode simple désactivé : affichage complet rétabli.',
    );
    setMenuOpen(false);
  };

  const handlePrintClick = () => {
    setMenuOpen(false);
    window.setTimeout(() => {
      window.print();
    }, 80);
  };

  const handleFeedbackSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Écrivez quelques mots avant d’envoyer votre avis.');
      return;
    }
    setFeedbackError('');
    setFeedbackSent(true);
    setFeedbackText('');
  };

  const newApps = ALPHABETTE_APPS.filter((app) => app.isNew);

  return (
    <>
      <header className="sticky top-0 z-40 w-full no-print select-none">
        {/* 1. BARRE SUPÉRIEURE (Top Bar Écosystème) — Dimensions en px fixes */}
        <div className="w-full h-[46px] sm:h-[50px] px-[8px] sm:px-[16px] bg-[#182334] dark:bg-[#0b1220] text-white flex items-center justify-between gap-[4px] sm:gap-[8px] flex-nowrap">
          <div className="flex items-center gap-[5px] sm:gap-[10px] min-w-0 flex-nowrap">
            {/* 1. Logo + Nom alphabette */}
            <a
              href="https://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px] sm:gap-[8px] rounded-full pr-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 shrink-0"
              aria-label="Accueil Alphabette (alphabette.fr)"
            >
              <span
                aria-hidden="true"
                className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-full bg-[#3355d1] text-white text-[15px] sm:text-[16px] font-bold leading-none flex items-center justify-center shrink-0"
              >
                a
              </span>
              <span className="text-[15px] sm:text-[17px] font-bold tracking-tight text-white whitespace-nowrap leading-none">
                alphabette
              </span>
            </a>

            {/* 2. Bouton .eu */}
            <a
              href="https://alphabette.eu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Laboratoire alphabette.eu"
              className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-semibold flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 shrink-0"
            >
              .eu
            </a>

            {/* 3. Bouton Toutes les applis */}
            <button
              type="button"
              onClick={() => setActiveModal('all-apps')}
              aria-label="Toutes les applis de la suite Alphabette"
              className="w-[34px] h-[34px] sm:w-auto sm:h-[36px] sm:px-[10px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-[6px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 shrink-0"
            >
              <LayoutGrid size={17} strokeWidth={2} aria-hidden="true" />
              <span className="hidden sm:inline text-[12.5px] font-medium whitespace-nowrap">
                Toutes les applis
              </span>
            </button>

            {/* 4. Bouton NEW */}
            <button
              type="button"
              onClick={() => setActiveModal('new-apps')}
              aria-label="Nouveautés de la suite Alphabette"
              className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 shrink-0"
            >
              <span className="rounded-[4px] bg-gradient-to-br from-sky-200 to-sky-400 text-[#0f172a] text-[9px] font-extrabold leading-none px-[4px] py-[2px] tracking-tight uppercase">
                NEW
              </span>
            </button>
          </div>

          {/* 5. Bouton Abonnement (extrême droite) */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal('subscription')}
              aria-label="Informations sur l'abonnement Alphabette"
              className="h-[34px] sm:h-[36px] px-[8px] sm:px-[14px] rounded-full bg-white/10 hover:bg-white/20 border-[1.5px] border-[#f59e0b] text-[#fbbf24] text-[12px] sm:text-[13.5px] font-bold flex items-center gap-[5px] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 shrink-0"
            >
              <Crown size={14} className="text-[#f59e0b] shrink-0" aria-hidden="true" />
              <span>Abonnement</span>
            </button>
          </div>
        </div>

        {/* 2. BARRE INFÉRIEURE (Barre d'Application & Accessibilité) — Dimensions en px fixes */}
        <div className="w-full h-[54px] sm:h-[58px] px-[10px] sm:px-[16px] bg-white dark:bg-[#0f172a] border-b border-[#e2e8f0] dark:border-[#334155] flex items-center justify-between gap-[6px] flex-nowrap">
          {/* Bloc gauche : Titre + Sous-titre */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onReturnHome}
              className="text-left max-w-full flex flex-col justify-center cursor-pointer rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f51b5]"
              aria-label="Revenir en haut de l'application Curioz"
            >
              <span className="flex items-center gap-[4px] min-w-0">
                <span className="text-[14.5px] sm:text-[20px] font-bold tracking-tight text-[#3f51b5] dark:text-white leading-[1.15] truncate">
                  Curioz
                </span>
                {isPinned && (
                  <Star
                    size={13}
                    className="text-amber-500 fill-amber-400 shrink-0"
                    aria-label="Application épinglée"
                  />
                )}
              </span>
              <span className="text-[9px] sm:text-[10.5px] uppercase tracking-[0.04em] text-[#64748b] dark:text-slate-400 leading-[1.2] truncate">
                CABINET DE CURIOSITÉS
              </span>
            </button>
          </div>

          {/* Bloc droit : 5 boutons d'accessibilité alignés horizontalement */}
          <div className="flex items-center gap-[4px] sm:gap-[7px] shrink-0">
            {/* 1. Bouton Don */}
            <button
              type="button"
              onClick={() => setActiveModal('donate')}
              aria-label="Soutenir Alphabette par un don"
              className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-[10px] sm:rounded-[11px] bg-[#db2777] hover:bg-[#be185d] text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 shrink-0"
            >
              <Heart size={17} className="fill-white text-white" aria-hidden="true" />
            </button>

            {/* 2. Bouton BIG */}
            <button
              type="button"
              onClick={onToggleBigMode}
              aria-pressed={bigMode}
              aria-label={bigMode ? 'Désactiver le mode grand texte BIG' : 'Activer le mode grand texte BIG'}
              className={`h-[34px] sm:h-[38px] px-[8px] sm:px-[11px] rounded-[10px] sm:rounded-[11px] text-white font-bold text-[12px] sm:text-[14px] flex items-center gap-[4px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shrink-0 ${
                bigMode
                  ? 'bg-[#312e81] ring-2 ring-indigo-300 dark:ring-indigo-400'
                  : 'bg-[#4338ca] hover:bg-[#3730a3]'
              }`}
            >
              <span>BIG</span>
              <BarChart2 size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>

            {/* 3. Bouton Mode Nuit / Jour */}
            <button
              type="button"
              onClick={onToggleDark}
              aria-pressed={isDark}
              aria-label={isDark ? 'Passer en mode jour' : 'Passer en mode nuit'}
              className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] dark:bg-[#1e293b] dark:hover:bg-[#334155] border border-[#e2e8f0] dark:border-[#334155] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f51b5] shrink-0"
            >
              {isDark ? (
                <Sun size={17} className="text-[#fbbf24]" aria-hidden="true" />
              ) : (
                <Moon size={17} className="text-[#334155]" aria-hidden="true" />
              )}
            </button>

            {/* 4. Bouton Lecture à haute voix */}
            <button
              type="button"
              onClick={onToggleSpeech}
              aria-pressed={isSpeaking}
              aria-label={isSpeaking ? 'Arrêter la lecture à haute voix' : 'Lire le contenu à haute voix'}
              className={`w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 shrink-0 ${
                isSpeaking
                  ? 'bg-[#047857] border-[#047857] text-white'
                  : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] dark:bg-[#1e293b] dark:hover:bg-[#334155] border-[#e2e8f0] dark:border-[#334155] text-[#334155] dark:text-slate-200'
              }`}
            >
              {isSpeaking ? (
                <VolumeX size={17} aria-hidden="true" />
              ) : (
                <Volume2 size={17} aria-hidden="true" />
              )}
            </button>

            {/* 5. Bouton Plus d'options (...) */}
            <div className="relative shrink-0" ref={menuContainerRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Plus d'options"
                className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] dark:bg-[#1e293b] dark:hover:bg-[#334155] border border-[#e2e8f0] dark:border-[#334155] text-[#334155] dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f51b5]"
              >
                <MoreHorizontal size={18} aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Options de l'application Curioz"
                  className="absolute right-0 mt-[8px] w-[260px] rounded-[14px] bg-white dark:bg-[#162033] border border-[#e2e8f0] dark:border-[#334155] shadow-xl py-[6px] z-50 text-[14px] text-[#0f172a] dark:text-slate-100"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleTogglePin}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>⭐ Épingler cette appli</span>
                    {isPinned && <Check size={15} className="text-amber-500" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('subscription');
                    }}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>👤 Mon inscription</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSimpleModeClick}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>🧘 Mode simple</span>
                    {simpleMode && <Check size={15} className="text-emerald-600" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('install');
                    }}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>📱 Installer sur mon téléphone</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setFeedbackSent(false);
                      setFeedbackError('');
                      setActiveModal('feedback');
                    }}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>💬 Donner mon avis</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handlePrintClick}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>🖨️ Imprimer</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setActiveModal('language');
                    }}
                    className="w-full px-[14px] py-[10px] text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span>🌐 Langue</span>
                    <span className="text-[12px] font-semibold text-[#64748b] dark:text-slate-400">
                      {language}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bannière de confirmation discrète (ex: Mode simple, Épingler) */}
        {noticeMessage && (
          <div
            role="status"
            aria-live="polite"
            className="w-full bg-[#1e293b] text-white text-[13px] px-[16px] py-[8px] flex items-center justify-between gap-[12px]"
          >
            <span>{noticeMessage}</span>
            <button
              type="button"
              onClick={() => setNoticeMessage(null)}
              className="text-slate-300 hover:text-white cursor-pointer"
              aria-label="Fermer la notification"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </header>

      {/* MODALES AUTONOMES DE LA DOUBLE BARRE */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-[16px] no-print"
          onClick={() => setActiveModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="alphabette-modal-title"
            className="w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-[16px] bg-white dark:bg-[#162033] text-[#0f172a] dark:text-slate-100 border border-[#e2e8f0] dark:border-[#334155] shadow-2xl p-[22px]"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'all-apps' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold">
                    Toutes les applis
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre Toutes les applis"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-[12px] text-[14px] text-[#475569] dark:text-slate-300">
                  Retrouvez les applications de la suite Alphabette et marquez vos favorites d’une étoile.
                </p>
                <ul className="mt-[14px] divide-y divide-[#e2e8f0] dark:divide-[#334155]">
                  {ALPHABETTE_APPS.map((app) => {
                    const isFav = favoriteApps.includes(app.id);
                    return (
                      <li key={app.id} className="py-[12px] flex items-center justify-between gap-[12px]">
                        <div className="min-w-0">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[15px] text-[#1e293b] dark:text-white hover:text-[#3f51b5] dark:hover:text-sky-300 inline-flex items-center gap-[6px]"
                          >
                            <span>{app.name}</span>
                            <ExternalLink size={13} className="opacity-60" aria-hidden="true" />
                          </a>
                          <p className="text-[13px] text-[#64748b] dark:text-slate-400 mt-[2px]">
                            {app.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavoriteApp(app.id)}
                          aria-pressed={isFav}
                          aria-label={isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`}
                          className="w-[40px] h-[40px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[20px] shrink-0 cursor-pointer"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-[18px] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'new-apps' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold">
                    Nouveautés
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre Nouveautés"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-[12px] text-[14px] text-[#475569] dark:text-slate-300">
                  Les dernières applications publiées dans l’écosystème Alphabette.
                </p>
                <ul className="mt-[14px] divide-y divide-[#e2e8f0] dark:divide-[#334155]">
                  {newApps.map((app) => {
                    const isFav = favoriteApps.includes(app.id);
                    return (
                      <li key={app.id} className="py-[12px] flex items-center justify-between gap-[12px]">
                        <div className="min-w-0">
                          <div className="text-[12px] text-[#3f51b5] dark:text-sky-300 font-medium">
                            {app.releaseLabel}
                          </div>
                          <div className="font-semibold text-[15px] text-[#0f172a] dark:text-white mt-[2px]">
                            {app.name}
                          </div>
                          <p className="text-[13px] text-[#64748b] dark:text-slate-400 mt-[2px]">
                            {app.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFavoriteApp(app.id)}
                          aria-pressed={isFav}
                          aria-label={isFav ? `Retirer ${app.name} des favoris` : `Ajouter ${app.name} aux favoris`}
                          className="w-[40px] h-[40px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-[20px] shrink-0 cursor-pointer"
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-[18px] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'subscription' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold flex items-center gap-[8px]">
                    <Crown size={20} className="text-[#f59e0b]" aria-hidden="true" />
                    <span>Abonnement Alphabette</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre Abonnement"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="mt-[16px] space-y-[14px] text-[15px] leading-relaxed text-[#334155] dark:text-slate-200">
                  <p className="font-semibold text-[#0f172a] dark:text-white">
                    Lancement de l’abonnement payant le 7 mai.
                  </p>
                  <p>
                    Un compte unique Alphabette vous permettra de synchroniser votre Carnet de Curiosités et d’accéder
                    à l’ensemble des applications Web et Android sans publicité.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] pt-[4px]">
                    <div className="rounded-[12px] border border-[#e2e8f0] dark:border-[#334155] p-[14px] bg-slate-50 dark:bg-[#0f172a]">
                      <div className="text-[13px] font-medium text-[#64748b] dark:text-slate-400">Une application</div>
                      <div className="mt-[4px] text-[24px] font-bold font-mono tabular-nums text-[#0f172a] dark:text-white">
                        15 € / an
                      </div>
                      <p className="mt-[6px] text-[13px] text-[#475569] dark:text-slate-300">
                        Accès complet à Curioz ou à l’appli Alphabette de votre choix.
                      </p>
                    </div>
                    <div className="rounded-[12px] border-[1.5px] border-[#f59e0b] p-[14px] bg-amber-50/50 dark:bg-amber-950/20">
                      <div className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">
                        Toutes les applis
                      </div>
                      <div className="mt-[4px] text-[24px] font-bold font-mono tabular-nums text-[#0f172a] dark:text-white">
                        40 € / an
                      </div>
                      <p className="mt-[6px] text-[13px] text-[#475569] dark:text-slate-300">
                        Toute la suite Alphabette (Web + Android), nouveautés incluses.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-[20px] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'donate' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold flex items-center gap-[8px]">
                    <Heart size={20} className="text-[#db2777] fill-[#db2777]" aria-hidden="true" />
                    <span>Soutenir Alphabette</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre de don"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-[14px] text-[15px] leading-relaxed text-[#334155] dark:text-slate-200">
                  Alphabette est un projet indépendant conçu sans publicité ni revente de données. Votre soutien aide à
                  financer l’hébergement européen, les analyses photo et l’accessibilité de chaque application.
                </p>
                <div className="mt-[18px] flex flex-wrap items-center justify-end gap-[10px]">
                  <a
                    href="https://alphabette.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#db2777] hover:bg-[#be185d] text-white text-[14px] font-semibold inline-flex items-center gap-[6px]"
                  >
                    <span>Faire un don sur alphabette.fr</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[16px] py-[10px] rounded-[10px] border border-[#cbd5e1] dark:border-[#334155] text-[14px] font-medium cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'install' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold">
                    Installer Curioz sur mon téléphone
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre d'installation"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <ol className="mt-[14px] space-y-[10px] text-[15px] text-[#334155] dark:text-slate-200 list-decimal pl-[20px]">
                  <li>
                    <strong>Sur Android (Chrome) :</strong> ouvrez le menu en haut à droite (⋮) puis choisissez{' '}
                    <em>« Ajouter à l’écran d’accueil »</em> ou <em>« Installer l’application »</em>.
                  </li>
                  <li>
                    <strong>Sur iPhone / iPad (Safari) :</strong> appuyez sur le bouton Partager en bas de l’écran,
                    puis sélectionnez <em>« Sur l’écran d’accueil »</em>.
                  </li>
                </ol>
                <div className="mt-[18px] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'feedback' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold">
                    Donner mon avis sur Curioz
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer la fenêtre d'avis"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                {feedbackSent ? (
                  <div className="mt-[16px] space-y-[14px]">
                    <p className="text-[15px] text-emerald-700 dark:text-emerald-300 font-medium">
                      Merci pour votre message ! Votre retour a bien été enregistré pour l’équipe Alphabette.
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="mt-[14px] space-y-[12px]">
                    <label htmlFor="curioz-feedback-textarea" className="block text-[14px] font-medium">
                      Une idée, un bug ou un objet curieux à suggérer ?
                    </label>
                    <textarea
                      id="curioz-feedback-textarea"
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => {
                        setFeedbackText(e.target.value);
                        if (feedbackError) setFeedbackError('');
                      }}
                      placeholder="Écrivez votre message ici..."
                      className="w-full rounded-[10px] border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0f172a] px-[12px] py-[10px] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3f51b5]"
                    />
                    {feedbackError && (
                      <p role="alert" className="text-[13px] text-rose-600 dark:text-rose-400">
                        {feedbackError}
                      </p>
                    )}
                    <div className="flex justify-end gap-[10px]">
                      <button
                        type="button"
                        onClick={() => setActiveModal(null)}
                        className="px-[16px] py-[10px] rounded-[10px] border border-[#cbd5e1] dark:border-[#334155] text-[14px] font-medium cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-[18px] py-[10px] rounded-[10px] bg-[#3f51b5] hover:bg-[#324197] text-white text-[14px] font-semibold cursor-pointer"
                      >
                        Envoyer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeModal === 'language' && (
              <div>
                <div className="flex items-center justify-between gap-[12px] pb-[14px] border-b border-[#e2e8f0] dark:border-[#334155]">
                  <h2 id="alphabette-modal-title" className="text-[20px] font-bold">
                    Langue de l’interface
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    aria-label="Fermer le sélecteur de langue"
                    className="w-[36px] h-[36px] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-[12px] text-[14px] text-[#475569] dark:text-slate-300">
                  Les fiches du conservateur Curioz sont rédigées en français. Choisissez votre repère linguistique :
                </p>
                <div className="mt-[14px] space-y-[8px]">
                  {(
                    [
                      { code: 'FR', label: 'Français (par défaut)' },
                      { code: 'EN', label: 'English (interface FR conservée)' },
                      { code: 'ES', label: 'Español (interface FR conservée)' },
                    ] as Array<{ code: LanguageCode; label: string }>
                  ).map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        onChangeLanguage(item.code);
                        setActiveModal(null);
                      }}
                      className={`w-full px-[14px] py-[12px] rounded-[10px] border text-left flex items-center justify-between cursor-pointer ${
                        language === item.code
                          ? 'border-[#3f51b5] bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                          : 'border-[#e2e8f0] dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-[12px]">{item.code}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-[18px] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-[18px] py-[10px] rounded-[10px] bg-[#182334] dark:bg-slate-200 text-white dark:text-slate-900 text-[14px] font-semibold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
