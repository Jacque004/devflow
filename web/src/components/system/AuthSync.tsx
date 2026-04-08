import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'

export function AuthSync() {
  const setUser = useAuthStore((s) => s.setUser)
  const setInitialized = useAuthStore((s) => s.setInitialized)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setInitialized(true)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setInitialized])

  return null
}
