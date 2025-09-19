import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faLock, faBolt, faTruck } from '@fortawesome/free-solid-svg-icons'

interface LandingProps {
  onStartRegistration: () => void
  onStartLogin: () => void
}

export function Landing({ onStartRegistration, onStartLogin }: LandingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      // Trigger animations after component mounts
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [])

  const benefits = [
    { icon: faMapMarkerAlt, text: 'Seguimiento en tiempo real' },
    { icon: faLock, text: 'Envíos seguros' },
    { icon: faBolt, text: 'Conexión instantánea' }
  ]

  return (
    <div className="cv-container cv-flex cv-flex-col cv-items-center cv-justify-center cv-min-h-screen cv-p-lg">
      {/* Background Gradient */}
      <div className="cv-fixed cv-inset-0 cv-bg-gradient-to-br cv-from-primary-light cv-to-white cv--z-10" />

      {/* Main Content */}
      <div className="cv-relative cv-z-10 cv-text-center cv-max-w-2xl cv-w-full">
        {/* Logo Section */}
        <div className={`cv-mb-xl ${isVisible ? 'cv-animate-fade-in' : ''}`}>
          <div className="cv-text-6xl cv-text-primary cv-mb-md">
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <h1 className="cv-heading-1 cv-text-primary cv-mb-sm">CargaViva</h1>
          <p className="cv-text-xl cv-text-secondary">Conectando cargas con transportistas</p>
        </div>

        {/* Central Card */}
        <div className={`cv-card cv-card-elevated cv-mb-xl ${isVisible ? 'cv-animate-slide-up' : ''}`}>
          <div className="cv-p-xl">
            <h2 className="cv-heading-2 cv-text-primary cv-mb-md">
              Gestiona tus cargas de manera inteligente
            </h2>
            <p className="cv-text-lg cv-text-secondary cv-mb-lg">
              Conecta con transportistas verificados y sigue tus envíos en tiempo real
            </p>

            {/* CTA Buttons */}
            <div className="cv-flex cv-gap-md cv-justify-center">
              <button
                className="cv-btn cv-btn-primary cv-px-xl cv-py-md cv-text-lg"
                onClick={onStartRegistration}
                aria-label="Comenzar registro en CargaViva"
              >
                Comenzar
              </button>
              <button
                className="cv-btn cv-btn-secondary cv-px-xl cv-py-md cv-text-lg"
                onClick={onStartLogin}
                aria-label="Iniciar sesión en CargaViva"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={`cv-flex cv-gap-lg cv-justify-center cv-flex-wrap ${isVisible ? 'cv-animate-fade-in' : ''}`}>
          {benefits.map((benefit, index) => (
            <div key={index} className="cv-flex cv-items-center cv-gap-sm cv-bg-white cv-px-md cv-py-sm cv-rounded-full cv-shadow-sm cv-border cv-border-light-gray">
              <span className="cv-text-primary">
                <FontAwesomeIcon icon={benefit.icon} />
              </span>
              <span className="cv-text-sm cv-text-secondary cv-font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}