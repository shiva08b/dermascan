import { ScanResult, AIProvider } from '../../shared/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function analyzeSkin(
  file: File,
  provider: AIProvider = 'groq'
): Promise<ScanResult> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${API_URL}/analyze?ai_provider=${provider}`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}
