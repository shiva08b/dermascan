import { BadgeIndianRupee, Lock, Sparkles, Star, Tag } from 'lucide-react'
import type { ProductRecommendation } from '@/lib/types'

interface ProductCardsProps {
  products: ProductRecommendation[]
  canUseDiscountCodes: boolean
}

export function ProductCards({ products, canUseDiscountCodes }: ProductCardsProps) {
  if (!products.length) {
    return <div className="empty-state">No matching products yet for this scan profile.</div>
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article key={product.id} className={`product-card${product.sponsored ? ' sponsored' : ''}`}>
          <div className="product-card-top">
            <div className="stack" style={{ gap: '0.35rem' }}>
              <div className="pill-row" style={{ gap: '0.45rem' }}>
                <span className={`mini-badge${product.sponsored ? ' accent' : ''}`}>
                  {product.sponsored ? 'Sponsored' : 'Organic'}
                </span>
                <span className="mini-badge">{product.category}</span>
              </div>
              <div>
                <h3 className="product-title">{product.name}</h3>
                <div className="muted-copy product-subtitle">{product.brand} - {product.category}</div>
              </div>
            </div>

            <div className="product-rating-chip">
              <Star size={13} fill="currentColor" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-stat-grid">
            <div className="product-stat-card">
              <div className="meta-label">Price</div>
              <div className="product-price"><BadgeIndianRupee size={15} /> {product.price}</div>
            </div>
            <div className="product-stat-card">
              <div className="meta-label">Offer</div>
              <div className="product-offer"><Tag size={14} /> {product.offer}</div>
            </div>
          </div>

          <div className="product-footer-row">
            <div className="muted-copy">Available on <strong style={{ color: 'var(--text)' }}>{product.retailer}</strong></div>
            <div className="mini-lock-row" style={{ marginTop: 0 }}>
              <Sparkles size={13} />
              <span>{product.sponsored ? 'Featured pick' : 'Routine-safe pick'}</span>
            </div>
          </div>

          {product.proDiscountCode ? (
            <div className={`discount-card${canUseDiscountCodes ? '' : ' locked'}`}>
              <div className="discount-card-header">
                <div className="section-label" style={{ marginBottom: 0 }}>
                  {canUseDiscountCodes ? 'Pro discount code' : 'Pro perk'}
                </div>
                {!canUseDiscountCodes ? (
                  <span className="pro-badge"><Lock size={10} /> PRO</span>
                ) : null}
              </div>
              <div className="discount-card-code">
                {canUseDiscountCodes ? product.proDiscountCode : 'Upgrade to unlock'}
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
