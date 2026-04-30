/* eslint-disable @next/next/no-img-element */

import { Calendar, Sparkles } from 'lucide-react'
import { formatLongDate } from '@/lib/app-data'
import { ACNE_LABELS, SEVERITY_COLORS, type ScanRecord } from '@/lib/types'

interface ScanCardProps {
  scan: ScanRecord
  imageUrl?: string
}

export function ScanCard({ scan, imageUrl }: ScanCardProps) {
  const acneLabel = scan.is_acne ? ACNE_LABELS[scan.acne_type ?? 'null'] : 'No acne detected'
  const severityColor = SEVERITY_COLORS[scan.severity ?? 'null']

  return (
    <article className="scan-card elevated">
      <div className="scan-thumb history-thumb">
        {imageUrl ? <img src={imageUrl} alt={acneLabel} /> : null}
        <div className="scan-thumb-overlay">
          <span className="mini-badge">{scan.provider}</span>
          <span className="mini-badge" style={{ color: severityColor, borderColor: severityColor }}>
            {scan.severity?.replace('_', ' ') ?? 'none'}
          </span>
        </div>
      </div>

      <div className="history-meta-top">
        <div className="history-date-row">
          <Calendar size={13} />
          <span>{formatLongDate(scan.created_at)}</span>
        </div>
        <div className="history-confidence-chip">
          <Sparkles size={13} />
          <span>{(scan.confidence * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="scan-card-title-row">
        <div>
          <div className="meta-label">Prediction</div>
          <div className="scan-card-title">{acneLabel}</div>
        </div>
      </div>

      <p className="muted-copy clamp-three" style={{ fontSize: '0.88rem' }}>
        {scan.routine}
      </p>
    </article>
  )
}
