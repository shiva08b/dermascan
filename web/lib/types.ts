export type AcneType = 'cystic' | 'open_comedone' | 'closed_comedone' | null
export type Severity = 'mild' | 'moderate' | 'severe' | null
export type AIProvider =
  | 'gemini'
  | 'groq'
  | 'cohere'
  | 'huggingface'
  | 'openrouter'
  | 'combined'
  | 'consensus'

export type SkinType = 'oily' | 'dry' | 'sensitive' | 'combination'

export interface ScanResult {
  is_acne: boolean
  acne_type: AcneType
  confidence: number
  severity: Severity
  recommendation_tags: string[]
  raw_scores: {
    screener: number[]
    classifier?: number[]
  }
  skincare_routine: {
    provider: string
    routine: string
    status: 'success' | 'fallback' | 'error' | 'skipped'
  }
  product_recommendations?: {
    sponsored: ProductRecommendation[]
    organic: ProductRecommendation[]
    all: ProductRecommendation[]
  }
  home_remedies?: HomeRemedy[]
}

export interface ScanRecord {
  id: string
  user_id: string
  created_at: string
  is_acne: boolean
  acne_type: AcneType
  confidence: number
  severity: Severity
  provider: string
  routine: string
  image_url: string | null
  raw_scores: {
    screener: number[]
    classifier?: number[]
  }
}

export interface ProductRecommendation {
  id: string
  name: string
  brand: string
  category: string
  sponsored: boolean
  price: number
  rating: number
  offer: string
  retailer: string
  skinTypes: SkinType[]
  concernTags: string[]
  description: string
  proDiscountCode?: string
}

export interface HomeRemedy {
  id: string
  title: string
  bestFor: SkinType[]
  ingredients: string[]
  steps: string[]
  usage: string
  precautions: string
}

export interface DermatologistListing {
  id: string
  name: string
  clinic: string
  city: string
  latitude: number
  longitude: number
  phone: string
  email: string
  specialty: string
}

export interface LinkedPatientSnapshot {
  patientCode: string
  userId: string
  email: string
  skinType: SkinType
  scans: ScanRecord[]
  updatedAt: string
}

export interface PrescriptionNote {
  id: string
  dermatologistName: string
  patientCode: string
  createdAt: string
  recommendation: string
  prescription: string
}

export interface DermatologistSession {
  name: string
  clinic: string
  dermatologistId: string
  loggedInAt: string
}

export const SEVERITY_COLORS = {
  mild: '#8acb88',
  moderate: '#d6a15f',
  severe: '#d46a6a',
  null: '#6B6B7A',
} as const

export const ACNE_LABELS = {
  cystic: 'Cystic Acne',
  open_comedone: 'Open Comedone (Blackhead)',
  closed_comedone: 'Closed Comedone (Whitehead)',
  null: 'No Acne',
} as const

export const API_URL = 'https://dermascan-api-production.up.railway.app'
