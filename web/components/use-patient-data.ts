'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuthUser } from '@/components/use-auth-user'
import {
  fetchUserScans,
  getScanAllowance,
  getSubscriptionStatus,
  loadAssets,
  loadPreferences,
  savePatientSnapshot,
} from '@/lib/app-data'
import type { ScanRecord } from '@/lib/types'

export function usePatientData() {
  const { user, loading } = useAuthUser()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const preferences = useMemo(() => (user ? loadPreferences(user.id) : null), [user])
  const assets = useMemo(() => (user ? loadAssets(user.id) : {}), [user])

  useEffect(() => {
    if (!user || !preferences) return

    fetchUserScans(user.id)
      .then((rows) => {
        setScans(rows)
        savePatientSnapshot(user.id, user.email ?? 'unknown@dermascan.ai', rows, preferences)
      })
      .catch(() => setScans([]))
  }, [preferences, user])

  const latestScan = scans[0] ?? null
  const subscription = useMemo(
    () => (preferences ? getSubscriptionStatus(preferences) : null),
    [preferences],
  )
  const allowance = useMemo(
    () => (preferences ? getScanAllowance(scans, preferences) : null),
    [preferences, scans],
  )

  return {
    user,
    loading,
    scans,
    latestScan,
    preferences,
    assets,
    subscription,
    allowance,
  }
}
