import { Leaf, ShieldAlert } from 'lucide-react'
import type { HomeRemedy } from '@/lib/types'

interface RemedyCardsProps {
  remedies: HomeRemedy[]
}

const SKIN_TYPE_COLORS: Record<string, string> = {
  oily: '#6bc5e8',
  dry: '#e8a96b',
  sensitive: '#e86b8a',
  combination: '#8ae86b',
}

export function RemedyCards({ remedies }: RemedyCardsProps) {
  if (!remedies.length) {
    return <div className="empty-state">No targeted remedy is available for this skin type yet.</div>
  }

  return (
    <div className="remedy-grid">
      {remedies.map((remedy) => (
        <article key={remedy.id} className="card card-section remedy-card">
          <div className="remedy-card-top">
            <div>
              <div className="section-label">Home remedy</div>
              <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '0.45rem' }}>{remedy.title}</h3>
            </div>
            <div className="pill-row">
              {remedy.bestFor.map((type) => (
                <span
                  key={type}
                  className="mini-badge"
                  style={{
                    color: SKIN_TYPE_COLORS[type] ?? 'var(--muted)',
                    borderColor: SKIN_TYPE_COLORS[type] ?? 'var(--line)',
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          <div className="remedy-panel">
            <div className="meta-label">Ingredients</div>
            <div className="pill-row" style={{ marginTop: '0.45rem' }}>
              {remedy.ingredients.map((ingredient) => (
                <span key={ingredient} className="pill">
                  <Leaf size={12} />
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          <div className="remedy-panel">
            <div className="meta-label">Preparation</div>
            <ol className="ordered-list remedy-steps">
              {remedy.steps.map((step, index) => (
                <li key={step}>
                  <span className="analysis-step-index">{String(index + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="remedy-panel-grid">
            <div className="remedy-panel">
              <div className="meta-label">Usage</div>
              <p className="muted-copy" style={{ marginTop: '0.4rem' }}>{remedy.usage}</p>
            </div>
            <div className="remedy-panel warning">
              <div className="meta-label">Precautions</div>
              <p className="muted-copy remedy-warning-copy">
                <ShieldAlert size={14} />
                <span>{remedy.precautions}</span>
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
