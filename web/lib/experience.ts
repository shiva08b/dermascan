import type {
  AcneType,
  DermatologistListing,
  HomeRemedy,
  ProductRecommendation,
  ScanRecord,
  SkinType,
} from '@/lib/types'

const PRODUCT_CATALOG: ProductRecommendation[] = [
  {
    id: 'prod-1',
    name: 'Clarifying Gel Cleanser',
    brand: 'CeraVe',
    category: 'Cleanser',
    sponsored: true,
    price: 399,
    rating: 4.6,
    offer: '10% off on first order',
    retailer: 'Nykaa',
    skinTypes: ['oily', 'combination', 'sensitive'],
    concernTags: ['salicylic_acid', 'non_comedogenic'],
    description: 'Lightweight cleanser for oily and acne-prone skin.',
    proDiscountCode: 'PROSKIN10',
  },
  {
    id: 'prod-2',
    name: 'BHA Exfoliating Serum',
    brand: 'Minimalist',
    category: 'Serum',
    sponsored: false,
    price: 549,
    rating: 4.5,
    offer: 'Buy 2 get 1 mini',
    retailer: 'Amazon',
    skinTypes: ['oily', 'combination'],
    concernTags: ['salicylic_acid', 'exfoliant', 'open_comedone'],
    description: 'Targets clogged pores and texture.',
  },
  {
    id: 'prod-3',
    name: 'Barrier Repair Moisturizer',
    brand: 'La Roche-Posay',
    category: 'Moisturizer',
    sponsored: true,
    price: 1299,
    rating: 4.8,
    offer: 'Flat Rs 150 wallet cashback',
    retailer: 'Tira',
    skinTypes: ['dry', 'sensitive', 'combination'],
    concernTags: ['avoid_oils', 'non_comedogenic'],
    description: 'Supports barrier repair without clogging pores.',
    proDiscountCode: 'PROCARE15',
  },
  {
    id: 'prod-4',
    name: 'Niacinamide Repair Drops',
    brand: 'The Ordinary',
    category: 'Serum',
    sponsored: false,
    price: 700,
    rating: 4.7,
    offer: '5% extra on prepaid orders',
    retailer: 'Sephora',
    skinTypes: ['oily', 'dry', 'combination'],
    concernTags: ['niacinamide', 'closed_comedone', 'open_comedone'],
    description: 'Balances oil and helps calm redness.',
  },
  {
    id: 'prod-5',
    name: 'Retinol Renewal Cream',
    brand: 'The Inkey List',
    category: 'Night Treatment',
    sponsored: false,
    price: 950,
    rating: 4.4,
    offer: 'Starter duo discount',
    retailer: 'Kindlife',
    skinTypes: ['oily', 'combination', 'dry'],
    concernTags: ['retinol', 'retinoid', 'closed_comedone'],
    description: 'Beginner-friendly retinol for texture and acne marks.',
  },
  {
    id: 'prod-6',
    name: 'Daily Mineral SPF 50',
    brand: 'Reequil',
    category: 'Sunscreen',
    sponsored: true,
    price: 620,
    rating: 4.7,
    offer: '12% combo savings',
    retailer: 'Flipkart',
    skinTypes: ['sensitive', 'oily', 'dry', 'combination'],
    concernTags: ['non_comedogenic'],
    description: 'Matte sunscreen for everyday acne-safe use.',
    proDiscountCode: 'DERMAPRO12',
  },
]

const REMEDY_LIBRARY: Record<string, HomeRemedy[]> = {
  cystic: [
    {
      id: 'remedy-cystic-1',
      title: 'Cooling green tea compress',
      bestFor: ['oily', 'sensitive', 'combination'],
      ingredients: ['1 green tea bag', '1 cup water', 'Clean cotton pads'],
      steps: [
        'Steep the green tea bag in hot water for 4 minutes.',
        'Cool it in the refrigerator until chilled.',
        'Soak cotton pads and place over inflamed areas for 5 to 7 minutes.',
      ],
      usage: 'Use once daily after cleansing and before moisturizer.',
      precautions: 'Do not rub aggressively on deep painful lesions. Stop if irritation increases.',
    },
    {
      id: 'remedy-cystic-2',
      title: 'Diluted aloe and oat calming mask',
      bestFor: ['dry', 'sensitive'],
      ingredients: ['1 tbsp aloe vera gel', '1 tsp oat flour', 'A few drops of water'],
      steps: [
        'Mix aloe gel and oat flour into a thin paste.',
        'Apply a light layer over irritated areas.',
        'Leave for 8 minutes and rinse with cool water.',
      ],
      usage: 'Use 2 times a week on non-broken skin.',
      precautions: 'Patch test first. Avoid if you are allergic to oats.',
    },
  ],
  open_comedone: [
    {
      id: 'remedy-open-1',
      title: 'Honey and yogurt balancing mask',
      bestFor: ['oily', 'combination'],
      ingredients: ['1 tsp plain yogurt', '1 tsp raw honey'],
      steps: [
        'Combine yogurt and honey in a small bowl.',
        'Apply a thin layer over areas with visible blackheads.',
        'Leave for 10 minutes, then rinse gently.',
      ],
      usage: 'Use once or twice weekly.',
      precautions: 'Avoid on freshly exfoliated skin.',
    },
  ],
  closed_comedone: [
    {
      id: 'remedy-closed-1',
      title: 'Rice water soothing rinse',
      bestFor: ['sensitive', 'combination', 'dry'],
      ingredients: ['2 tbsp uncooked rice', '1 cup water'],
      steps: [
        'Rinse the rice and soak it in water for 30 minutes.',
        'Strain the water into a clean bowl.',
        'Use the liquid as a final rinse after cleansing.',
      ],
      usage: 'Use up to 3 times weekly.',
      precautions: 'Store in the refrigerator for no more than 24 hours.',
    },
  ],
  default: [
    {
      id: 'remedy-default-1',
      title: 'Chamomile calming mist',
      bestFor: ['oily', 'dry', 'sensitive', 'combination'],
      ingredients: ['1 chamomile tea bag', '1/2 cup water', 'Spray bottle'],
      steps: [
        'Steep the tea bag in hot water for 5 minutes.',
        'Cool fully and pour into a clean spray bottle.',
        'Mist lightly onto clean skin.',
      ],
      usage: 'Use as needed for soothing support.',
      precautions: 'Avoid if you have ragweed allergies.',
    },
  ],
}

const DERMATOLOGISTS: DermatologistListing[] = [
  {
    id: 'derm-1',
    name: 'Dr. Aditi Mehra',
    clinic: 'Radiance Skin Centre',
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '+91 98765 11001',
    email: 'appointments@radianceskin.in',
    specialty: 'Acne and procedural dermatology',
  },
  {
    id: 'derm-2',
    name: 'Dr. Karan Sethi',
    clinic: 'City Derma Clinic',
    city: 'Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    phone: '+91 98765 11002',
    email: 'hello@cityderma.in',
    specialty: 'Acne scars and pigmentation',
  },
  {
    id: 'derm-3',
    name: 'Dr. Priya Raman',
    clinic: 'Skin Verse Hospital',
    city: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    phone: '+91 98765 11003',
    email: 'frontdesk@skinverse.in',
    specialty: 'Sensitive skin and adolescent acne',
  },
  {
    id: 'derm-4',
    name: 'Dr. Rohan Deshpande',
    clinic: 'ClearPath Dermatology',
    city: 'Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    phone: '+91 98765 11004',
    email: 'bookings@clearpathskin.in',
    specialty: 'Medical dermatology and acne management',
  },
]

function concernKey(acneType: AcneType) {
  if (!acneType) return 'no_acne_detected'
  return acneType
}

export function getRecommendedProducts(
  scan: ScanRecord | null,
  skinType: SkinType,
  ingredientBlacklist: string[],
) {
  const tags = new Set<string>(scan?.raw_scores.classifier ? [concernKey(scan.acne_type)] : [])
  if (scan?.acne_type) tags.add(scan.acne_type)
  scan?.routine
    .toLowerCase()
    .split(/[^a-z_]+/)
    .filter(Boolean)
    .forEach((token) => tags.add(token))

  const blocked = ingredientBlacklist.map((item) => item.toLowerCase())

  const all = PRODUCT_CATALOG.filter(
    (product) =>
      product.skinTypes.includes(skinType) &&
      product.concernTags.some((tag) => tags.has(tag) || tags.has(tag.replace(/_/g, ' '))) &&
      blocked.every((term) => !product.description.toLowerCase().includes(term) && !product.name.toLowerCase().includes(term)),
  )

  const fallback = PRODUCT_CATALOG.filter((product) => product.skinTypes.includes(skinType))
  const finalList = (all.length ? all : fallback).sort((a, b) => b.rating - a.rating)

  return {
    sponsored: finalList.filter((product) => product.sponsored),
    organic: finalList.filter((product) => !product.sponsored),
    all: finalList,
  }
}

export function getHomeRemedies(scan: ScanRecord | null, skinType: SkinType) {
  const key = scan?.acne_type ?? 'default'
  const source = REMEDY_LIBRARY[key] ?? REMEDY_LIBRARY.default
  return source.filter((remedy) => remedy.bestFor.includes(skinType))
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function haversineDistanceKm(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const earthRadius = 6371
  const latDelta = toRadians(latitudeB - latitudeA)
  const lonDelta = toRadians(longitudeB - longitudeA)
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(lonDelta / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

export function getNearbyDermatologists(latitude?: number, longitude?: number) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return DERMATOLOGISTS.map((doctor) => ({ ...doctor, distanceKm: null }))
  }

  return DERMATOLOGISTS.map((doctor) => ({
    ...doctor,
    distanceKm: haversineDistanceKm(latitude, longitude, doctor.latitude, doctor.longitude),
  })).sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER))
}
