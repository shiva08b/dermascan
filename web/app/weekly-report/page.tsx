'use client'

import { FileDown, Lock } from 'lucide-react'
import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { usePatientData } from '@/components/use-patient-data'
import { formatLongDate, getWeeklySummary } from '@/lib/app-data'

export default function WeeklyReportPage() {
  const { user, loading, scans, subscription } = usePatientData()
  const summary = useMemo(() => getWeeklySummary(scans), [scans])

  if (loading || !user || !subscription) {
    return <main className="page-shell auth-shell">Loading weekly report...</main>
  }

  const locked = !subscription.trialActive && subscription.tier !== 'pro'

  return (
    <AppShell
      eyebrow="This week"
      title="Weekly Report"
      action={
        <button type="button" className="button-primary no-print" onClick={() => window.print()} disabled={locked}>
          {locked ? <Lock size={15} /> : <FileDown size={15} />}
          <span>{locked ? 'Pro feature' : 'Download PDF'}</span>
        </button>
      }
    >
      {locked ? (
        <div className="banner info" style={{ marginBottom: '1rem' }}>
          Weekly PDF export is a premium feature after the free trial. Upgrade to Pro for unlimited scans and printable reports.
        </div>
      ) : null}

      <section className="stack">
        <article className="card card-section no-print">
          <div className="section-label">What&apos;s inside</div>
          <h2 className="section-title">A printable, dermatologist-friendly summary</h2>
          <div className="stack muted-copy">
            <p>Total scans and acne hit-rate across the last 7 days</p>
            <p>Average severity score + personalized recommendation context</p>
            <p>Chronological log of every weekly scan with type, severity, confidence, and imaging history</p>
            <p>Subscription and plan status</p>
          </div>
        </article>

        <article className="card card-section">
          <div className="section-label">Weekly summary</div>
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div>
              <div className="metric-value">{summary.total}</div>
              <div className="metric-caption">scans in the last 7 days</div>
            </div>
            <div>
              <div className="metric-value">{(summary.acneRate * 100).toFixed(0)}%</div>
              <div className="metric-caption">acne hit rate</div>
            </div>
            <div>
              <div className="metric-value">{summary.averageSeverity.toFixed(1)}</div>
              <div className="metric-caption">average severity score</div>
            </div>
            <div>
              <div className="metric-value">{subscription.tier === 'pro' ? 'Pro' : subscription.trialActive ? 'Trial' : 'Free'}</div>
              <div className="metric-caption">subscription plan</div>
            </div>
          </div>
        </article>

        <article className="card card-section">
          <div className="section-label">Recent log</div>
          {summary.scans.length ? (
            <div className="list-table">
              {summary.scans.map((scan) => (
                <div key={scan.id} className="report-row">
                  <div>{formatLongDate(scan.created_at)}</div>
                  <div>{scan.acne_type ?? 'none'}</div>
                  <div>{scan.severity ?? '-'}</div>
                  <div>{(scan.confidence * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No scans in the last 7 days yet.</div>
          )}
        </article>
      </section>
    </AppShell>
  )
}
