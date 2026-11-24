import type { AlphabetteAppItem, CuriozLevel, CuriozSpecimen, MysteryPreset } from '../types/curioz';

export const LEVEL_OPTIONS: Array<{
  id: CuriozLevel;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: 'enfant',
    label: 'Enfant',
    shortLabel: 'Enfant',
    description: 'Mots simples, ton curieux et images parlantes (dès 10 ans).',
  },
  {
    id: 'public',
    label: 'Grand public',
    shortLabel: 'Grand public',
    description: 'Clair, vivant et culturel, pensé pour tous les visiteurs.',
  },
  {
    id: 'expert',
    label: 'Expert',
    shortLabel: 'Expert',
    description: 'Vocabulaire de conservateur, datation fine et procédés.',
  },
];

export const MYSTERY_PRESETS: MysteryPreset[] = [
  {
    id: 'astrolabe',
    title: 'Astrolabe de marine en laiton',
    subtitle: 'Instrument astronomique · 1648',
    era: 'XVIIe siècle',
    subjectPrompt: 'Astrolabe de marine en laiton gravé du XVIIe siècle',
    imageUrl: '/src/assets/images/curioz_astrolabe_1795508768625.jpg',
    imageAlt: 'Astrolabe de marine ancien en laiton gravé posé sur un socle en pierre calcaire',
  },
  {
    id: 'nautilus',
    title: 'Coquille de Nautile en coupe',
    subtitle: 'Spécimen d’histoire naturelle',
    era: 'Collection océanographique',
    subjectPrompt: 'Coquille de nautile chambré coupée en deux montrant sa spirale nacrée',
    imageUrl: '/src/assets/images/curioz_nautilus_1795508769092.jpg',
    imageAlt: 'Coquille de nautile nacrée coupée en deux sur un présentoir en bronze',
  },
  {
    id: 'camera-obscura',
    title: 'Chambre photographique à soufflet',
    subtitle: 'Optique & acajou · XIXe siècle',
    era: 'Vers 1885',
    subjectPrompt: 'Chambre photographique pliable en acajou et soufflet cuir du XIXe siècle avec objectif en laiton',
    imageUrl: '/src/assets/images/curioz_camera_obscura_1795508768585.jpg',
    imageAlt: 'Appareil photographique ancien en acajou, cuir à soufflet et objectif en laiton',
  },
  {
    id: 'herbarium-press',
    title: 'Presse d’herbier botanique',
    subtitle: 'Chêne massif & fougère royale',
    era: 'Fin XIXe siècle',
    subjectPrompt: 'Presse d’herbier botanique en chêne avec écrous papillon en laiton et fougère séchée',
    imageUrl: '/src/assets/images/curioz_botanical_press_1795508768861.jpg',
    imageAlt: 'Presse d’herbier en bois de chêne avec écrous en laiton à côté d’une fougère séchée sur papier coton',
  },
];

export const SEEDED_SPECIMENS: CuriozSpecimen[] = [
  {
    id: 'seed-astrolabe-public',
    accessionCode: 'ACC. CZ-2026-001',
    level: 'public',
    sourceType: 'archive',
    subjectPrompt: 'Astrolabe de marine en laiton gravé du XVIIe siècle',
    imageUrl: '/src/assets/images/curioz_astrolabe_1795508768625.jpg',
    createdAt: '2026-11-24T08:00:00.000Z',
    isSeeded: true,
    name: 'Astrolabe de marine en laiton',
    origin:
      'Europe atlantique (ateliers nautiques de Lisbonne ou Dieppe), milieu du XVIIe siècle (gravé Anno 1648). Coulé en laiton lourd pour résister au roulis et aux embruns.',
    usage:
      'Suspendu par son anneau supérieur, cet instrument permettait aux pilotes de mesurer la hauteur du soleil à midi ou celle de l’étoile Polaire grâce à son alidade pivotante. L’angle lu sur la couronne graduée révélait aussitôt la latitude du navire en pleine mer.',
    story:
      'On raconte que son ancien capitaine lui confiait ses doutes les nuits sans lune, persuadé que le laiton gardait la mémoire des ports quittés. Lorsque le vent forçait, la petite aiguille semblait pointer non pas vers le ciel, mais vers l’auberge la plus chaude de la côte bretonne.',
  },
  {
    id: 'seed-nautilus-public',
    accessionCode: 'ACC. CZ-2026-002',
    level: 'public',
    sourceType: 'archive',
    subjectPrompt: 'Coquille de nautile chambré coupée en deux montrant sa spirale nacrée',
    imageUrl: '/src/assets/images/curioz_nautilus_1795508769092.jpg',
    createdAt: '2026-11-23T15:30:00.000Z',
    isSeeded: true,
    name: 'Coquille de Nautile chambré (Nautilus pompilius)',
    origin:
      'Récifs profonds de l’océan Indo-Pacifique ; spécimen préparé en coupe sagittale pour les cabinets de curiosités européens du XVIIIe et XIXe siècle.',
    usage:
      'Chaque loge nacrée servait de ballast naturel à ce mollusque céphalopode, qui dosait gaz et liquide par un fin siphon pour monter ou descendre sans effort. En coupe, sa spirale logarithmique fascine autant les biologistes que les mathématiciens.',
    story:
      'Dans le silence de la vitrine, les trente-deux petites chambres du nautile se chuchotent encore le grondement des courants abyssaux. À la fermeture du musée, les gardiens jurent entendre un très léger clapotis s’échapper du socle de bronze.',
  },
  {
    id: 'seed-herbarium-public',
    accessionCode: 'ACC. CZ-2026-003',
    level: 'public',
    sourceType: 'archive',
    subjectPrompt: 'Presse d’herbier botanique en chêne avec écrous papillon en laiton et fougère séchée',
    imageUrl: '/src/assets/images/curioz_botanical_press_1795508768861.jpg',
    createdAt: '2026-11-22T11:15:00.000Z',
    isSeeded: true,
    name: 'Presse d’herbier botanique et spécimen d’Osmonde royale',
    origin:
      'Atelier de naturaliste anglais (Londres, fin XIXe siècle), chêne massif, tiges filetées en laiton et papier chiffon pur coton.',
    usage:
      'En serrant progressivement les quatre écrous papillon entre des buvards secs, le botaniste déshydratait les plantes récoltées tout en préservant leurs nervures à plat. Fixée par de fines bandelettes, chaque feuille devenait une archive scientifique consultable des siècles plus tard.',
    story:
      'Cette fougère cueillie sous une averse d’été 1894 a passé plus d’un siècle entre deux feuillets de coton sans jamais perdre son odeur de sous-bois mouillé. Les soirs d’orage, le bois de chêne de la presse craque doucement comme s’il se souvenait encore de la forêt.',
  },
];

export const ALPHABETTE_APPS: AlphabetteAppItem[] = [
  {
    id: 'curioz',
    name: 'Curioz',
    description: 'Scanner d’objets et cabinet de curiosités raconté selon votre niveau.',
    url: 'https://alphabette.fr',
    isNew: true,
    releaseLabel: 'Nouveau · Cabinet IA',
  },
  {
    id: 'info-perso',
    name: 'Info Perso',
    description: 'Vos repères essentiels du quotidien dans une fiche claire et accessible.',
    url: 'https://alphabette.fr',
  },
  {
    id: 'memo-clair',
    name: 'Mémo Clair',
    description: 'Listes, rendez-vous et rappels vocaux pensés pour la sérénité.',
    url: 'https://alphabette.fr',
    isNew: true,
    releaseLabel: 'Nouveau · Organisation',
  },
  {
    id: 'plume-facile',
    name: 'Plume Facile',
    description: 'Rédiger un courrier, un message ou une démarche administrative sans stress.',
    url: 'https://alphabette.fr',
  },
  {
    id: 'balade-patrimoine',
    name: 'Balade & Patrimoine',
    description: 'Petites histoires locales et anecdotes architecturales au fil de vos promenades.',
    url: 'https://alphabette.fr',
    isNew: true,
    releaseLabel: 'Nouveau · Culture',
  },
  {
    id: 'dictee-douce',
    name: 'Dictée Douce',
    description: 'Jeux de mots quotidiens et orthographe ludique en grand format.',
    url: 'https://alphabette.fr',
  },
  {
    id: 'cahier-recettes',
    name: 'Cahier de Recettes',
    description: 'Vos recettes de famille lues à voix haute étape par étape en cuisine.',
    url: 'https://alphabette.fr',
  },
  {
    id: 'labo-eu',
    name: 'Laboratoire alphabette.eu',
    description: 'Prototypes expérimentaux et outils en cours de test avec la communauté.',
    url: 'https://alphabette.eu',
  },
];
