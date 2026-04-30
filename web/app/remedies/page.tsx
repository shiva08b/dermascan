'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { RemedyCards } from '@/components/remedy-cards'
import { usePatientData } from '@/components/use-patient-data'
import { getHomeRemedies } from '@/lib/experience'
import type { SkinType } from '@/lib/types'

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'sensitive', 'combination']

export default function RemediesPage() {
  const { user, loading, latestScan, preferences } = usePatientData()
  const [skinTypeOverride, setSkinTypeOverride] = useState<SkinType | 'current'>('current')

  const effectiveSkinType = skinTypeOverride === 'current' ? (preferences?.skinType ?? 'combination') : skinTypeOverride
  const remedies = useMemo(() => getHomeRemedies(latestScan, effectiveSkinType), [latestScan, effectiveSkinType])

  if (loading || !user || !preferences) {
    return (
      <main className="page-shell auth-shell">
        <div className="skeleton skeleton-title" style={{ width: '180px' }} />
      </main>
    )
  }

  return (
    <AppShell eyebrow="Comfort care" title="Remedies">
      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">Home remedies</div>
            <h2 className="section-title">AI-guided suggestions by acne type</h2>
          </div>
          <label className="field-stack" style={{ minWidth: '180px' }}>
            <span className="field-label">Filter by skin type</span>
            <select className="text-select" value={skinTypeOverride} onChange={(event) => setSkinTypeOverride(event.target.value as SkinType | 'current')}>
              <option value="current">My skin type ({preferences.skinType})</option>
              {SKIN_TYPES.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="muted-copy" style={{ marginBottom: '1.2rem' }}>
          These are supportive home-care ideas, not a substitute for clinical treatment. Current filter:
          {' '}
          <strong style={{ color: 'var(--text)' }}>{effectiveSkinType}</strong>
          .
        </p>
        <RemedyCards remedies={remedies} />
      </section>
    </AppShell>
  )
}
