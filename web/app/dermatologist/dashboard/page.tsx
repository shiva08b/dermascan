'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearDermatologistSession, loadDermatologistSession, loadPatientSnapshot, loadPrescriptions, savePrescription } from '@/lib/app-data'
import { MedicalDisclaimer } from '@/components/medical-disclaimer'

export default function DermatologistDashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState(() => loadDermatologistSession())
  const [patientCode, setPatientCode] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [prescription, setPrescription] = useState('')
  const [linkedCode, setLinkedCode] = useState('')

  useEffect(() => {
    if (!session) {
      router.replace('/dermatologist/login')
    }
  }, [router, session])

  if (!session) {
    return <main className="page-shell auth-shell">Loading dermatologist portal...</main>
  }

  const snapshot = linkedCode ? loadPatientSnapshot(linkedCode) : null
  const prescriptions = linkedCode ? loadPrescriptions(linkedCode) : []
  const latest = snapshot?.scans[0] ?? null
  const averageConfidence = snapshot?.scans.length
    ? snapshot.scans.reduce((sum, scan) => sum + scan.confidence, 0) / snapshot.scans.length
    : 0

  return (
    <main className="page-shell">
      <div className="derm-layout">
        <section className="card card-section">
          <div className="eyebrow">Dermatologist portal</div>
          <h1 className="display-title page-title" style={{ fontSize: '3.2rem' }}>Dashboard</h1>
          <p className="muted-copy">{session.name} - {session.clinic} - {session.dermatologistId}</p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <label className="field-stack">
              <span className="field-label">Patient unique ID</span>
              <input className="text-input" value={patientCode} onChange={(event) => setPatientCode(event.target.value.toUpperCase())} placeholder="DS-XXXXXXXX" />
            </label>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button type="button" className="button-primary" onClick={() => setLinkedCode(patientCode.trim())}>Link patient</button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  clearDermatologistSession()
                  setSession(null)
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </section>

        {snapshot ? (
          <>
            <section className="stats-grid" style={{ marginTop: '1rem' }}>
              <article className="card card-section">
                <div className="section-label">Patient</div>
                <div className="metric-value" style={{ fontSize: '1.8rem' }}>{snapshot.email}</div>
              </article>
              <article className="card card-section">
                <div className="section-label">Total scans</div>
                <div className="metric-value">{snapshot.scans.length}</div>
              </article>
              <article className="card card-section">
                <div className="section-label">Latest severity</div>
                <div className="metric-value">{latest?.severity ?? '-'}</div>
              </article>
              <article className="card card-section">
                <div className="section-label">Avg confidence</div>
                <div className="metric-value">{(averageConfidence * 100).toFixed(0)}%</div>
              </article>
            </section>

            <section className="dashboard-grid" style={{ marginTop: '1rem' }}>
              <article className="card card-section">
                <div className="section-label">Patient analytics</div>
                <h2 className="section-title">Linked progress</h2>
                <div className="stack">
                  {snapshot.scans.slice(0, 8).map((scan) => (
                    <div key={scan.id} className="report-row">
                      <div>{new Date(scan.created_at).toLocaleDateString('en-IN')}</div>
                      <div>{scan.acne_type ?? 'none'}</div>
                      <div>{scan.severity ?? '-'}</div>
                      <div>{(scan.confidence * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card card-section">
                <div className="section-label">Recommendations</div>
                <h2 className="section-title">Prescription upload</h2>
                <div className="stack">
                  <label className="field-stack">
                    <span className="field-label">Clinical recommendation</span>
                    <textarea className="text-area" value={recommendation} onChange={(event) => setRecommendation(event.target.value)} />
                  </label>
                  <label className="field-stack">
                    <span className="field-label">Prescription / notes</span>
                    <textarea className="text-area" value={prescription} onChange={(event) => setPrescription(event.target.value)} />
                  </label>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                      if (!linkedCode || !recommendation.trim() || !prescription.trim()) return
                      savePrescription({
                        id: `${linkedCode}-${Date.now()}`,
                        dermatologistName: session.name,
                        patientCode: linkedCode,
                        createdAt: new Date().toISOString(),
                        recommendation,
                        prescription,
                      })
                      setRecommendation('')
                      setPrescription('')
                    }}
                  >
                    Save prescription
                  </button>
                </div>
              </article>
            </section>

            <section className="feature-section">
              <div className="section-label">Prescription history</div>
              {prescriptions.length ? (
                <div className="remedy-grid">
                  {prescriptions.map((note) => (
                    <article key={note.id} className="card card-section">
                      <div className="section-label">{new Date(note.createdAt).toLocaleString('en-IN')}</div>
                      <h3 style={{ marginBottom: '0.6rem' }}>{note.dermatologistName}</h3>
                      <p className="muted-copy" style={{ marginBottom: '0.6rem' }}>{note.recommendation}</p>
                      <p>{note.prescription}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No prescriptions uploaded for this patient yet.</div>
              )}
            </section>
          </>
        ) : (
          <div className="banner info" style={{ marginTop: '1rem' }}>
            Enter a patient unique ID to link history, reports, and dermatologist notes.
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <MedicalDisclaimer />
        </div>
      </div>
    </main>
  )
}
