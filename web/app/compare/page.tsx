'use client'
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { usePatientData } from '@/components/use-patient-data'
import { buildComparisonSummary, formatLongDate, getScanImageUrl } from '@/lib/app-data'
import { ACNE_LABELS } from '@/lib/types'

export default function ComparePage() {
  const { user, loading, scans, assets, subscription } = usePatientData()
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')

  const normalizedLeftId = leftId || scans[1]?.id || scans[0]?.id || ''
  const normalizedRightId = rightId || scans[0]?.id || ''

  const leftScan = scans.find((scan) => scan.id === normalizedLeftId)
  const rightScan = scans.find((scan) => scan.id === normalizedRightId)

  const summary = useMemo(() => {
    if (!leftScan || !rightScan) return null
    return buildComparisonSummary(rightScan, leftScan)
  }, [leftScan, rightScan])

  if (loading || !user || !subscription) {
    return <main className="page-shell auth-shell">Loading comparison...</main>
  }

  return (
    <AppShell eyebrow="Before / after" title="Compare">
      {scans.length < 2 ? (
        <div className="banner info">You need at least 2 scans to compare. Take another one in the Scan tab.</div>
      ) : (
        <section className="stack">
          <div className="two-col">
            <label className="field-stack">
              <span className="field-label">Earlier scan</span>
              <select className="text-select" value={normalizedLeftId} onChange={(event) => setLeftId(event.target.value)}>
                {scans.map((scan) => (
                  <option key={scan.id} value={scan.id}>
                    {formatLongDate(scan.created_at)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-stack">
              <span className="field-label">Later scan</span>
              <select className="text-select" value={normalizedRightId} onChange={(event) => setRightId(event.target.value)}>
                {scans.map((scan) => (
                  <option key={scan.id} value={scan.id}>
                    {formatLongDate(scan.created_at)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {summary ? (
            <div className="card card-section">
              <div className="section-label">Trend</div>
              <h2 className="section-title" style={{ marginBottom: '0.7rem' }}>{summary.status}</h2>
              <p className="muted-copy">
                Confidence delta: {(summary.confidenceDelta * 100).toFixed(1)} points. Severity delta: {summary.severityDelta}.
              </p>
            </div>
          ) : null}

          <div className="two-col">
            {[leftScan, rightScan].map((scan, index) =>
              scan ? (
                <article key={scan.id} className="card card-section">
                  <div className="section-label">{index === 0 ? 'Earlier' : 'Later'}</div>
                  <div className="scan-thumb">{getScanImageUrl(scan, assets) ? <img src={getScanImageUrl(scan, assets)} alt="Scan to compare" /> : null}</div>
                  <div className="stack">
                    <div>
                      <div className="meta-label">Date</div>
                      <div className="meta-value">{formatLongDate(scan.created_at)}</div>
                    </div>
                    <div>
                      <div className="meta-label">Acne</div>
                      <div className="meta-value">{scan.is_acne ? ACNE_LABELS[scan.acne_type ?? 'null'] : 'No acne detected'}</div>
                    </div>
                    <div>
                      <div className="meta-label">Severity</div>
                      <div className="meta-value">{scan.severity ?? 'none'}</div>
                    </div>
                    <div>
                      <div className="meta-label">Confidence</div>
                      <div className="meta-value">{(scan.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </article>
              ) : null,
            )}
          </div>
        </section>
      )}
    </AppShell>
  )
}
