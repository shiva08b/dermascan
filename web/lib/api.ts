import { type AIProvider, type HomeRemedy, type ProductRecommendation, type ScanResult, type SkinType, type VisionModel } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://dermascan-api-production.up.railway.app'

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

  const res = await fetch(`${API_URL}/analyze?${params.toString()}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}

export async function fetchAiProducts(
  acneType: string | null,
  severity: string | null,
  skinType: SkinType,
  tags: string[] = [],
  provider: AIProvider = 'gemini',
): Promise<{ sponsored: ProductRecommendation[]; organic: ProductRecommendation[]; all: ProductRecommendation[] }> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acne_type:   acneType   ?? 'unknown',
        severity:    severity   ?? 'mild',
        skin_type:   skinType,
        tags,
        ai_provider: provider,
      }),
    })
    if (!res.ok) throw new Error('Products fetch failed')
    return res.json()
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
    const res = await fetch(`${API_URL}/remedies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acne_type:   acneType ?? 'unknown',
        skin_type:   skinType,
        ai_provider: provider,
      }),
    })
    if (!res.ok) throw new Error('Remedies fetch failed')
    return res.json()
  } catch {
    return []
  }
}
