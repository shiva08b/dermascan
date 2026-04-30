import { supabase } from '@/lib/supabase'
import type {
  DermatologistSession,
  LinkedPatientSnapshot,
  PrescriptionNote,
  ScanRecord,
  ScanResult,
  SkinType,
} from '@/lib/types'

export type AppLanguage =
  | 'English'
  | 'Espanol'
  | 'Francais'
  | 'Hindi'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Marathi'
  | 'Gujarati'
  | 'Punjabi'

export interface AppPreferences {
  language: AppLanguage
  remindersEnabled: boolean
  reminderHour: number
  ingredientBlacklist: string[]
  plan: 'free' | 'pro'
  trialStartedAt: string
  skinType: SkinType
  patientCode: string
}

export interface LocalAssetMap {
  [scanId: string]: string
}

const MONTHLY_SCAN_LIMIT = 10
const TRIAL_DAYS = 30

export const DEFAULT_PREFERENCES: AppPreferences = {
  language: 'English',
  remindersEnabled: true,
  reminderHour: 8,
  ingredientBlacklist: ['Fragrance', 'Alcohol Denat'],
  plan: 'free',
  trialStartedAt: new Date().toISOString(),
  skinType: 'combination',
  patientCode: '',
}

function keyFor(userId: string, suffix: string) {
  return `dermascan.${suffix}.${userId}`
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function buildPatientCode(userId: string) {
  return `DS-${userId.slice(0, 8).toUpperCase()}`
}

export function severityToScore(severity: ScanRecord['severity']) {
  if (severity === 'severe') return 3
  if (severity === 'moderate') return 2
  if (severity === 'mild') return 1
  return 0
}

export function scoreToSeverity(score: number) {
  if (score === 3) return 'Severe'
  if (score === 2) return 'Moderate'
  if (score === 1) return 'Mild'
  return 'None'
}

export function loadPreferences(userId: string): AppPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES, patientCode: buildPatientCode(userId) }
  }

  const stored = safeParse<AppPreferences>(
    localStorage.getItem(keyFor(userId, 'preferences')),
    { ...DEFAULT_PREFERENCES, patientCode: buildPatientCode(userId) },
  )

  if (!stored.patientCode) {
    stored.patientCode = buildPatientCode(userId)
  }

  return stored
}

export function savePreferences(userId: string, preferences: AppPreferences) {
  if (typeof window === 'undefined') return
  localStorage.setItem(keyFor(userId, 'preferences'), JSON.stringify(preferences))
}

export function loadAssets(userId: string): LocalAssetMap {
  if (typeof window === 'undefined') return {}
  return safeParse<LocalAssetMap>(localStorage.getItem(keyFor(userId, 'assets')), {})
}

export function saveAsset(userId: string, scanId: string, imageDataUrl: string) {
  if (typeof window === 'undefined') return
  const current = loadAssets(userId)
  current[scanId] = imageDataUrl
  localStorage.setItem(keyFor(userId, 'assets'), JSON.stringify(current))
}

export function getScanImageUrl(scan: ScanRecord, assets: LocalAssetMap) {
  return scan.image_url || assets[scan.id] || ''
}

export function getCurrentMonthScans(scans: ScanRecord[]) {
  const current = new Date()
  return scans.filter((scan) => {
    const created = new Date(scan.created_at)
    return created.getMonth() === current.getMonth() && created.getFullYear() === current.getFullYear()
  })
}

export function getTrialEndsAt(preferences: AppPreferences) {
  const started = new Date(preferences.trialStartedAt)
  return new Date(started.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
}

export function getSubscriptionStatus(preferences: AppPreferences) {
  if (preferences.plan === 'pro') {
    return {
      tier: 'pro' as const,
      trialActive: false,
      isPaid: true,
      canUseDiscountCodes: true,
    }
  }

  const trialActive = Date.now() < getTrialEndsAt(preferences).getTime()
  return {
    tier: 'free' as const,
    trialActive,
    isPaid: false,
    canUseDiscountCodes: false,
  }
}

export function getScanAllowance(scans: ScanRecord[], preferences: AppPreferences) {
  const currentMonth = getCurrentMonthScans(scans)
  const subscription = getSubscriptionStatus(preferences)

  if (subscription.tier === 'pro' || subscription.trialActive) {
    return {
      unlimited: true,
      remaining: Infinity,
      used: currentMonth.length,
      limitLabel: 'Unlimited',
      locked: false,
    }
  }

  const remaining = Math.max(0, MONTHLY_SCAN_LIMIT - currentMonth.length)
  return {
    unlimited: false,
    remaining,
    used: currentMonth.length,
    limitLabel: `${MONTHLY_SCAN_LIMIT} / month`,
    locked: remaining <= 0,
  }
}

export async function fetchUserScans(userId: string) {
  const { data, error } = await supabase.from('scans').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ScanRecord[]
}

/**
 * Read a file as a base64 data URL using FileReader (simplest, most reliable approach).
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Shrink a base64 image to a tiny JPEG thumbnail via Canvas.
 * Only used when the raw base64 is too large for the DB.
 */
function shrinkImage(dataUrl: string, maxDim = 300, quality = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('no canvas')); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Prepare image for DB storage. Returns a base64 data URL that's
 * small enough to store in a text column (~100-200KB max).
 */
export async function prepareImageForStorage(file: File): Promise<string | null> {
  try {
    const raw = await fileToDataUrl(file)
    if (raw.length < 180_000) {
      return raw
    }

    const attempts: Array<{ maxDim: number; quality: number }> = [
      { maxDim: 640, quality: 0.72 },
      { maxDim: 420, quality: 0.56 },
      { maxDim: 320, quality: 0.44 },
      { maxDim: 240, quality: 0.35 },
    ]

    let best = raw
    for (const attempt of attempts) {
      const candidate = await shrinkImage(raw, attempt.maxDim, attempt.quality)
      if (candidate.length < best.length) {
        best = candidate
      }
      if (candidate.length < 180_000) {
        return candidate
      }
    }

    return best
  } catch (err) {
    console.error('[DermaScan] prepareImageForStorage FAILED:', err)
    return null
  }
}

/**
 * Insert a scan row. image_url is included in the INSERT itself
 * so we don't need a separate UPDATE (which RLS may block).
 */
export async function insertScan(userId: string, result: ScanResult, imageUrl?: string | null) {
  const payload = {
    user_id: userId,
    is_acne: result.is_acne,
    acne_type: result.acne_type,
    confidence: result.confidence,
    severity: result.severity,
    provider: result.skincare_routine.provider,
    routine: result.skincare_routine.routine,
    raw_scores: result.raw_scores,
    image_url: imageUrl ?? null,
  }

  const { data, error } = await supabase
    .from('scans')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    if (imageUrl) {
      const retry = await supabase
        .from('scans')
        .insert({ ...payload, image_url: null })
        .select('*')
        .single()

      if (retry.error) throw retry.error
      return retry.data as ScanRecord
    }

    throw error
  }

  return data as ScanRecord
}

/**
 * After a scan is inserted, optionally try to upgrade the image to
 * a Supabase Storage CDN URL (better performance than base64).
 * Falls back silently if Storage isn't configured.
 */
export async function uploadScanImage(userId: string, file: File) {
  try {
    const extension = file.name.split('.').pop() || 'jpg'
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`

    const upload = await supabase.storage.from('scan-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (upload.error) return null

    const { data } = supabase.storage.from('scan-images').getPublicUrl(path)
    const publicUrl = data.publicUrl

    // Try to update — may fail due to RLS, but that's OK because
    // the base64 image was already included in the INSERT
    return publicUrl
  } catch {
    return null
  }
}

export function getStreakDays(scans: ScanRecord[]) {
  if (!scans.length) return 0

  const uniqueDays = Array.from(
    new Set(
      scans.map((scan) => {
        const date = new Date(scan.created_at)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
      }),
    ),
  ).sort((a, b) => Number(new Date(b)) - Number(new Date(a)))

  let streak = 0
  let cursor = new Date()
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())

  for (const day of uniqueDays) {
    const current = new Date(day)
    const diff = Math.round((cursor.getTime() - current.getTime()) / 86400000)

    if (diff === 0 || (streak > 0 && diff === 1)) {
      streak += 1
      cursor = current
      continue
    }

    if (streak === 0 && diff === 1) {
      streak += 1
      cursor = current
      continue
    }

    break
  }

  return streak
}

export function getWeeklySummary(scans: ScanRecord[]) {
  const now = Date.now()
  const weeklyScans = scans.filter((scan) => now - new Date(scan.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000)
  const total = weeklyScans.length
  const acneHits = weeklyScans.filter((scan) => scan.is_acne).length
  const averageSeverity =
    total === 0 ? 0 : weeklyScans.reduce((sum, scan) => sum + severityToScore(scan.severity), 0) / total

  return {
    scans: weeklyScans,
    total,
    acneRate: total === 0 ? 0 : acneHits / total,
    averageSeverity,
  }
}

export function formatLongDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function buildComparisonSummary(current: ScanRecord, previous: ScanRecord) {
  const confidenceDelta = current.confidence - previous.confidence
  const severityDelta = severityToScore(current.severity) - severityToScore(previous.severity)

  return {
    confidenceDelta,
    severityDelta,
    status:
      severityDelta < 0 || (severityDelta === 0 && confidenceDelta < 0)
        ? 'Improving'
        : severityDelta > 0 || confidenceDelta > 0
          ? 'Needs attention'
          : 'Stable',
  }
}

function sharedSnapshotsKey() {
  return 'dermascan.shared.patientSnapshots'
}

function prescriptionKey() {
  return 'dermascan.shared.prescriptions'
}

function dermatologistSessionKey() {
  return 'dermascan.shared.dermatologistSession'
}

export function savePatientSnapshot(userId: string, email: string, scans: ScanRecord[], preferences: AppPreferences) {
  if (typeof window === 'undefined') return

  const current = safeParse<Record<string, LinkedPatientSnapshot>>(localStorage.getItem(sharedSnapshotsKey()), {})
  current[preferences.patientCode] = {
    patientCode: preferences.patientCode,
    userId,
    email,
    skinType: preferences.skinType,
    scans: scans.slice(0, 30),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(sharedSnapshotsKey(), JSON.stringify(current))
}

export function loadPatientSnapshot(patientCode: string) {
  if (typeof window === 'undefined') return null
  const current = safeParse<Record<string, LinkedPatientSnapshot>>(localStorage.getItem(sharedSnapshotsKey()), {})
  return current[patientCode] ?? null
}

export function loadDermatologistSession() {
  if (typeof window === 'undefined') return null
  return safeParse<DermatologistSession | null>(localStorage.getItem(dermatologistSessionKey()), null)
}

export function saveDermatologistSession(session: DermatologistSession) {
  if (typeof window === 'undefined') return
  localStorage.setItem(dermatologistSessionKey(), JSON.stringify(session))
}

export function clearDermatologistSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(dermatologistSessionKey())
}

export function loadPrescriptions(patientCode: string) {
  if (typeof window === 'undefined') return [] as PrescriptionNote[]
  const current = safeParse<Record<string, PrescriptionNote[]>>(localStorage.getItem(prescriptionKey()), {})
  return current[patientCode] ?? []
}

export function savePrescription(note: PrescriptionNote) {
  if (typeof window === 'undefined') return
  const current = safeParse<Record<string, PrescriptionNote[]>>(localStorage.getItem(prescriptionKey()), {})
  current[note.patientCode] = [note, ...(current[note.patientCode] ?? [])]
  localStorage.setItem(prescriptionKey(), JSON.stringify(current))
}
