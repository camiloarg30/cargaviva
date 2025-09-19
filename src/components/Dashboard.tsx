 import { useState, useEffect, useRef } from 'react'
 import { supabase } from '../lib/supabase'
 import type { Database } from '../lib/supabase'
 import { AvailableLoads } from './transporter/AvailableLoads'
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
 import {
   faBox,
   faTruck,
   faChartBar,
   faFileAlt,
   faBell,
   faSearch,
   faSignOutAlt,
   faCog,
   faPlus,
   faBolt,
   faHistory
 } from '@fortawesome/free-solid-svg-icons'

type User = Database['public']['Tables']['users']['Row']
type Carga = Database['public']['Tables']['cargas']['Row']

type NavigationSection =
  | 'dashboard'
  | 'loads'
  | 'publish'
  | 'available'
  | 'assignments'
  | 'documents'
  | 'notifications'
  | 'settings'

interface DashboardProps {
  userRole: 'generator' | 'transporter'
  onSignOut: () => void
}

export function Dashboard({ userRole, onSignOut }: DashboardProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLElement>(null)

    const [user, setUser] = useState<User | null>(null)
    const [cargas, setCargas] = useState<Carga[]>([])
    const [loading, setLoading] = useState(true)
    const [showPublishForm, setShowPublishForm] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard')

  useEffect(() => {
    fetchUserProfile()
    fetchCargas()
  }, [])


  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          // If user profile doesn't exist, create a default one
          if (error.code === 'PGRST116') {
            console.log('User profile not found, creating default...')
            await createDefaultUserProfile(user.id)
          }
        } else {
          setUser(data)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const createDefaultUserProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          role: 'generator', // Default role
          name: user.email?.split('@')[0] || 'Usuario',
          email: user.email,
          phone: null,
        })

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        console.log('Default user profile created')
        // Refetch the profile after creation
        fetchUserProfile()
      }
    } catch (error) {
      console.error('Error in createDefaultUserProfile:', error)
    }
  }

  const fetchCargas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('cargas').select('*')

      if (userRole === 'generator') {
        query = query.eq('generador_id', user.id)
      } else {
        // For transporters, get assigned cargas
        const { data: asignaciones } = await supabase
          .from('asignaciones')
          .select('carga_id')
          .eq('transportista_id', user.id)

        if (asignaciones && asignaciones.length > 0) {
          const cargaIds = asignaciones.map(a => a.carga_id)
          query = query.in('id', cargaIds)
        } else {
          setCargas([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setCargas(data || [])
    } catch (error) {
      console.error('Error fetching cargas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="cv-main">
        <div className="cv-card cv-text-center">
          <div className="cv-spinner" />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cv-container" ref={containerRef}>
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="cv-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`cv-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="cv-sidebar-header">
          <div className="cv-logo">
            <h2 className="cv-logo-text">CargaViva</h2>
            <span className="cv-role-badge">
              {userRole === 'generator' ? <><FontAwesomeIcon icon={faBox} /> Generador</> : <><FontAwesomeIcon icon={faTruck} /> Transportista</>}
            </span>
          </div>
        </div>

        <nav className="cv-sidebar-nav">
          <div
            className={`cv-nav-item ${currentSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setSidebarOpen(false)
              setCurrentSection('dashboard')
            }}
          >
            <FontAwesomeIcon icon={faChartBar} className="cv-nav-icon" />
            <span className="cv-nav-text">Dashboard</span>
          </div>
          {userRole === 'generator' ? (
            <>
              <div
                className={`cv-nav-item ${currentSection === 'loads' ? 'active' : ''}`}
                onClick={() => {
                  setSidebarOpen(false)
                  setCurrentSection('loads')
                }}
              >
                <FontAwesomeIcon icon={faBox} className="cv-nav-icon" />
                <span className="cv-nav-text">Mis Cargas</span>
              </div>
              <div
                className={`cv-nav-item ${currentSection === 'publish' ? 'active' : ''}`}
                onClick={() => {
                  setSidebarOpen(false)
                  setCurrentSection('publish')
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="cv-nav-icon" />
                <span className="cv-nav-text">Publicar Carga</span>
              </div>
            </>
          ) : (
            <>
              <div
                className={`cv-nav-item ${currentSection === 'available' ? 'active' : ''}`}
                onClick={() => {
                  setSidebarOpen(false)
                  setCurrentSection('available')
                }}
              >
                <FontAwesomeIcon icon={faSearch} className="cv-nav-icon" />
                <span className="cv-nav-text">Cargas Disponibles</span>
              </div>
              <div
                className={`cv-nav-item ${currentSection === 'assignments' ? 'active' : ''}`}
                onClick={() => {
                  setSidebarOpen(false)
                  setCurrentSection('assignments')
                }}
              >
                <FontAwesomeIcon icon={faTruck} className="cv-nav-icon" />
                <span className="cv-nav-text">Mis Asignaciones</span>
              </div>
            </>
          )}
          <div
            className={`cv-nav-item ${currentSection === 'documents' ? 'active' : ''}`}
            onClick={() => {
              setSidebarOpen(false)
              setCurrentSection('documents')
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} className="cv-nav-icon" />
            <span className="cv-nav-text">Documentos</span>
          </div>
          <div
            className={`cv-nav-item ${currentSection === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              setSidebarOpen(false)
              setCurrentSection('notifications')
            }}
          >
            <FontAwesomeIcon icon={faBell} className="cv-nav-icon" />
            <span className="cv-nav-text">Notificaciones</span>
          </div>
          <div
            className={`cv-nav-item ${currentSection === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setSidebarOpen(false)
              setCurrentSection('settings')
            }}
          >
            <FontAwesomeIcon icon={faCog} className="cv-nav-icon" />
            <span className="cv-nav-text">Configuración</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Usuario'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="btn-logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="cv-main" ref={mainRef}>
        {/* Header */}
        <header className="cv-header">
          <div className="cv-header-content">
            <button
              className="cv-hamburger-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 className="cv-page-title">
              {userRole === 'generator' ? 'Panel de Generador' : 'Panel de Transportista'}
            </h1>
            <div className="cv-header-actions">
              <button className="cv-btn-notification">
                <FontAwesomeIcon icon={faBell} className="cv-notification-icon" />
                <span className="cv-notification-badge">3</span>
              </button>
              <div className="cv-user-menu">
                <div className="cv-user-avatar-small">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Dynamic Content Based on Current Section */}
      {currentSection === 'dashboard' && (
        <>
          {/* Publish Form - Only for generators */}
          {userRole === 'generator' && showPublishForm && (
            <PublishLoadForm
              onClose={() => setShowPublishForm(false)}
              onSuccess={() => {
                setShowPublishForm(false)
                fetchCargas()
              }}
            />
          )}

          {/* Hero Welcome Card */}
          <div className="cv-hero-card cv-w-full cv-mb-xl">
            <div className="cv-flex cv-items-center cv-justify-between">
              <div>
                <h1 className="cv-text-3xl cv-font-bold cv-mb-sm">
                  ¡Bienvenido a CargaViva! 🎉
                </h1>
                <p className="cv-text-lg cv-opacity-90">
                  {userRole === 'generator'
                    ? 'Gestiona tus cargas de manera eficiente y segura'
                    : 'Encuentra las mejores oportunidades de transporte'
                  }
                </p>
              </div>
              <div className="cv-text-6xl">
                {userRole === 'generator' ? '📦' : '🚛'}
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="cv-grid cv-grid-cols-1 cv-md:cv-grid-cols-2 cv-lg:cv-grid-cols-3 cv-gap-xl cv-w-full">
            {/* Quick Actions */}
            <div className="cv-card cv-w-full">
              <h2 className="cv-card-title">
                <FontAwesomeIcon icon={faBolt} className="cv-mr-sm" />
                Acciones rápidas
              </h2>
              {userRole === 'generator' ? (
                <div className="cv-space-y-md">
                  <button
                    className="cv-btn cv-btn-primary cv-w-full"
                    onClick={() => setShowPublishForm(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Publicar nueva carga
                  </button>
                  <button
                    className="cv-btn cv-btn-secondary cv-w-full"
                    onClick={() => setCurrentSection('loads')}
                  >
                    <FontAwesomeIcon icon={faFileAlt} /> Ver cargas activas ({cargas.filter(c => c.estado === 'published').length})
                  </button>
                </div>
              ) : (
                <div className="cv-space-y-md">
                  <button
                    className="cv-btn cv-btn-primary cv-w-full"
                    onClick={() => setCurrentSection('available')}
                  >
                    <FontAwesomeIcon icon={faSearch} /> Ver cargas disponibles
                  </button>
                  <button
                    className="cv-btn cv-btn-secondary cv-w-full"
                    onClick={() => setCurrentSection('assignments')}
                  >
                    <FontAwesomeIcon icon={faTruck} /> Mis asignaciones ({cargas.length})
                  </button>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="cv-stats-card-1 cv-card cv-w-full">
              <div className="cv-text-center">
                <div className="cv-text-5xl cv-font-bold cv-text-primary cv-mb-sm">
                  {cargas.length}
                </div>
                <h3 className="cv-text-lg cv-font-semibold cv-text-primary cv-mb-sm">
                  Cargas Totales
                </h3>
                <p className="cv-text-sm cv-text-secondary">
                  Gestionadas en la plataforma
                </p>
              </div>
            </div>

            <div className="cv-stats-card-2 cv-card cv-w-full">
              <div className="cv-text-center">
                <div className="cv-text-5xl cv-font-bold cv-text-primary cv-mb-sm">
                  {cargas.filter(c => c.estado === 'assigned' || c.estado === 'in_transit').length}
                </div>
                <h3 className="cv-text-lg cv-font-semibold cv-text-primary cv-mb-sm">
                  En Proceso
                </h3>
                <p className="cv-text-sm cv-text-secondary">
                  Cargas activas actualmente
                </p>
              </div>
            </div>

            <div className="cv-stats-card-3 cv-card cv-w-full">
              <div className="cv-text-center">
                <div className="cv-text-5xl cv-font-bold cv-text-primary cv-mb-sm">
                  {cargas.filter(c => c.estado === 'delivered').length}
                </div>
                <h3 className="cv-text-lg cv-font-semibold cv-text-primary cv-mb-sm">
                  Completadas
                </h3>
                <p className="cv-text-sm cv-text-secondary">
                  Cargas entregadas exitosamente
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="cv-card cv-w-full cv-lg:cv-col-span-3">
              <h2 className="cv-card-title">
                <FontAwesomeIcon icon={faHistory} className="cv-mr-sm" />
                Actividad Reciente
              </h2>
              {cargas.length > 0 ? (
                <div className="cv-grid cv-grid-cols-1 cv-md:cv-grid-cols-2 cv-lg:cv-grid-cols-3 cv-gap-md">
                  {cargas.slice(0, 6).map((carga) => (
                    <div key={carga.id} className="cv-p-md cv-border cv-border-subtle cv-rounded-lg cv-bg-off-white">
                      <div className="cv-flex cv-justify-between cv-items-start cv-mb-sm">
                        <div className="cv-flex-1">
                          <p className="cv-font-semibold cv-text-sm cv-text-primary cv-mb-xs">
                            {carga.origen} → {carga.destino}
                          </p>
                          <p className="cv-text-xs cv-text-secondary">
                            {carga.tipo_mercancia} • {carga.peso_kg}kg
                          </p>
                        </div>
                        <span className={`cv-text-xs cv-px-sm cv-py-xs cv-rounded-full cv-font-medium ${
                          carga.estado === 'published' ? 'cv-status-pending' :
                          carga.estado === 'assigned' ? 'cv-status-completed' :
                          carga.estado === 'delivered' ? 'cv-status-completed' :
                          'cv-bg-medium-gray cv-text-white'
                        }`}>
                          {carga.estado === 'published' ? 'Publicado' :
                           carga.estado === 'assigned' ? 'Asignado' :
                           carga.estado === 'delivered' ? 'Entregado' : carga.estado}
                        </span>
                      </div>
                      <div className="cv-text-xs cv-text-muted">
                        {new Date(carga.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cv-text-center cv-py-xl">
                  <div className="cv-text-4xl cv-mb-md">📦</div>
                  <h3 className="cv-text-lg cv-font-semibold cv-text-primary cv-mb-sm">
                    No hay actividad reciente
                  </h3>
                  <p className="cv-text-secondary">
                    {userRole === 'generator'
                      ? 'Publica tu primera carga para comenzar'
                      : 'Acepta cargas disponibles para empezar'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cargas List */}
          {cargas.length > 0 && (
            <div className="card mt-lg">
              <h2 className="text-xl font-semibold mb-md">
                {userRole === 'generator' ? <><FontAwesomeIcon icon={faBox} /> Mis Cargas</> : <><FontAwesomeIcon icon={faTruck} /> Mis Asignaciones</>}
              </h2>
              <div className="space-y-md">
                {cargas.map((carga) => (
                  <div key={carga.id} className="border border-gray-200 rounded-lg p-md">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <h3 className="font-semibold">
                          {carga.origen} → {carga.destino}
                        </h3>
                        <p className="text-sm text-secondary">
                          {carga.tipo_mercancia} • {carga.peso_kg}kg
                        </p>
                        <p className="text-xs text-secondary">
                          Creado: {new Date(carga.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        carga.estado === 'published' ? 'bg-blue-100 text-blue-800' :
                        carga.estado === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        carga.estado === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {carga.estado === 'published' ? 'Publicado' :
                         carga.estado === 'assigned' ? 'Asignado' :
                         carga.estado === 'delivered' ? 'Entregado' : carga.estado}
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button className="btn btn-secondary text-xs">
                        📄 Ver detalles
                      </button>
                      {userRole === 'generator' && carga.estado === 'published' && (
                        <button className="btn btn-primary text-xs">
                          ✏️ Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="card mt-lg">
            <h2 className="text-xl font-semibold mb-md"><FontAwesomeIcon icon={faBell} /> Notificaciones</h2>
            <div className="text-center text-secondary py-lg">
              <p>No hay notificaciones pendientes</p>
            </div>
          </div>
        </>
      )}

      {currentSection === 'available' && userRole === 'transporter' && (
        <AvailableLoads />
      )}

      {currentSection === 'loads' && userRole === 'generator' && (
        <div className="space-y-lg">
          <div className="card">
            <h2 className="text-xl font-semibold mb-md"><FontAwesomeIcon icon={faBox} /> Mis Cargas</h2>
            {cargas.length > 0 ? (
              <div className="space-y-md">
                {cargas.map((carga) => (
                  <div key={carga.id} className="border border-gray-200 rounded-lg p-md">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <h3 className="font-semibold">
                          {carga.origen} → {carga.destino}
                        </h3>
                        <p className="text-sm text-secondary">
                          {carga.tipo_mercancia} • {carga.peso_kg}kg
                        </p>
                        <p className="text-xs text-secondary">
                          Creado: {new Date(carga.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        carga.estado === 'published' ? 'bg-blue-100 text-blue-800' :
                        carga.estado === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        carga.estado === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {carga.estado === 'published' ? 'Publicado' :
                         carga.estado === 'assigned' ? 'Asignado' :
                         carga.estado === 'delivered' ? 'Entregado' : carga.estado}
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button className="btn btn-secondary text-xs">
                        📄 Ver detalles
                      </button>
                      {carga.estado === 'published' && (
                        <button className="btn btn-primary text-xs">
                          ✏️ Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-lg">
                <p>No tienes cargas publicadas</p>
                <button
                  className="btn btn-primary mt-md"
                  onClick={() => setCurrentSection('publish')}
                >
                  📦 Publicar primera carga
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentSection === 'publish' && userRole === 'generator' && (
        <PublishLoadForm
          onClose={() => setCurrentSection('dashboard')}
          onSuccess={() => {
            setCurrentSection('dashboard')
            fetchCargas()
          }}
        />
      )}

      {currentSection === 'assignments' && userRole === 'transporter' && (
        <div className="space-y-lg">
          <div className="card">
            <h2 className="text-xl font-semibold mb-md"><FontAwesomeIcon icon={faTruck} /> Mis Asignaciones</h2>
            {cargas.length > 0 ? (
              <div className="space-y-md">
                {cargas.map((carga) => (
                  <div key={carga.id} className="border border-gray-200 rounded-lg p-md">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <h3 className="font-semibold">
                          {carga.origen} → {carga.destino}
                        </h3>
                        <p className="text-sm text-secondary">
                          {carga.tipo_mercancia} • {carga.peso_kg}kg
                        </p>
                        <p className="text-xs text-secondary">
                          Asignado: {new Date(carga.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        carga.estado === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        carga.estado === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        carga.estado === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {carga.estado === 'assigned' ? 'Asignado' :
                         carga.estado === 'in_transit' ? 'En tránsito' :
                         carga.estado === 'delivered' ? 'Entregado' : carga.estado}
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button className="btn btn-secondary text-xs">
                        📄 Ver detalles
                      </button>
                      {carga.estado === 'assigned' && (
                        <button className="btn btn-primary text-xs">
                          🚚 Iniciar entrega
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary py-lg">
                <p>No tienes asignaciones activas</p>
                <button
                  className="btn btn-primary mt-md"
                  onClick={() => setCurrentSection('available')}
                >
                  <FontAwesomeIcon icon={faSearch} /> Ver cargas disponibles
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentSection === 'documents' && (
        <div className="space-y-lg">
          <div className="card">
            <h2 className="text-xl font-semibold mb-md"><FontAwesomeIcon icon={faFileAlt} /> Documentos</h2>
            <div className="text-center text-secondary py-lg">
              <p>Funcionalidad de documentos próximamente</p>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'notifications' && (
        <div className="space-y-lg">
          <div className="card">
            <h2 className="text-xl font-semibold mb-md">🔔 Notificaciones</h2>
            <div className="text-center text-secondary py-lg">
              <p>No hay notificaciones pendientes</p>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'settings' && (
        <div className="space-y-lg">
          <div className="card">
            <h2 className="text-xl font-semibold mb-md"><FontAwesomeIcon icon={faCog} /> Configuración</h2>
            <div className="text-center text-secondary py-lg">
              <p>Configuración de perfil próximamente</p>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}

// Publish Load Form Component
function PublishLoadForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    tipo_mercancia: '',
    peso_kg: '',
    fecha_requerida: '',
    dimensiones: {
      length_cm: '',
      width_cm: '',
      height_cm: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      // Validate required fields
      if (!formData.origen || !formData.destino || !formData.tipo_mercancia || !formData.peso_kg || !formData.fecha_requerida) {
        throw new Error('Todos los campos obligatorios deben estar completos')
      }

      const cargaData = {
        generador_id: user.id,
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        tipo_mercancia: formData.tipo_mercancia,
        peso_kg: parseFloat(formData.peso_kg),
        fecha_requerida: new Date(formData.fecha_requerida).toISOString(),
        dimensiones: formData.dimensiones.length_cm && formData.dimensiones.width_cm && formData.dimensiones.height_cm ? {
          length_cm: parseFloat(formData.dimensiones.length_cm),
          width_cm: parseFloat(formData.dimensiones.width_cm),
          height_cm: parseFloat(formData.dimensiones.height_cm)
        } : null,
        estado: 'published' as const
      }

      const { data, error } = await supabase
        .from('cargas')
        .insert([cargaData])
        .select()

      if (error) {
        if (error.code === '23503') {
          throw new Error('Error de referencia: El usuario no existe en la base de datos.')
        } else if (error.code === '42501') {
          throw new Error('No tienes permisos para crear cargas. Verifica las políticas RLS.')
        } else if (error.code === '23505') {
          throw new Error('Ya existe una carga con estos datos.')
        } else {
          throw new Error(`Error al guardar la carga: ${error.message}`)
        }
      }

      onSuccess()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al publicar la carga'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="card mb-lg">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="cv-text-xl cv-font-semibold">📦 Publicar Nueva Carga</h2>
        <button onClick={onClose} className="cv-btn cv-btn-secondary" aria-label="Cerrar formulario">✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
          <div>
            <label className="label">Origen</label>
            <input
              type="text"
              className="input"
              value={formData.origen}
              onChange={(e) => handleChange('origen', e.target.value)}
              placeholder="Ciudad de origen"
              required
            />
          </div>

          <div>
            <label className="label">Destino</label>
            <input
              type="text"
              className="input"
              value={formData.destino}
              onChange={(e) => handleChange('destino', e.target.value)}
              placeholder="Ciudad de destino"
              required
            />
          </div>

          <div>
            <label className="label">Tipo de Mercancía</label>
            <select
              className="input"
              value={formData.tipo_mercancia}
              onChange={(e) => handleChange('tipo_mercancia', e.target.value)}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Electrónicos">Electrónicos</option>
              <option value="Ropa">Ropa</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Químicos">Químicos</option>
              <option value="Muebles">Muebles</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="label">Peso (kg)</label>
            <input
              type="number"
              className="input"
              value={formData.peso_kg}
              onChange={(e) => handleChange('peso_kg', e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Fecha Requerida</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.fecha_requerida}
              onChange={(e) => handleChange('fecha_requerida', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-lg">
          <h3 className="font-semibold mb-md">📏 Dimensiones (opcional)</h3>
          <div className="grid grid-cols-3 gap-sm">
            <div>
              <label className="label text-sm">Largo (cm)</label>
              <input
                type="number"
                className="input"
                value={formData.dimensiones.length_cm}
                onChange={(e) => handleChange('dimensiones.length_cm', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="label text-sm">Ancho (cm)</label>
              <input
                type="number"
                className="input"
                value={formData.dimensiones.width_cm}
                onChange={(e) => handleChange('dimensiones.width_cm', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="label text-sm">Alto (cm)</label>
              <input
                type="number"
                className="input"
                value={formData.dimensiones.height_cm}
                onChange={(e) => handleChange('dimensiones.height_cm', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-md text-error">
            {error}
          </div>
        )}

        <div className="cv-flex cv-gap-sm">
          <button
            type="submit"
            className="cv-btn cv-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="cv-spinner" />
                Publicando...
              </>
            ) : (
              '📦 Publicar Carga'
            )}
          </button>
          <button
            type="button"
            className="cv-btn cv-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}