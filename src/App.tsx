import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { AuthForm } from './components/auth/AuthForm'
import { Dashboard } from './components/Dashboard'
import { GeneratorShell } from './components/generator/GeneratorShell'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

// Debug: Check if environment variables are loaded
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'Missing',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'Missing',
})

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    console.log('Auth: Checking initial session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth: Initial session check:', session ? 'Session found' : 'No session')
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth: Auth state change:', event, session ? 'Session exists' : 'No session')
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    console.log('Auth: Auth success triggered, refreshing session...')
    // Force a session refresh to trigger the auth state change listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth: Session refreshed:', session ? 'Session found' : 'No session')
      setSession(session)
    })
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="card text-center">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Cargando CargaViva...</p>
            <small className="text-secondary mt-sm">
              Verificando sesión segura
            </small>
            {/* Debug info */}
            <div className="mt-md text-xs text-secondary">
              <p>Debug: App is loading...</p>
              <p>Environment: {import.meta.env.MODE}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="app-container">
        <div className="main-content">
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    )
  }

  return (
    <GeneratorShell>
      <Dashboard userRole="generator" onSignOut={() => supabase.auth.signOut()} />
    </GeneratorShell>
  )
}

export default App
