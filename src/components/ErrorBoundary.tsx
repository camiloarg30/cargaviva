import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cv-container cv-flex cv-items-center cv-justify-center cv-min-h-screen">
          <div className="cv-card cv-text-center">
            <h2 className="cv-text-error cv-mb-md">¡Oops! Algo salió mal</h2>
            <p className="cv-text-secondary cv-mb-lg">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              className="cv-btn cv-btn-primary"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="cv-mt-lg cv-text-left">
                <summary className="cv-cursor-pointer cv-text-secondary">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="cv-mt-sm cv-text-xs cv-bg-white cv-p-md cv-rounded cv-overflow-auto cv-border">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}