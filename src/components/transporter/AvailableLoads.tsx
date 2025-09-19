import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faBox, faFileAlt } from '@fortawesome/free-solid-svg-icons'

type Carga = Database['public']['Tables']['cargas']['Row']

interface AvailableLoadsProps {
  onAcceptLoad?: (cargaId: string) => void
}

export function AvailableLoads({ onAcceptLoad }: AvailableLoadsProps) {
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'nearby' | 'urgent'>('all')

  useEffect(() => {
    fetchAvailableLoads()
  }, [filter])

  const fetchAvailableLoads = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('cargas')
        .select('*')
        .eq('estado', 'published')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter === 'urgent') {
        // Filter loads that need to be delivered within 24 hours
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        query = query.lt('fecha_requerida', tomorrow.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setCargas(data || [])
    } catch (error) {
      console.error('Error fetching available loads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptLoad = async (cargaId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create assignment
      const { error } = await supabase
        .from('asignaciones')
        .insert({
          carga_id: cargaId,
          transportista_id: user.id,
          estado: 'accepted'
        })

      if (error) throw error

      // Update carga status
      await supabase
        .from('cargas')
        .update({ estado: 'assigned' })
        .eq('id', cargaId)

      // Refresh loads
      fetchAvailableLoads()

      if (onAcceptLoad) {
        onAcceptLoad(cargaId)
      }

      alert('¡Carga aceptada exitosamente!')
    } catch (error: unknown) {
      console.error('Error accepting load:', error)
      const message = error instanceof Error ? error.message : 'Error desconocido'
      alert('Error al aceptar la carga: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="cv-card">
        <div className="cv-text-center">
          <div className="cv-spinner" />
          <p>Buscando cargas disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cv-space-y-lg">
      {/* Filters */}
      <div className="cv-card">
        <h2 className="cv-text-xl cv-font-semibold cv-mb-md"><FontAwesomeIcon icon={faSearch} /> Cargas Disponibles</h2>
        <div className="cv-flex cv-gap-sm cv-flex-wrap">
          <button
            className={`cv-btn ${filter === 'all' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`cv-btn ${filter === 'nearby' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
            onClick={() => setFilter('nearby')}
          >
            Cercanas
          </button>
          <button
            className={`cv-btn ${filter === 'urgent' ? 'cv-btn-primary' : 'cv-btn-secondary'}`}
            onClick={() => setFilter('urgent')}
          >
            Urgentes
          </button>
        </div>
      </div>

      {/* Loads List */}
      {cargas.length === 0 ? (
        <div className="cv-card cv-text-center">
          <div className="cv-py-xl">
            <p className="cv-text-lg cv-mb-md"><FontAwesomeIcon icon={faBox} /> No hay cargas disponibles</p>
            <p className="cv-text-secondary">
              Las nuevas cargas aparecerán aquí automáticamente
            </p>
          </div>
        </div>
      ) : (
        <div className="cv-grid cv-grid-cols-1 cv-lg:cv-grid-cols-2 cv-gap-lg">
          {cargas.map((carga) => (
            <div key={carga.id} className="cv-card">
              <div className="cv-flex cv-justify-between cv-items-start cv-mb-md">
                <div>
                  <h3 className="cv-font-semibold cv-text-lg">
                    {carga.origen} → {carga.destino}
                  </h3>
                  <p className="cv-text-secondary">{carga.tipo_mercancia}</p>
                </div>
                <span className="cv-bg-success cv-text-white cv-px-sm cv-py-xs cv-rounded cv-text-sm cv-font-medium">
                  Disponible
                </span>
              </div>

              <div className="cv-space-y-sm cv-mb-lg">
                <div className="cv-flex cv-justify-between">
                  <span className="cv-text-secondary">Peso:</span>
                  <span className="cv-font-medium">{carga.peso_kg} kg</span>
                </div>
                <div className="cv-flex cv-justify-between">
                  <span className="cv-text-secondary">Fecha requerida:</span>
                  <span className="cv-font-medium">
                    {new Date(carga.fecha_requerida).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {carga.dimensiones && (
                  <div className="cv-flex cv-justify-between">
                    <span className="cv-text-secondary">Dimensiones:</span>
                    <span className="cv-font-medium">
                      {carga.dimensiones.length_cm}x{carga.dimensiones.width_cm}x{carga.dimensiones.height_cm} cm
                    </span>
                  </div>
                )}
              </div>

              <div className="cv-flex cv-gap-sm">
                <button
                  className="cv-btn cv-btn-primary cv-flex-1"
                  onClick={() => handleAcceptLoad(carga.id)}
                >
                  ✅ Aceptar Carga
                </button>
                <button className="cv-btn cv-btn-secondary">
                  <FontAwesomeIcon icon={faFileAlt} /> Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}