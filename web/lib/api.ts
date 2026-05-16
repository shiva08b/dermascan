import { type AIProvider, type HomeRemedy, type ProductRecommendation, type ScanResult, type SkinType, type VisionModel } from '@/lib/types'

const PROD_API_HOST = 'https://dermascan-api-production.up.railway.app'
const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL ?? PROD_API_HOST
const LOCAL_DEV_API_HOST = process.env.NEXT_PUBLIC_LOCAL_API_URL
const isLocalBrowser = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

function getApiHosts() {
  if (isLocalBrowser && LOCAL_DEV_API_HOST) {
    return [LOCAL_DEV_API_HOST, CONFIGURED_API_URL]
  }

  return [CONFIGURED_API_URL]
}

async function postAiRequest<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const hosts = getApiHosts()

  const requestInit: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }

  let lastError: unknown = null

  for (const host of hosts) {
    const url = new URL(path, host).toString()

    try {
      const res = await fetch(url, requestInit)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`AI request failed ${res.status} ${res.statusText}: ${text}`)
      }
      return res.json()
    } catch (error) {
      console.error('[DermaScan] AI request failed:', url, error)
      lastError = error
    }
  }

  throw lastError ?? new Error('[DermaScan] AI request failed: no available backend')
}

type ApiProductRecommendation = ProductRecommendation & {
  skin_types?: ProductRecommendation['skinTypes']
  concern_tags?: ProductRecommendation['concernTags']
  pro_discount_code?: string
}

type ApiHomeRemedy = HomeRemedy & {
  best_for?: HomeRemedy['bestFor']
}

function normalizeProduct(product: ApiProductRecommendation): ProductRecommendation {
  return {
    ...product,
    skinTypes: product.skinTypes ?? product.skin_types ?? [],
    concernTags: product.concernTags ?? product.concern_tags ?? [],
    proDiscountCode: product.proDiscountCode ?? product.pro_discount_code,
  }
}

function normalizeRemedy(remedy: ApiHomeRemedy): HomeRemedy {
  return {
    ...remedy,
    bestFor: remedy.bestFor ?? remedy.best_for ?? [],
  }
}

export async function analyzeSkin(
  file: File,
  provider: AIProvider = 'groq',
  skinType: SkinType = 'combination',
  visionModel: VisionModel = 'efficientnet',
): Promise<ScanResult> {
  const formData = new FormData()
  formData.append('file', file)

  const params = new URLSearchParams({
    ai_provider:  provider,
    skin_type:    skinType,
    vision_model: visionModel,
  })

  const hosts = getApiHosts()

  let lastError: unknown = null

  for (const host of hosts) {
    const analyzeUrl = new URL(`/analyze?${params.toString()}`, host).toString()

    try {
      const res = await fetch(analyzeUrl, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Analysis failed ${res.status} ${res.statusText}: ${text}`)
      }
      return res.json()
    } catch (error) {
      console.error('[DermaScan] Analysis request failed:', analyzeUrl, error)
      lastError = error
    }
  }

  throw lastError ?? new Error('[DermaScan] Analysis request failed: no available backend')
}

export async function fetchAiProducts(
  acneType: string | null,
  severity: string | null,
  skinType: SkinType,
  tags: string[] = [],
  provider: AIProvider = 'gemini',
): Promise<{ sponsored: ProductRecommendation[]; organic: ProductRecommendation[]; all: ProductRecommendation[] }> {
  try {
    const response = await postAiRequest<{
      sponsored: ApiProductRecommendation[]
      organic: ApiProductRecommendation[]
      all: ApiProductRecommendation[]
    }>('/products', {
      acne_type:   acneType   ?? 'unknown',
      severity:    severity   ?? 'mild',
      skin_type:   skinType,
      tags,
      ai_provider: provider,
    })

    return {
      sponsored: response.sponsored.map(normalizeProduct),
      organic: response.organic.map(normalizeProduct),
      all: response.all.map(normalizeProduct),
    }
  } catch {
    return { sponsored: [], organic: [], all: [] }
  }
}

export async function fetchAiRemedies(
  acneType: string | null,
  skinType: SkinType,
  provider: AIProvider = 'gemini',
): Promise<HomeRemedy[]> {
  try {
    const response = await postAiRequest<ApiHomeRemedy[]>('/remedies', {
      acne_type:   acneType ?? 'unknown',
      skin_type:   skinType,
      ai_provider: provider,
    })
    return response.map(normalizeRemedy)
  } catch {
    return []
  }
}
