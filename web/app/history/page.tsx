'use client'
/* eslint-disable @next/next/no-img-element */

import { Calendar, Filter, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { usePatientData } from '@/components/use-patient-data'
import { formatLongDate, getScanImageUrl } from '@/lib/app-data'
import { ACNE_LABELS, SEVERITY_COLORS, type ScanRecord } from '@/lib/types'

type SeverityFilter = 'all' | 'mild' | 'moderate' | 'severe'
type AcneFilter = 'all' | 'acne' | 'clear'

export default function HistoryPage() {
  const { user, loading, scans, assets } = usePatientData()
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [acneFilter, setAcneFilter] = useState<AcneFilter>('all')

  const filtered = useMemo(() => {
    let list = scans

    if (severityFilter !== 'all') {
      list = list.filter((s) => s.severity === severityFilter)
    }

    if (acneFilter === 'acne') {
      list = list.filter((s) => s.is_acne)
    } else if (acneFilter === 'clear') {
      list = list.filter((s) => !s.is_acne)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          (s.acne_type ?? '').toLowerCase().includes(q) ||
          (s.severity ?? '').toLowerCase().includes(q) ||
          (s.provider ?? '').toLowerCase().includes(q) ||
          s.routine.toLowerCase().includes(q),
      )
    }

    return list
  }, [scans, severityFilter, acneFilter, search])

  if (loading || !user) {
    return (
      <main className="page-shell auth-shell">
        <div className="stack" style={{ alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '200px' }} />
          <div className="skeleton skeleton-text" style={{ width: '160px' }} />
        </div>
      </main>
    )
  }

  return (
    <AppShell eyebrow="Your scans" title="History">
      {/* Toolbar */}
      <section className="toolbar-row" style={{ marginBottom: '1.2rem' }}>
        <label className="field-stack" style={{ flex: 1, minWidth: '200px' }}>
          <span className="field-label">
            <Search size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.3rem' }} />
            Search scans
          </span>
          <input
            className="text-input"
            placeholder="e.g. cystic, mild, gemini..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="field-stack">
          <span className="field-label">
            <Filter size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.3rem' }} />
            Severity
          </span>
          <select className="text-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}>
            <option value="all">All severities</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </label>

        <label className="field-stack">
          <span className="field-label">Detection</span>
          <select className="text-select" value={acneFilter} onChange={(e) => setAcneFilter(e.target.value as AcneFilter)}>
            <option value="all">All scans</option>
            <option value="acne">Acne detected</option>
            <option value="clear">Clear skin</option>
          </select>
        </label>
      </section>

      <div className="pill-row" style={{ marginBottom: '1rem' }}>
        <span className="pill">{scans.length} total scans</span>
        <span className="pill">{filtered.length} shown</span>
      </div>

      {filtered.length ? (
        <div className="history-grid">
          {filtered.map((scan, i) => (
            <HistoryCard key={scan.id} scan={scan} imageUrl={getScanImageUrl(scan, assets)} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {scans.length === 0
            ? 'No scans yet. Upload your first photo from the Scan page to start building your history.'
            : 'No scans match the current filters. Try adjusting your search or filter criteria.'}
        </div>
      )}
    </AppShell>
  )
}

function HistoryCard({ scan, imageUrl, index }: { scan: ScanRecord; imageUrl: string; index: number }) {
  const acneLabel = scan.is_acne ? ACNE_LABELS[scan.acne_type ?? 'null'] : 'No Acne Detected'
  const severityColor = SEVERITY_COLORS[scan.severity ?? 'null']

  return (
    <article className="scan-card elevated" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="scan-thumb">
        {imageUrl ? <img src={imageUrl} alt={acneLabel} /> : null}
      </div>

      <div className="history-meta-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.82rem' }}>
          <Calendar size={13} />
          {formatLongDate(scan.created_at)}
        </div>
        <span className="mini-badge">{scan.provider}</span>
      </div>

      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.45rem' }}>{acneLabel}</div>

      <div className="meta-grid" style={{ marginBottom: '0.6rem' }}>
        <div>
          <div className="meta-label">Severity</div>
          <div className="meta-value" style={{ color: severityColor, fontSize: '0.95rem' }}>
            {scan.severity ?? 'none'}
          </div>
        </div>
        <div>
          <div className="meta-label">Confidence</div>
          <div className="meta-value" style={{ fontSize: '0.95rem' }}>{(scan.confidence * 100).toFixed(1)}%</div>
        </div>
      </div>

      <p className="muted-copy clamp-three" style={{ fontSize: '0.84rem' }}>{scan.routine}</p>
    </article>
  )
}
