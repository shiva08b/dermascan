'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UseAuthUserOptions {
  redirectTo?: string
  required?: boolean
}

export function useAuthUser(options: UseAuthUserOptions = {}) {
  const { redirectTo = '/auth/login', required = true } = options
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(required)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return

      if (!data.user && required) {
        router.replace(redirectTo)
        return
      }

      setUser(data.user)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (!session?.user && required) {
        router.replace(redirectTo)
        return
      }

      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [redirectTo, required, router])

  return { user, loading }
}
