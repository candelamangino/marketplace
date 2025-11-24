import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import '../styles/dashboard.css'

/**
 * Página de Dashboard - Panel de Solicitante o Proveedor de Servicios
 * 
 * Esta página muestra diferentes dashboards según el rol del usuario:
 * 
 * PARA SOLICITANTE:
 * 1. Título "Panel de Solicitante" y subtítulo
 * 2. Tres cards de estadísticas horizontales:
 *    - Servicios Publicados (con icono azul)
 *    - Cotizaciones Recibidas (con icono verde)
 *    - En Evaluación (con icono naranja)
 * 3. Botón "Publicar Nuevo Servicio"
 * 4. Sección "Mis Servicios Recientes" con lista de servicios en formato horizontal
 * 
 * PARA PROVEEDOR_SERVICIO:
 * 1. Título "Panel de Proveedor de Servicios" y subtítulo
 * 2. Tres o cuatro cards de estadísticas:
 *    - Servicios Disponibles (con icono azul)
 *    - Cotizaciones Enviadas (con icono verde)
 *    - Rating Promedio (con icono amarillo/naranja)
 * 3. Botones de acción: "Ver Servicios Disponibles" y "Mis Cotizaciones"
 * 4. Sección "Servicios Disponibles para Cotizar" con lista de servicios
 * 
 * Las estadísticas se calculan en tiempo real basándose en los servicios
 * y cotizaciones del usuario actual.
 */
const DashboardPage = () => {
  // Obtenemos el contexto con los datos globales
  const { state } = useContext(AppContext)
  const { currentUser, services, quotes, supplies } = state
  const navigate = useNavigate()

  // Si no hay usuario, no mostramos nada
  if (!currentUser) {
    return <div>Cargando...</div>
  }

  // ============================================
  // DASHBOARD PARA SOLICITANTE
  // ============================================
  if (currentUser.rol === 'SOLICITANTE') {
    // Calculamos las estadísticas para el solicitante
    const stats = useMemo(() => {
      // Filtramos los servicios del solicitante actual
      const misServicios = services.filter(
        s => s.solicitanteId === currentUser.id
      )

      // Contamos los servicios publicados (todos los servicios del solicitante)
      const serviciosPublicados = misServicios.length

      // Contamos las cotizaciones recibidas (cotizaciones de servicios del solicitante)
      // Buscamos todas las cotizaciones que pertenecen a servicios del solicitante
      const cotizacionesRecibidas = quotes.filter(quote => {
        const servicio = services.find(s => s.id === quote.serviceId)
        return servicio && servicio.solicitanteId === currentUser.id
      }).length

      // Contamos los servicios en evaluación (estado EN_EVALUACION)
      const enEvaluacion = misServicios.filter(
        s => s.estado === 'EN_EVALUACION'
      ).length

      return {
        serviciosPublicados,
        cotizacionesRecibidas,
        enEvaluacion
      }
    }, [services, quotes, currentUser])

    // Obtenemos los servicios recientes del solicitante (máximo 3)
    // Ordenados por fecha preferida (más recientes primero)
    const serviciosRecientes = useMemo(() => {
      return services
        .filter(s => s.solicitanteId === currentUser.id)
        .sort((a, b) => {
          // Ordenamos por fecha preferida (más recientes primero)
          return new Date(b.fechaPreferida) - new Date(a.fechaPreferida)
        })
        .slice(0, 3) // Solo los 3 más recientes
        .map(service => {
          // Para cada servicio, contamos las cotizaciones recibidas
          const cotizacionesCount = quotes.filter(
            q => q.serviceId === service.id
          ).length

          return {
            ...service,
            cotizacionesCount
          }
        })
    }, [services, quotes, currentUser])

    /**
     * Función que formatea la fecha para mostrarla en formato legible
     * Convierte "2025-12-01" a "1 de diciembre de 2025"
     */
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
    }

    /**
     * Función que maneja el click en el botón "Publicar Nuevo Servicio"
     * Navega a la página de creación de servicios
     */
    const handlePublicarServicio = () => {
      navigate('/servicios/nuevo')
    }

    /**
     * Función que obtiene el texto del badge de estado en español
     */
    const getEstadoText = (estado) => {
      const estadoMap = {
        'PUBLICADO': 'Publicado',
        'EN_EVALUACION': 'En Evaluación',
        'ASIGNADO': 'Asignado',
        'COMPLETADO': 'Completado'
      }
      return estadoMap[estado] || estado
    }

    return (
      <div className="dashboard-page">
        {/* Título principal */}
        <h1 className="dashboard-title">Panel de Solicitante</h1>

        {/* Subtítulo descriptivo */}
        <p className="dashboard-subtitle">
          Gestiona tus servicios y revisa las cotizaciones recibidas
        </p>

        {/* Cards de estadísticas */}
        <div className="dashboard-stats">
          {/* Card: Servicios Publicados */}
          <div className="stat-card stat-card-blue">
            <div className="stat-icon stat-icon-blue">💼</div>
            <div className="stat-content">
              <div className="stat-number">{stats.serviciosPublicados}</div>
              <div className="stat-label">Servicios Publicados</div>
            </div>
          </div>

          {/* Card: Cotizaciones Recibidas */}
          <div className="stat-card stat-card-green">
            <div className="stat-icon stat-icon-green">📄</div>
            <div className="stat-content">
              <div className="stat-number">{stats.cotizacionesRecibidas}</div>
              <div className="stat-label">Cotizaciones Recibidas</div>
            </div>
          </div>

          {/* Card: En Evaluación */}
          <div className="stat-card stat-card-orange">
            <div className="stat-icon stat-icon-orange">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.enEvaluacion}</div>
              <div className="stat-label">En Evaluación</div>
            </div>
          </div>
        </div>

        {/* Botón "Publicar Nuevo Servicio" */}
        <div className="dashboard-actions">
          <button
            type="button"
            className="dashboard-publish-button"
            onClick={handlePublicarServicio}
          >
            + Publicar Nuevo Servicio
          </button>
        </div>

        {/* Sección: Mis Servicios Recientes */}
        <div className="dashboard-recent-section">
          {/* Header de la sección */}
          <div className="recent-section-header">
            <h2 className="recent-section-title">Mis Servicios Recientes</h2>
            {serviciosRecientes.length > 0 && (
              <Link to="/servicios" className="recent-section-link">
                Ver todos
              </Link>
            )}
          </div>

          {/* Card de estado vacío o lista de servicios */}
          {serviciosRecientes.length === 0 ? (
            <div className="recent-empty-card">
              <div className="empty-card-icon">💼</div>
              <h3 className="empty-card-title">No tienes servicios publicados</h3>
              <p className="empty-card-text">
                Comienza publicando tu primer servicio
              </p>
              <button
                type="button"
                className="empty-card-button"
                onClick={handlePublicarServicio}
              >
                Publicar Servicio
              </button>
            </div>
          ) : (
            <div className="recent-services-list">
              {serviciosRecientes.map(service => (
                <div key={service.id} className="recent-service-card">
                  <div className="recent-service-left">
                    <h3 className="recent-service-title">{service.titulo}</h3>
                    <div className="recent-service-meta">
                      <span className="recent-service-location">
                        {service.ciudad}
                      </span>
                      <span className="recent-service-separator">·</span>
                      <span className="recent-service-date">
                        {formatDate(service.fechaPreferida)}
                      </span>
                    </div>
                  </div>
                  <div className="recent-service-right">
                    <span className="recent-service-quotes">
                      {service.cotizacionesCount} {service.cotizacionesCount === 1 ? 'cotización' : 'cotizaciones'}
                    </span>
                    <span className={`recent-service-badge badge-${service.estado.toLowerCase()}`}>
                      {getEstadoText(service.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // DASHBOARD PARA PROVEEDOR_SERVICIO
  // ============================================
  if (currentUser.rol === 'PROVEEDOR_SERVICIO') {
    // Calculamos las estadísticas para el proveedor de servicios
    const stats = useMemo(() => {
      // Servicios disponibles para cotizar (estados PUBLICADO o EN_EVALUACION)
      // que NO sean del proveedor actual (no es solicitante)
      const serviciosDisponibles = services.filter(
        s => (s.estado === 'PUBLICADO' || s.estado === 'EN_EVALUACION') &&
             s.solicitanteId !== currentUser.id
      ).length

      // Cotizaciones enviadas por el proveedor actual
      const cotizacionesEnviadas = quotes.filter(
        q => q.proveedorServicioId === currentUser.id
      ).length

      // Rating promedio del proveedor (simulado, en producción vendría de una API)
      // Por ahora, calculamos un promedio basado en cotizaciones aceptadas
      const cotizacionesAceptadas = quotes.filter(
        q => q.proveedorServicioId === currentUser.id && q.estado === 'ACEPTADA'
      ).length
      // Simulamos un rating entre 4.5 y 5.0 basado en cotizaciones aceptadas
      const ratingPromedio = cotizacionesAceptadas > 0 
        ? (4.5 + (cotizacionesAceptadas * 0.1)).toFixed(1)
        : '4.8' // Rating por defecto

      return {
        serviciosDisponibles,
        cotizacionesEnviadas,
        ratingPromedio
      }
    }, [services, quotes, currentUser])

    // Obtenemos los servicios disponibles para cotizar (máximo 3)
    // Ordenados por fecha preferida (más recientes primero)
    const serviciosDisponibles = useMemo(() => {
      return services
        .filter(s => 
          (s.estado === 'PUBLICADO' || s.estado === 'EN_EVALUACION') &&
          s.solicitanteId !== currentUser.id
        )
        .sort((a, b) => {
          // Ordenamos por fecha preferida (más recientes primero)
          return new Date(b.fechaPreferida) - new Date(a.fechaPreferida)
        })
        .slice(0, 3) // Solo los 3 más recientes
        .map(service => {
          // Para cada servicio, contamos las cotizaciones recibidas
          const cotizacionesCount = quotes.filter(
            q => q.serviceId === service.id
          ).length

          return {
            ...service,
            cotizacionesCount
          }
        })
    }, [services, quotes, currentUser])

    /**
     * Función que formatea la fecha para mostrarla en formato corto
     * Convierte "2025-12-01" a "2025-12-01" (formato corto para el dashboard)
     */
    const formatDateShort = (dateString) => {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0] // Formato YYYY-MM-DD
    }

    /**
     * Función que obtiene el texto del badge de estado en español
     */
    const getEstadoText = (estado) => {
      const estadoMap = {
        'PUBLICADO': 'Publicado',
        'EN_EVALUACION': 'En Evaluación',
        'ASIGNADO': 'Asignado',
        'COMPLETADO': 'Completado'
      }
      return estadoMap[estado] || estado
    }

    /**
     * Función que maneja el click en "Ver Servicios Disponibles"
     * Navega a la página de servicios disponibles
     */
    const handleVerServicios = () => {
      navigate('/servicios')
    }

    /**
     * Función que maneja el click en "Mis Cotizaciones"
     * Navega a la página de cotizaciones
     */
    const handleMisCotizaciones = () => {
      navigate('/cotizaciones')
    }

    return (
      <div className="dashboard-page">
        {/* Título principal */}
        <h1 className="dashboard-title">Panel de Proveedor de Servicios</h1>

        {/* Subtítulo descriptivo */}
        <p className="dashboard-subtitle">
          Encuentra servicios disponibles y gestiona tus cotizaciones
        </p>

        {/* Cards de estadísticas */}
        <div className="dashboard-stats">
          {/* Card: Servicios Disponibles */}
          <div className="stat-card stat-card-blue">
            <div className="stat-icon stat-icon-blue">💼</div>
            <div className="stat-content">
              <div className="stat-number">{stats.serviciosDisponibles}</div>
              <div className="stat-label">Servicios Disponibles</div>
            </div>
          </div>

          {/* Card: Cotizaciones Enviadas */}
          <div className="stat-card stat-card-green">
            <div className="stat-icon stat-icon-green">📄</div>
            <div className="stat-content">
              <div className="stat-number">{stats.cotizacionesEnviadas}</div>
              <div className="stat-label">Cotizaciones Enviadas</div>
            </div>
          </div>

          {/* Card: Rating Promedio */}
          <div className="stat-card stat-card-orange">
            <div className="stat-icon stat-icon-orange">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.ratingPromedio}</div>
              <div className="stat-label">Rating Promedio</div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="dashboard-actions dashboard-actions-provider">
          <button
            type="button"
            className="dashboard-action-button dashboard-action-primary"
            onClick={handleVerServicios}
          >
            Ver Servicios Disponibles
          </button>
          <button
            type="button"
            className="dashboard-action-button dashboard-action-secondary"
            onClick={handleMisCotizaciones}
          >
            Mis Cotizaciones
          </button>
        </div>

        {/* Sección: Servicios Disponibles para Cotizar */}
        <div className="dashboard-recent-section">
          {/* Header de la sección */}
          <div className="recent-section-header">
            <h2 className="recent-section-title">Servicios Disponibles para Cotizar</h2>
          </div>

          {/* Card de estado vacío o lista de servicios */}
          {serviciosDisponibles.length === 0 ? (
            <div className="recent-empty-card">
              <div className="empty-card-icon">💼</div>
              <h3 className="empty-card-title">No hay servicios disponibles</h3>
              <p className="empty-card-text">
                No hay servicios disponibles para cotizar en este momento.
              </p>
            </div>
          ) : (
            <div className="recent-services-list">
              {serviciosDisponibles.map(service => (
                <div key={service.id} className="recent-service-card">
                  <div className="recent-service-left">
                    <h3 className="recent-service-title">{service.titulo}</h3>
                    <div className="recent-service-meta">
                      <span className="recent-service-location">
                        {service.ciudad}
                      </span>
                      <span className="recent-service-separator">-</span>
                      <span className="recent-service-date">
                        {formatDateShort(service.fechaPreferida)}
                      </span>
                    </div>
                  </div>
                  <div className="recent-service-right">
                    <span className="recent-service-quotes">
                      {service.cotizacionesCount} {service.cotizacionesCount === 1 ? 'cotización' : 'cotizaciones'}
                    </span>
                    <span className={`recent-service-badge badge-${service.estado.toLowerCase()}`}>
                      {getEstadoText(service.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // DASHBOARD PARA PROVEEDOR_INSUMOS
  // ============================================
  if (currentUser.rol === 'PROVEEDOR_INSUMOS') {
    // Calculamos las estadísticas para el proveedor de insumos
    const stats = useMemo(() => {
      // Insumos en catálogo del proveedor actual
      const insumosEnCatalogo = supplies.filter(
        s => s.proveedorInsumosId === currentUser.id
      ).length

      // Stock total (suma de todos los stocks de insumos del proveedor)
      const stockTotal = supplies
        .filter(s => s.proveedorInsumosId === currentUser.id)
        .reduce((total, insumo) => total + (insumo.stock || 0), 0)

      // Packs disponibles del proveedor actual
      const packsDisponibles = state.supplyOffers.filter(
        so => so.proveedorInsumosId === currentUser.id
      ).length

      return {
        insumosEnCatalogo,
        stockTotal,
        packsDisponibles
      }
    }, [supplies, state.supplyOffers, currentUser])

    // Obtenemos los insumos recientes del proveedor (máximo 4)
    // Ordenados por fecha de creación (más recientes primero)
    // Como no tenemos fecha de creación en los mock, ordenamos por ID
    const insumosRecientes = useMemo(() => {
      return supplies
        .filter(s => s.proveedorInsumosId === currentUser.id)
        .sort((a, b) => {
          // Ordenamos por ID (más recientes primero, asumiendo IDs más altos = más recientes)
          return parseInt(b.id) - parseInt(a.id)
        })
        .slice(0, 4) // Solo los 4 más recientes
    }, [supplies, currentUser])

    /**
     * Función que maneja el click en "Ver Catálogo de Insumos"
     * Navega a la página de catálogo
     */
    const handleVerCatalogo = () => {
      navigate('/insumos')
    }

    return (
      <div className="dashboard-page">
        {/* Título principal */}
        <h1 className="dashboard-title">Panel de Proveedor de Insumos</h1>

        {/* Subtítulo descriptivo */}
        <p className="dashboard-subtitle">
          Gestiona tu catálogo de insumos y packs disponibles
        </p>

        {/* Cards de estadísticas */}
        <div className="dashboard-stats">
          {/* Card: Insumos en Catálogo */}
          <div className="stat-card stat-card-blue">
            <div className="stat-icon stat-icon-blue">📦</div>
            <div className="stat-content">
              <div className="stat-number">{stats.insumosEnCatalogo}</div>
              <div className="stat-label">Insumos en Catálogo</div>
            </div>
          </div>

          {/* Card: Stock Total */}
          <div className="stat-card stat-card-green">
            <div className="stat-icon stat-icon-green">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.stockTotal}</div>
              <div className="stat-label">Stock Total (unidades)</div>
            </div>
          </div>

          {/* Card: Packs Disponibles */}
          <div className="stat-card stat-card-orange">
            <div className="stat-icon stat-icon-orange">📄</div>
            <div className="stat-content">
              <div className="stat-number">{stats.packsDisponibles}</div>
              <div className="stat-label">Packs Disponibles</div>
            </div>
          </div>
        </div>

        {/* Botón "Ver Catálogo de Insumos" */}
        <div className="dashboard-actions">
          <button
            type="button"
            className="dashboard-publish-button"
            onClick={handleVerCatalogo}
          >
            Ver Catálogo de Insumos
          </button>
        </div>

        {/* Sección: Insumos Recientes */}
        <div className="dashboard-recent-section">
          {/* Header de la sección */}
          <div className="recent-section-header">
            <h2 className="recent-section-title">Insumos Recientes</h2>
          </div>

          {/* Card de estado vacío o lista de insumos */}
          {insumosRecientes.length === 0 ? (
            <div className="recent-empty-card">
              <div className="empty-card-icon">📦</div>
              <h3 className="empty-card-title">No tienes insumos en tu catálogo</h3>
              <p className="empty-card-text">
                Comienza agregando tu primer insumo
              </p>
              <button
                type="button"
                className="empty-card-button"
                onClick={handleVerCatalogo}
              >
                Agregar Insumo
              </button>
            </div>
          ) : (
            <div className="recent-supplies-grid">
              {insumosRecientes.map(supply => (
                <div key={supply.id} className="recent-supply-card">
                  <div className="recent-supply-header">
                    <h3 className="recent-supply-title">{supply.nombre}</h3>
                    <span className="recent-supply-category">{supply.categoria}</span>
                  </div>
                  <div className="recent-supply-footer">
                    <span className="recent-supply-price">
                      ${supply.precioUnitario.toLocaleString()} / {supply.unidad}
                    </span>
                    <span className="recent-supply-stock">Stock: {supply.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Si el usuario tiene otro rol, mostramos un mensaje
  return (
    <div className="dashboard-page">
      <h1>Panel de {currentUser.rol}</h1>
      <p>Esta vista está diseñada para Solicitantes, Proveedores de Servicios o Proveedores de Insumos.</p>
    </div>
  )
}

export default DashboardPage
