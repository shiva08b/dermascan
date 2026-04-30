'use client'

import { AppShell } from '@/components/app-shell'
import { ProgressChart } from '@/components/charts'
import { ScanCard } from '@/components/scan-card'
import { usePatientData } from '@/components/use-patient-data'

export default function ProgressPage() {
  const { user, loading, scans, assets } = usePatientData()
  const latest = scans[0]

  if (loading || !user) {
    return <main className="page-shell auth-shell">Loading history...</main>
  }

  return (
    <AppShell eyebrow="Your skin - history" title="Progress">
      <section className="progress-grid">
        <article className="card card-section progress-hero-card">
          <div className="section-heading-row">
            <div>
              <div className="section-label">Severity area - over time</div>
              <h2 className="section-title">Trajectory</h2>
            </div>
            <div className="pill-row">
              <span className="pill">{scans.length} total scans</span>
              <span className="pill">{latest ? new Date(latest.created_at).toLocaleDateString('en-IN') : 'No scans yet'}</span>
            </div>
          </div>
          <ProgressChart scans={scans} />
        </article>

        <section className="feature-section">
          <div className="section-heading-row">
            <div>
              <div className="section-label">Scan archive</div>
              <h2 className="section-title">Saved images and past analyses</h2>
            </div>
            <p className="muted-copy" style={{ maxWidth: '520px' }}>
              Every completed scan should now save its image preview, prediction summary, and timestamp so your progress remains visible after you sign back in.
            </p>
          </div>
          {scans.length ? (
            <div className="history-grid">
              {scans.map((scan) => (
                <ScanCard key={scan.id} scan={scan} imageUrl={scan.image_url || assets[scan.id]} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No scans yet. Once you analyze your first photo, this page becomes your history tracker.</div>
          )}
        </section>
      </section>
    </AppShell>
  )
}
