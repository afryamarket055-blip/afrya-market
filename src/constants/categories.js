// ============================================================
// AFRYA MARKET — Source unique de vérité pour les catégories
// ============================================================
// ⚠️ Ne JAMAIS dupliquer ces listes dans d'autres fichiers.
// Toujours importer : import { CATEGORIES, ... } from '../constants/categories'

export const CATEGORIES = [
  // === LES 7 EXISTANTES (ne pas renommer) ===
  {
    key: 'Téléphones',
    icon: 'smartphone',
    subs: [
      'Smartphones',
      'Téléphones classiques',
      'Téléphones reconditionnés',
      'Coques et protections',
      'Chargeurs et câbles',
      'Écouteurs et casques',
      'Batteries et accessoires',
      'Autres accessoires',
    ],
  },
  {
    key: 'Informatique',
    icon: 'laptop',
    subs: [
      'Ordinateurs portables',
      'Ordinateurs de bureau',
      'Écrans et moniteurs',
      'Claviers et souris',
      'Imprimantes',
      'Composants informatiques',
      'Consoles de jeux',
      'Jeux vidéo',
      'Accessoires gaming',
      'Matériel réseau',
    ],
  },
  {
    key: 'Électroménager',
    icon: 'tv',
    subs: [
      'Réfrigérateurs et congélateurs',
      'Climatiseurs',
      'Ventilateurs',
      'Machines à laver',
      'Mixeurs et blenders',
      'Cuisinières et gazinières',
      'Micro-ondes',
      'Fers à repasser',
      'Petits appareils',
    ],
  },
  {
    key: 'Mode',
    icon: 'shirt',
    subs: [
      'Vêtements hommes',
      'Vêtements femmes',
      'Vêtements enfants',
      'Friperie',
      'Vêtements vintage',
      'Tenues traditionnelles',
      'Sacs et bagages',
      'Accessoires de mode',
    ],
  },
  {
    key: 'Maison',
    icon: 'sofa',
    subs: [
      'Canapés et fauteuils',
      'Lits et matelas',
      'Tables et chaises',
      'Armoires et rangements',
      'Bureaux',
      'Décoration',
      'Rideaux et tapis',
      'Luminaires',
      'Ustensiles de cuisine',
    ],
  },
  {
    key: 'Véhicules',
    icon: 'bike',
    subs: [
      'Voitures',
      'Motos et scooters',
      'Vélos',
      'Pièces détachées',
      'Pneus et jantes',
      'Accessoires automobiles',
      'Casques et accessoires moto',
    ],
  },
  {
    key: 'Autres',
    icon: 'package',
    subs: [],
  },

  // === LES 9 NOUVELLES ===
  {
    key: 'Télévision & Son',
    icon: 'tv',
    subs: [
      'Téléviseurs',
      'Enceintes et haut-parleurs',
      'Casques audio',
      'Chaînes hi-fi',
      'Vidéoprojecteurs',
      'Appareils photo',
      'Caméras',
      'Accessoires audio vidéo',
    ],
  },
  {
    key: 'Chaussures',
    icon: 'package',
    subs: [
      'Chaussures hommes',
      'Chaussures femmes',
      'Chaussures enfants',
      'Sneakers et baskets',
      'Sandales et claquettes',
      'Chaussures de cérémonie',
      'Seconde main',
    ],
  },
  {
    key: 'Beauté',
    icon: 'sparkles',
    subs: [
      'Produits de beauté',
      'Maquillage',
      'Soins capillaires',
      'Perruques et mèches',
      'Accessoires de beauté',
      'Matériel professionnel coiffure',
      'Matériel salon de beauté',
    ],
  },
  {
    key: 'Sport & Loisirs',
    icon: 'bike',
    subs: [
      'Matériel de sport',
      'Vélos et équipements sportifs',
      'Instruments de musique',
      'Livres et BD',
      'Jeux et jouets',
      'Matériel de loisirs',
    ],
  },
  {
    key: 'Bébés & Enfants',
    icon: 'user',
    subs: [
      'Vêtements enfants',
      'Poussettes',
      'Jouets',
      'Mobilier bébé',
      'Accessoires enfants',
    ],
  },
  {
    key: 'Matériel professionnel',
    icon: 'package',
    subs: [
      'Matériel de bureau',
      'Matériel de commerce',
      'Équipements restaurant',
      'Machines à coudre',
      'Matériel de couture',
      'Outils et équipements atelier',
      'Matériel agricole',
      'Équipements pro occasion',
    ],
  },
  {
    key: 'Construction',
    icon: 'package',
    subs: [
      'Outils',
      'Matériel électrique',
      'Plomberie',
      'Peinture et décoration',
      'Matériaux de chantier',
    ],
  },
  {
    key: 'Immobilier',
    icon: 'home',
    subs: [
      'Chambres à louer',
      'Appartements à louer',
      'Maisons à louer',
      'Terrains',
      'Maisons et appartements à vendre',
    ],
  },
  {
    key: 'Animaux',
    icon: 'package',
    subs: [
      'Accessoires pour animaux',
      'Équipements élevage',
      'Matériel élevage',
    ],
  },
]

// Les 8 catégories vedettes affichées en home
export const FEATURED_CATEGORIES = [
  'Téléphones',
  'Informatique',
  'Mode',
  'Maison',
  'Électroménager',
  'Véhicules',
  'Beauté',
  'Chaussures',
]

// Helpers
export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || null
}

export function getSubcategories(categoryKey) {
  const cat = getCategory(categoryKey)
  return cat ? cat.subs : []
}

export function isValidCategory(key) {
  return CATEGORIES.some((c) => c.key === key)
}


// ============================================================
// HELPERS DE RENDU
// ============================================================

// Liste avec 'Toutes' en tete (pour les pages de filtres)
export const CATEGORIES_WITH_ALL = ['Toutes', ...CATEGORIES.map((c) => c.key)]

// Version prete pour le rendu (compat avec anciens {iconName, name})
export const CATEGORIES_RENDER = CATEGORIES.map((c) => ({
  iconName: c.icon,
  name: c.key,
}))

// Version vedettes pour la home
export const FEATURED_CATEGORIES_RENDER = FEATURED_CATEGORIES.map((key) => {
  const cat = CATEGORIES.find((c) => c.key === key)
  return { iconName: cat?.icon || 'package', name: key }
})
