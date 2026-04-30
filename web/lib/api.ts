import { type AIProvider, type ScanResult, type SkinType } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://dermascan-api-production.up.railway.app'

export async function analyzeSkin(
  file: File,
  provider: AIProvider = 'groq',
  skinType: SkinType = 'combination',
): Promise<ScanResult> {
  const formData = new FormData()
  formData.append('file', file)

  const params = new URLSearchParams({
    ai_provider: provider,
    skin_type: skinType,
  })

  const res = await fetch(`${API_URL}/analyze?${params.toString()}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}
