import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Landing } from './Landing'

interface AuthFormProps {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<'generator' | 'transporter'>('generator')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState('')
  const [showLanding, setShowLanding] = useState(true)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Sending OTP to email:', email)

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        }
      })

      if (error) throw error

      setShowOtp(true)
    } catch (error: unknown) {
      console.error('OTP send error:', error)
      setError(error instanceof Error ? error.message : 'Error al enviar código OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Verifying OTP for email:', email)

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      // If signup, create user profile
      if (!isLogin && data.user) {
        console.log('Creating user profile for:', data.user.id)
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            role,
            name,
            email: email,
            phone: null,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }
        console.log('User profile created successfully')
      }

      console.log('Auth: OTP verification successful, calling onSuccess')
      onSuccess()
    } catch (error: unknown) {
      console.error('OTP verification error:', error)
      setError(error instanceof Error ? error.message : 'Error al verificar código')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowOtp(false)
    setOtp('')
    setError('')
  }

  const handleStartRegistration = () => {
    setShowLanding(false)
    setIsLogin(false)
    resetForm()
  }

  const handleStartLogin = () => {
    setShowLanding(false)
    setIsLogin(true)
    resetForm()
  }

  const handleBackToLanding = () => {
    setShowLanding(true)
    resetForm()
  }

  const isFormValid = () => {
    return email.includes('@') && email.includes('.')
  }

  // Show landing page for generator role
  if (showLanding) {
    return (
      <Landing
        onStartRegistration={handleStartRegistration}
        onStartLogin={handleStartLogin}
      />
    )
  }

  return (
    <div className="cv-card">
      <div className="cv-text-center cv-mb-lg">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        <p className="cv-text-secondary">
          {isLogin ? 'Ingresa tu información de contacto' : 'Regístrate en CargaViva'}
        </p>
      </div>


      {!showOtp ? (
        <form onSubmit={handleSendOtp}>
          {!isLogin && (
            <>
              <div className="cv-mb-md">
                <label htmlFor="role" className="cv-label">Tipo de usuario</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'generator' | 'transporter')}
                  className="cv-select"
                  required
                >
                  <option value="generator">Generador de carga</option>
                  <option value="transporter">Transportista</option>
                </select>
              </div>

              <div className="cv-mb-md">
                <label htmlFor="name" className="cv-label">Nombre completo</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cv-input"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            </>
          )}

          <div className="cv-mb-lg">
            <label htmlFor="email" className="cv-label">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cv-input"
              placeholder="tu@email.com"
              required
            />
            <small className="cv-text-muted">Recibirás un código de 6 dígitos en tu email</small>
          </div>

          {error && (
            <div className="cv-mb-md cv-text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="cv-btn cv-btn-primary"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <div className="cv-spinner" />
                Enviando código...
              </>
            ) : (
              'Enviar código por email'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="cv-text-center cv-mb-md">
            <p className="cv-text-secondary">
              Ingresa el código de 6 dígitos enviado a {email}
            </p>
          </div>

          <div className="cv-mb-lg">
            <label htmlFor="otp" className="cv-label">Código OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="cv-input"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="cv-mb-md cv-text-error">
              {error}
            </div>
          )}

          <div className="cv-mb-md">
            <button
              type="submit"
              className="cv-btn cv-btn-primary"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <div className="cv-spinner" />
                  Verificando...
                </>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </div>

          <button
            type="button"
            className="cv-btn cv-btn-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Cambiar email
          </button>
        </form>
      )}

      {!showOtp && (
        <div className="cv-text-center cv-mt-lg">
          <div className="cv-mb-md">
            <button
              type="button"
              className="cv-btn cv-btn-secondary"
              onClick={() => {
                setIsLogin(!isLogin)
                resetForm()
              }}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          <button
            type="button"
            className="cv-btn cv-btn-ghost"
            onClick={handleBackToLanding}
            disabled={loading}
          >
            ← Volver al inicio
          </button>
        </div>
      )}

      {showOtp && (
        <div className="cv-text-center cv-mt-lg">
          <button
            type="button"
            className="cv-btn cv-btn-ghost"
            onClick={handleBackToLanding}
            disabled={loading}
          >
            ← Volver al inicio
          </button>
        </div>
      )}
    </div>
  )
}