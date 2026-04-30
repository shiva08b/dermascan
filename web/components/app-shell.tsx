'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  Camera,
  Clock,
  FileText,
  LayoutGrid,
  Leaf,
  LogOut,
  MapPinned,
  Scale,
  Settings,
  ShoppingBag,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MedicalDisclaimer } from '@/components/medical-disclaimer'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/scan', label: 'New Scan', icon: Camera },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/progress', label: 'Progress', icon: Activity },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/remedies', label: 'Remedies', icon: Leaf },
  { href: '/compare', label: 'Compare', icon: Scale },
  { href: '/weekly-report', label: 'Weekly Report', icon: FileText },
  { href: '/dermatologists', label: 'Find Derms', icon: MapPinned },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface AppShellProps {
  eyebrow: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ eyebrow, title, action, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('Loading...')

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setEmail(data.user?.email ?? 'guest@dermascan.ai')
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? 'guest@dermascan.ai')
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="page-shell">
      <div className="dashboard-layout">
        <aside className="sidebar no-print">
          <div className="brand-mark">
            <Link href="/dashboard" className="brand-title">
              <span className="brand-spark">
                <Sparkles size={14} />
              </span>
              <span>DermaScan</span>
            </Link>
            <div className="brand-subtitle">AI Skin Clinic</div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`sidebar-link${pathname === href ? ' active' : ''}`}>
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link href="/dermatologist/login" className="sidebar-link" style={{ marginBottom: '0.75rem' }}>
              <Stethoscope size={14} />
              <span>Dermatologist Portal</span>
            </Link>
            <div className="sidebar-user-label">Signed in</div>
            <div className="sidebar-user-email">{email}</div>
            <button type="button" className="button-ghost" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="page-header">
            <div>
              <div className="eyebrow">{eyebrow}</div>
              <h1 className="display-title page-title">{title}</h1>
            </div>
            {action}
          </header>

          {children}
          <div style={{ marginTop: '1.5rem' }}>
            <MedicalDisclaimer />
          </div>
        </main>
      </div>
    </div>
  )
}
