import { useState, useMemo } from 'react'
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/providerQuotes.css'

/**
 * Página de Cotizaciones del Proveedor - QuotesPage
 * 
 * Esta página muestra todas las cotizaciones que el proveedor ha enviado:
 * 
 * 1. Título "Mis Cotizaciones" con subtítulo
 * 2. Cuatro cards de estadísticas:
 *    - Total Enviadas
 *    - En Evaluación
 *    - Asignadas
 *    - Completadas
 * 3. Barra de búsqueda "Buscar por servicio o ciudad..."
 * 4. Listado de cotizaciones agrupadas por estado:
 *    - Cada cotización muestra:
 *      - Nombre del servicio
 *      - Ciudad y fecha
 *      - Categoría (badge)
 *      - Precio ofrecido
 *      - Plazo
 *      - Estado (badge)
 *      - Botones "Editar" y "Ver detalle" cuando corresponda
 * 
 * Funcionalidades:
 * - Solo muestra cotizaciones del proveedor actual (proveedorServicioId)
 * - Permite editar cotizaciones mientras el servicio no esté ASIGNADO
 * - Permite eliminar cotizaciones (solo si el servicio no está ASIGNADO)
 * - Búsqueda por nombre de servicio o ciudad
 * 
 * Las cotizaciones se agrupan por estado para facilitar la visualización.
 */
const QuotesPage = () => {
  // Obtenemos el contexto con los datos globales
  const { state, dispatch } = useContext(AppContext)
  const { currentUser, services, quotes } = state
  const navigate = useNavigate()

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Si no hay usuario o no es PROVEEDOR_SERVICIO, no mostramos nada
  if (!currentUser || currentUser.rol !== 'PROVEEDOR_SERVICIO') {
    return <div>Cargando...</div>
  }

  // Obtenemos todas las cotizaciones del proveedor actual
  const misCotizaciones = useMemo(() => {
    return quotes
      .filter(q => q.proveedorServicioId === currentUser.id)
      .map(quote => {
        // Para cada cotización, obtenemos el servicio asociado
        const service = services.find(s => s.id === quote.serviceId)
        return {
          ...quote,
          service: service
        }
      })
      .filter(quote => quote.service) // Filtramos cotizaciones sin servicio válido
  }, [quotes, services, currentUser])

  // Calculamos las estadísticas de las cotizaciones
  const stats = useMemo(() => {
    return {
      totalEnviadas: misCotizaciones.length,
      enEvaluacion: misCotizaciones.filter(q => q.estado === 'PENDIENTE').length,
      asignadas: misCotizaciones.filter(q => q.estado === 'ACEPTADA').length,
      completadas: misCotizaciones.filter(q => {
        const service = services.find(s => s.id === q.serviceId)
        return service && service.estado === 'COMPLETADO'
      }).length
    }
  }, [misCotizaciones, services])

  // Filtramos las cotizaciones por término de búsqueda
  const cotizacionesFiltradas = useMemo(() => {
    if (searchTerm === '') {
      return misCotizaciones
    }

    const term = searchTerm.toLowerCase()
    return misCotizaciones.filter(quote => {
      const service = quote.service
      if (!service) return false

      // Buscar por nombre del servicio o ciudad
      return service.titulo.toLowerCase().includes(term) ||
             service.ciudad.toLowerCase().includes(term)
    })
  }, [misCotizaciones, searchTerm])

  // Agrupamos las cotizaciones por estado
  const cotizacionesPorEstado = useMemo(() => {
    const grupos = {
      'PUBLICADO': [], // Cotizaciones pendientes (estado PENDIENTE pero servicio PUBLICADO)
      'EN_EVALUACION': [] // Cotizaciones pendientes (estado PENDIENTE pero servicio EN_EVALUACION)
    }

    cotizacionesFiltradas.forEach(quote => {
      const service = quote.service
      if (!service) return

      // Si la cotización está PENDIENTE, la agrupamos según el estado del servicio
      if (quote.estado === 'PENDIENTE') {
        if (service.estado === 'PUBLICADO') {
          grupos['PUBLICADO'].push(quote)
        } else if (service.estado === 'EN_EVALUACION') {
          grupos['EN_EVALUACION'].push(quote)
        }
      } else if (quote.estado === 'ACEPTADA') {
        // Las cotizaciones aceptadas van a "Asignadas"
        grupos['EN_EVALUACION'].push(quote) // Por ahora las mostramos en "En Evaluación"
      }
    })

    return grupos
  }, [cotizacionesFiltradas])

  /**
   * Función que formatea la fecha para mostrarla en formato corto
   * Convierte "2025-11-30" a "30 nov 2025"
   */
  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  /**
   * Función que obtiene el texto del estado en español
   */
  const getEstadoText = (estado) => {
    const estadoMap = {
      'PENDIENTE': 'Publicado',
      'ACEPTADA': 'En Evaluación',
      'RECHAZADA': 'Rechazada'
    }
    return estadoMap[estado] || estado
  }

  /**
   * Función que maneja la eliminación de una cotización
   * Solo permite eliminar si el servicio no está ASIGNADO
   */
  const handleDeleteQuote = (quoteId, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    if (service && service.estado === 'ASIGNADO') {
      alert('No puedes eliminar una cotización de un servicio ya asignado.')
      return
    }

    if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
      dispatch({ type: 'DELETE_QUOTE', payload: quoteId })
    }
  }

  /**
   * Función que maneja la edición de una cotización
   * Navega al detalle del servicio donde se puede editar
   */
  const handleEditQuote = (serviceId) => {
    navigate(`/servicios/${serviceId}`)
  }

  return (
    <div className="provider-quotes-page">
      {/* Header: Título y subtítulo */}
      <div className="quotes-header">
        <h1 className="quotes-title">Mis Cotizaciones</h1>
        <p className="quotes-subtitle">
          Gestiona todas las cotizaciones que has enviado
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="quotes-stats">
        {/* Card: Total Enviadas */}
        <div className="quote-stat-card">
          <div className="quote-stat-icon">📄</div>
          <div className="quote-stat-content">
            <div className="quote-stat-number">{stats.totalEnviadas}</div>
            <div className="quote-stat-label">Total Enviadas</div>
          </div>
        </div>

        {/* Card: En Evaluación */}
        <div className="quote-stat-card">
          <div className="quote-stat-icon">⏰</div>
          <div className="quote-stat-content">
            <div className="quote-stat-number">{stats.enEvaluacion}</div>
            <div className="quote-stat-label">En Evaluación</div>
          </div>
        </div>

        {/* Card: Asignadas */}
        <div className="quote-stat-card">
          <div className="quote-stat-icon">💼</div>
          <div className="quote-stat-content">
            <div className="quote-stat-number">{stats.asignadas}</div>
            <div className="quote-stat-label">Asignadas</div>
          </div>
        </div>

        {/* Card: Completadas */}
        <div className="quote-stat-card">
          <div className="quote-stat-icon">✅</div>
          <div className="quote-stat-content">
            <div className="quote-stat-number">{stats.completadas}</div>
            <div className="quote-stat-label">Completadas</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="quotes-search">
        <input
          type="text"
          className="quotes-search-input"
          placeholder="Buscar por servicio o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Listado de cotizaciones agrupadas por estado */}
      {cotizacionesFiltradas.length === 0 ? (
        <div className="quotes-empty-state">
          <p>No se encontraron cotizaciones.</p>
        </div>
      ) : (
        <div className="quotes-groups">
          {/* Grupo: Publicado */}
          {cotizacionesPorEstado['PUBLICADO'].length > 0 && (
            <div className="quote-group">
              <h2 className="quote-group-title">
                Publicado ({cotizacionesPorEstado['PUBLICADO'].length} {cotizacionesPorEstado['PUBLICADO'].length === 1 ? 'cotización' : 'cotizaciones'})
              </h2>
              <div className="quote-group-list">
                {cotizacionesPorEstado['PUBLICADO'].map(quote => {
                  const service = quote.service
                  if (!service) return null

                  return (
                    <div key={quote.id} className="quote-item-card">
                      <div className="quote-item-left">
                        <h3 className="quote-item-title">{service.titulo}</h3>
                        <div className="quote-item-meta">
                          <span className="quote-item-location">📍 {service.ciudad}</span>
                          <span className="quote-item-date">📅 {formatDateShort(service.fechaPreferida)}</span>
                          <span className="quote-item-category">{service.categoria}</span>
                        </div>
                      </div>
                      <div className="quote-item-right">
                        <div className="quote-item-price">$ {quote.precioTotal.toLocaleString()}</div>
                        <div className="quote-item-plazo">⏰ {quote.plazoDias} {quote.plazoDias === 1 ? 'día' : 'días'}</div>
                        <div className="quote-item-actions">
                          {service.estado !== 'ASIGNADO' && (
                            <button
                              className="quote-edit-button"
                              onClick={() => handleEditQuote(service.id)}
                            >
                              ✏️ Editar
                            </button>
                          )}
                          <Link
                            to={`/servicios/${service.id}`}
                            className="quote-detail-button"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grupo: En Evaluación */}
          {cotizacionesPorEstado['EN_EVALUACION'].length > 0 && (
            <div className="quote-group">
              <h2 className="quote-group-title quote-group-title-evaluacion">
                En Evaluación ({cotizacionesPorEstado['EN_EVALUACION'].length} {cotizacionesPorEstado['EN_EVALUACION'].length === 1 ? 'cotización' : 'cotizaciones'})
              </h2>
              <div className="quote-group-list">
                {cotizacionesPorEstado['EN_EVALUACION'].map(quote => {
                  const service = quote.service
                  if (!service) return null

                  return (
                    <div key={quote.id} className="quote-item-card">
                      <div className="quote-item-left">
                        <h3 className="quote-item-title">{service.titulo}</h3>
                        <div className="quote-item-meta">
                          <span className="quote-item-location">📍 {service.ciudad}</span>
                          <span className="quote-item-date">📅 {formatDateShort(service.fechaPreferida)}</span>
                          <span className="quote-item-category">{service.categoria}</span>
                        </div>
                      </div>
                      <div className="quote-item-right">
                        <div className="quote-item-price">$ {quote.precioTotal.toLocaleString()}</div>
                        <div className="quote-item-plazo">⏰ {quote.plazoDias} {quote.plazoDias === 1 ? 'día' : 'días'}</div>
                        <div className="quote-item-actions">
                          <Link
                            to={`/servicios/${service.id}`}
                            className="quote-detail-button"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuotesPage
