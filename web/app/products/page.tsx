'use client'

import { Lock, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { ProductCards } from '@/components/product-cards'
import { usePatientData } from '@/components/use-patient-data'
import { getRecommendedProducts } from '@/lib/experience'
import type { SkinType } from '@/lib/types'

type SortBy = 'rating' | 'price-low' | 'price-high'
type SponsorFilter = 'all' | 'sponsored' | 'organic'

const SKIN_TYPES: SkinType[] = ['oily', 'dry', 'sensitive', 'combination']

export default function ProductsPage() {
  const { user, loading, latestScan, preferences, subscription } = usePatientData()
  const [sortBy, setSortBy] = useState<SortBy>('rating')
  const [skinType, setSkinType] = useState<SkinType | 'current'>('current')
  const [sponsorFilter, setSponsorFilter] = useState<SponsorFilter>('all')

  const productList = useMemo(() => {
    if (!preferences) return []
    const effectiveSkinType = skinType === 'current' ? preferences.skinType : skinType
    const base = getRecommendedProducts(latestScan, effectiveSkinType, preferences.ingredientBlacklist).all

    let list = base
    if (sponsorFilter === 'sponsored') list = list.filter((product) => product.sponsored)
    if (sponsorFilter === 'organic') list = list.filter((product) => !product.sponsored)

    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      return b.rating - a.rating
    })
  }, [skinType, sponsorFilter, latestScan, preferences, sortBy])

  if (loading || !user || !preferences || !subscription) {
    return (
      <main className="page-shell auth-shell">
        <div className="skeleton skeleton-title" style={{ width: '180px' }} />
      </main>
    )
  }

  return (
    <AppShell eyebrow="Shop smarter" title="Products">
      <section className="feature-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">Recommendations</div>
            <h2 className="section-title">Sponsored and organic picks</h2>
            <p className="muted-copy" style={{ maxWidth: '620px' }}>
              These product suggestions align with your latest scan, your skin type, and the ingredient blacklist saved in settings.
            </p>
          </div>
          {!subscription.canUseDiscountCodes ? (
            <span className="pro-badge"><Lock size={10} /> PRO codes locked</span>
          ) : (
            <span className="pro-badge" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
              <Sparkles size={10} /> Pro codes active
            </span>
          )}
        </div>

        <div className="toolbar-row">
          <label className="field-stack">
            <span className="field-label">Sort by</span>
            <select className="text-select" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
              <option value="rating">Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>

          <label className="field-stack">
            <span className="field-label">Skin type</span>
            <select className="text-select" value={skinType} onChange={(event) => setSkinType(event.target.value as SkinType | 'current')}>
              <option value="current">My skin type ({preferences.skinType})</option>
              {SKIN_TYPES.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span className="field-label">Category</span>
            <select className="text-select" value={sponsorFilter} onChange={(event) => setSponsorFilter(event.target.value as SponsorFilter)}>
              <option value="all">All products</option>
              <option value="sponsored">Sponsored only</option>
              <option value="organic">Organic only</option>
            </select>
          </label>
        </div>

        <ProductCards products={productList} canUseDiscountCodes={subscription.canUseDiscountCodes} />
      </section>
    </AppShell>
  )
}
