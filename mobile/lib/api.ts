import { ScanResult, AIProvider } from './types'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export async function analyzeSkin(
  uri: string,
  provider: AIProvider = 'groq'
): Promise<ScanResult> {
  const formData = new FormData()
  formData.append('file', {
    uri,
    name: 'skin.jpg',
    type: 'image/jpeg',
  } as any)

  const res = await fetch(
    `${API_URL}/analyze?ai_provider=${provider}`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}