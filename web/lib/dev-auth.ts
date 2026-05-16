export interface DevSessionUser {
  id: string
  email: string
}

const DEV_AUTH_KEY = 'dermascan.dev.auth'

function isLocalhost() {
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

export function canUseDevAuthFallback() {
  return isLocalhost()
}

export function getDevSessionUser(): DevSessionUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DEV_AUTH_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as DevSessionUser
  } catch {
    return null
  }
}

export function setDevSessionUser(email: string) {
  if (typeof window === 'undefined') return null

  const normalizedEmail = email.trim().toLowerCase() || 'demo@dermascan.ai'
  const user = {
    id: `dev-${normalizedEmail.replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`,
    email: normalizedEmail,
  }

  window.localStorage.setItem(DEV_AUTH_KEY, JSON.stringify(user))
  return user
}

export function clearDevSessionUser() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(DEV_AUTH_KEY)
}

export function isFetchFailure(error: unknown) {
  if (!(error instanceof Error)) return false
  return /failed to fetch/i.test(error.message) || /network/i.test(error.message)
}
