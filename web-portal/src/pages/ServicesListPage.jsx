import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import '../styles/services.css'

/**
 * Página de listado de servicios - ServicesListPage
 * 
 * Esta página muestra la lista de servicios del solicitante con:
 * 1. Título "Mis Servicios" con subtítulo
 * 2. Barra de filtros con 3 campos: buscar, categoría, ciudad
 * 3. Botón "Publicar Servicio" en la esquina superior derecha
 * 4. Contador de servicios encontrados
 * 5. Lista de cards de servicios con:
 *    - Título del servicio
 *    - Descripción corta
 *    - Badges de categoría, ciudad, fecha, cantidad de cotizaciones
 *    - Estado (Publicado / En Evaluación) a la derecha
 *    - Botón "Ver detalle" a la derecha
 * 
 * Funcionalidades:
 * - Filtrado en tiempo real por texto, categoría y ciudad
 * - Navegación a la página de creación de servicios
 * - Muestra estado vacío cuando no hay servicios o no hay resultados
 * 
 * Los servicios se filtran automáticamente por solicitanteId del usuario actual.
 */
const ServicesListPage = () => {
  // Obtenemos el contexto con los servicios, cotizaciones y el usuario actual
  const { state } = useContext(AppContext)
  const { currentUser, services, quotes } = state
  const navigate = useNavigate()

  // Estado para los filtros
  const [filters, setFilters] = useState({
    search: '', // Búsqueda por texto
    categoria: '', // Filtro por categoría
    ciudad: '', // Filtro por ciudad
    fecha: '' // Filtro por fecha preferida (fecha mínima)
  })

  // Si no hay usuario, no mostramos nada
  if (!currentUser) {
    return <div>Cargando...</div>
  }

  // Obtenemos las categorías únicas de los servicios para el dropdown
  const categorias = useMemo(() => {
    const cats = new Set()
    services.forEach(service => {
      if (service.categoria) {
        cats.add(service.categoria)
      }
    })
    return Array.from(cats).sort()
  }, [services])

  // Obtenemos las ciudades únicas de los servicios para el dropdown
  const ciudades = useMemo(() => {
    const cities = new Set()
    services.forEach(service => {
      if (service.ciudad) {
        cities.add(service.ciudad)
      }
    })
    return Array.from(cities).sort()
  }, [services])

  // Filtramos los servicios según el rol del usuario
  const serviciosBase = useMemo(() => {
    if (currentUser.rol === 'SOLICITANTE') {
      // El solicitante ve solo sus servicios
      return services.filter(s => s.solicitanteId === currentUser.id)
    } else if (currentUser.rol === 'PROVEEDOR_SERVICIO') {
      // El proveedor ve servicios disponibles para cotizar
      // Que NO sean del proveedor actual (no es solicitante)
      // Y que estén en estados PUBLICADO o EN_EVALUACION
      return services.filter(
        s => (s.estado === 'PUBLICADO' || s.estado === 'EN_EVALUACION') &&
             s.solicitanteId !== currentUser.id
      )
    }
    return []
  }, [services, currentUser])

  // Aplicamos los filtros a los servicios base
  const serviciosFiltrados = useMemo(() => {
    return serviciosBase
      .filter(service => {
        // Filtro por búsqueda de texto (título o descripción)
        const matchesSearch = filters.search === '' || 
          service.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
          service.descripcion.toLowerCase().includes(filters.search.toLowerCase())

        // Filtro por categoría
        const matchesCategoria = filters.categoria === '' || 
          service.categoria === filters.categoria

        // Filtro por ciudad
        const matchesCiudad = filters.ciudad === '' || 
          service.ciudad === filters.ciudad

        // Filtro por fecha preferida (fecha mínima)
        // Si se especifica una fecha, mostramos solo servicios cuya fechaPreferida >= fecha filtro
        // Comparamos solo las fechas (sin horas) para evitar problemas de timezone
        let matchesFecha = true
        if (filters.fecha && service.fechaPreferida) {
          // Convertimos las fechas a Date objects y comparamos solo la parte de fecha (sin hora)
          const fechaFiltro = new Date(filters.fecha)
          fechaFiltro.setHours(0, 0, 0, 0) // Normalizamos a medianoche
          
          const fechaServicio = new Date(service.fechaPreferida)
          fechaServicio.setHours(0, 0, 0, 0) // Normalizamos a medianoche
          
          // El servicio debe tener fechaPreferida >= fecha filtro
          matchesFecha = fechaServicio >= fechaFiltro
        }

        return matchesSearch && matchesCategoria && matchesCiudad && matchesFecha
      })
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
  }, [serviciosBase, filters, quotes])

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
   * Función que maneja los cambios en los filtros
   * Actualiza el estado de los filtros cuando el usuario escribe o selecciona
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Función que maneja el click en el botón "Publicar Servicio"
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
    <div className="services-list-page">
      {/* Header: Título, subtítulo y botón */}
      <div className="services-header">
        <div className="services-header-left">
          <h1 className="services-title">
            {currentUser.rol === 'SOLICITANTE' ? 'Mis Servicios' : 'Servicios Disponibles'}
          </h1>
          <p className="services-subtitle">
            {currentUser.rol === 'SOLICITANTE' 
              ? 'Gestiona tus servicios publicados'
              : 'Encuentra servicios para cotizar'}
          </p>
        </div>
        {currentUser.rol === 'SOLICITANTE' && (
          <button
            type="button"
            className="services-header-button"
            onClick={handlePublicarServicio}
          >
            + Publicar Servicio
          </button>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="services-filters-bar">
        {/* Input de búsqueda */}
        <div className="filter-group">
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar servicios..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Select de categoría */}
        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.categoria}
            onChange={(e) => handleFilterChange('categoria', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Select de ciudad */}
        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.ciudad}
            onChange={(e) => handleFilterChange('ciudad', e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map(ciudad => (
              <option key={ciudad} value={ciudad}>{ciudad}</option>
            ))}
          </select>
        </div>

        {/* Input de fecha (filtro por fecha mínima) */}
        <div className="filter-group">
          <input
            type="date"
            className="filter-input"
            value={filters.fecha}
            onChange={(e) => handleFilterChange('fecha', e.target.value)}
            placeholder="Fecha mínima"
            title="Filtra servicios con fecha preferida desde esta fecha"
          />
        </div>
      </div>

      {/* Contador de servicios encontrados */}
      {serviciosFiltrados.length > 0 && (
        <p className="services-count">
          {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}
        </p>
      )}

      {/* Contenido: Lista de servicios o estado vacío */}
      {serviciosFiltrados.length === 0 ? (
        /* Card de estado vacío cuando no hay servicios */
        <div className="services-empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2 className="empty-state-title">No se encontraron servicios</h2>
          <p className="empty-state-text">
            {serviciosBase.length === 0
              ? 'Aún no has publicado ningún servicio. Comienza creando tu primer servicio.'
              : 'No hay servicios que coincidan con los filtros seleccionados. Intenta ajustar los filtros.'}
          </p>
          {currentUser.rol === 'SOLICITANTE' && serviciosBase.length === 0 && (
            <button
              type="button"
              className="empty-state-button"
              onClick={handlePublicarServicio}
            >
              Publicar Servicio
            </button>
          )}
        </div>
      ) : (
        /* Lista de servicios cuando hay resultados */
        <div className="services-list">
          {serviciosFiltrados.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-card-content">
                <h3 className="service-card-title">{service.titulo}</h3>
                <p className="service-card-description">{service.descripcion}</p>
                
                {/* Badges de información */}
                <div className="service-card-badges">
                  <span className="service-badge service-badge-category">
                    {service.categoria}
                  </span>
                  <span className="service-badge service-badge-location">
                    📍 {service.ciudad}
                  </span>
                  <span className="service-badge service-badge-date">
                    📅 {formatDate(service.fechaPreferida)}
                  </span>
                  <span className="service-badge service-badge-quotes">
                    💬 {service.cotizacionesCount} {service.cotizacionesCount === 1 ? 'cotización' : 'cotizaciones'}
                  </span>
                </div>
              </div>

              <div className="service-card-actions">
                <span className={`service-status-badge service-status-${service.estado.toLowerCase()}`}>
                  {getEstadoText(service.estado)}
                </span>
                <Link 
                  to={`/servicios/${service.id}`} 
                  className="service-card-button"
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServicesListPage
