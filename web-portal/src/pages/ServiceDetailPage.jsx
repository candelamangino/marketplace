import { useContext, useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { usersMock } from '../data/usersMock'
import '../styles/serviceDetail.css'

/**
 * Página de detalle de un servicio - ServiceDetailPage
 * 
 * Esta página muestra el detalle completo de un servicio con un layout de dos columnas:
 * 
 * COLUMNA IZQUIERDA:
 * 1. Link "← Volver a servicios"
 * 2. Título del servicio con badge de estado
 * 3. Card "Datos del Servicio" con:
 *    - Descripción
 *    - Categoría
 *    - Fecha Preferida (con icono de calendario)
 *    - Ubicación (con icono de ubicación)
 * 4. Card "Insumos Requeridos" con tabla (Nombre, Cantidad, Unidad)
 * 5. Card "Cotizaciones Recibidas" con:
 *    - Título con contador
 *    - Select "Ordenar por" (Menor Precio, Mayor Precio, Menor Plazo)
 *    - Lista de cotizaciones con: Proveedor, Precio, Plazo, Rating, Botón Seleccionar
 * 
 * COLUMNA DERECHA:
 * 1. Card "Packs de Insumos Disponibles" con lista de packs
 * 2. Card "Información" con:
 *    - ID del servicio
 *    - Cotizaciones recibidas
 *    - Insumos necesarios
 * 
 * Funcionalidades:
 * - Para SOLICITANTE: puede ver y seleccionar cotizaciones
 * - Al seleccionar una cotización, se actualiza el estado del servicio a "ASIGNADO"
 * - Las cotizaciones se pueden ordenar por precio o plazo
 */
const ServiceDetailPage = () => {
  const { id } = useParams() // useParams obtiene los parámetros de la URL (ej: /servicios/:id)
  const { state, dispatch } = useContext(AppContext)
  const { quotes } = state
  const navigate = useNavigate()

  // Estado para el ordenamiento de cotizaciones (solo para SOLICITANTE)
  const [sortOrder, setSortOrder] = useState('precio-asc') // 'precio-asc', 'precio-desc', 'plazo-asc'

  // Estado para el formulario de cotización (solo para PROVEEDOR_SERVICIO)
  const [quoteForm, setQuoteForm] = useState({
    precioTotal: '',
    plazoDias: '',
    notas: ''
  })

  // Validación defensiva: si no hay usuario, mostramos mensaje de carga
  const { currentUser, services } = state
  if (!currentUser) {
    return (
      <div className="service-detail-page">
        <p>Cargando información del servicio...</p>
      </div>
    )
  }

  // Buscamos el servicio por ID (comparando como string para evitar problemas de tipo)
  const service = services.find(s => String(s.id) === String(id))

  // Si no encontramos el servicio, mostramos mensaje de error
  if (!service) {
    return (
      <div className="service-detail-page">
        <p>Servicio no encontrado</p>
        <Link to="/servicios">← Volver a servicios</Link>
      </div>
    )
  }

  // Verificamos que el usuario tenga permiso para ver este servicio
  // Si es SOLICITANTE, solo puede ver sus propios servicios
  if (currentUser.rol === 'SOLICITANTE' && service.solicitanteId !== currentUser.id) {
    return (
      <div className="service-detail-page">
        <p>No tienes permiso para ver este servicio</p>
        <Link to="/servicios">← Volver a servicios</Link>
      </div>
    )
  }

  // Si es PROVEEDOR_SERVICIO, no puede ver servicios que él mismo publicó
  if (currentUser.rol === 'PROVEEDOR_SERVICIO' && service.solicitanteId === currentUser.id) {
    return (
      <div className="service-detail-page">
        <p>No puedes cotizar tus propios servicios</p>
        <Link to="/servicios">← Volver a servicios</Link>
      </div>
    )
  }

  // Buscamos si el proveedor ya tiene una cotización para este servicio
  const miCotizacion = useMemo(() => {
    if (currentUser.rol !== 'PROVEEDOR_SERVICIO') return null
    return quotes.find(
      q => q.serviceId === service.id && q.proveedorServicioId === currentUser.id
    )
  }, [quotes, service.id, currentUser])

  // Si ya existe una cotización, precargamos el formulario
  useEffect(() => {
    if (miCotizacion) {
      setQuoteForm({
        precioTotal: miCotizacion.precioTotal.toString(),
        plazoDias: miCotizacion.plazoDias.toString(),
        notas: miCotizacion.notas || ''
      })
    }
  }, [miCotizacion])
  

  // Obtener las cotizaciones de este servicio
  const serviceQuotes = useMemo(() => {
    return state.quotes.filter(q => q.serviceId === service.id)
  }, [state.quotes, service.id])

  // Ordenar las cotizaciones según el criterio seleccionado
  const sortedQuotes = useMemo(() => {
    const quotes = [...serviceQuotes]
    switch (sortOrder) {
      case 'precio-asc':
        return quotes.sort((a, b) => a.precioTotal - b.precioTotal)
      case 'precio-desc':
        return quotes.sort((a, b) => b.precioTotal - a.precioTotal)
      case 'plazo-asc':
        return quotes.sort((a, b) => a.plazoDias - b.plazoDias)
      default:
        return quotes
    }
  }, [serviceQuotes, sortOrder])

  // Obtener las ofertas de insumos (packs) de este servicio
  const serviceSupplyOffers = useMemo(() => {
    return state.supplyOffers.filter(so => so.serviceId === service.id)
  }, [state.supplyOffers, service.id])

  // Obtener información de los insumos requeridos
  // Compatible con ambos formatos: el nuevo { nombre, cantidad, unidad } y el antiguo { insumoId, cantidad, unidad }
  const insumosRequeridos = useMemo(() => {
    return service.insumosRequeridos.map(req => {
      // Si el insumo tiene nombre directamente (nuevo formato), lo usamos
      if (req.nombre) {
        return {
          nombre: req.nombre,
          cantidad: req.cantidad,
          unidad: req.unidad,
          // Mantenemos compatibilidad con el formato antiguo si existe insumoId
          insumoId: req.insumoId,
          insumo: state.supplies.find(s => s.id === req.insumoId) || null
        }
      }
      // Si tiene insumoId (formato antiguo), buscamos el insumo
      else if (req.insumoId) {
        const insumo = state.supplies.find(s => s.id === req.insumoId)
        return {
          nombre: insumo ? insumo.nombre : 'Insumo no encontrado',
          cantidad: req.cantidad,
          unidad: req.unidad || (insumo ? insumo.unidad : ''),
          insumoId: req.insumoId,
          insumo: insumo
        }
      }
      // Si no tiene ni nombre ni insumoId, retornamos datos básicos
      return {
        nombre: 'Insumo sin nombre',
        cantidad: req.cantidad || 0,
        unidad: req.unidad || '',
        insumo: null
      }
    })
  }, [service.insumosRequeridos, state.supplies])

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
   * Función que obtiene el nombre del proveedor de una cotización
   * Busca el usuario en usersMock importado directamente
   * En una app real, esto vendría de una API o del contexto
   */
  const getProveedorName = (proveedorId) => {
    const proveedor = usersMock.find(u => u.id === proveedorId)
    return proveedor ? proveedor.nombre : `Proveedor ${proveedorId}`
  }

  /**
   * Función que obtiene un rating aleatorio para el proveedor (simulado)
   * En una app real, esto vendría de la base de datos
   */
  const getProveedorRating = (proveedorId) => {
    // Simulamos un rating entre 4.0 y 5.0
    return (4.0 + Math.random() * 1.0).toFixed(1)
  }

  /**
   * Función que maneja la selección de una cotización (solo para SOLICITANTE)
   * Actualiza el estado del servicio a "ASIGNADO" y marca la cotización como "ACEPTADA"
   */
  const handleSelectQuote = (quoteId) => {
    if (window.confirm('¿Estás seguro de seleccionar esta cotización?')) {
      dispatch({
        type: 'SELECT_QUOTE_FOR_SERVICE',
        payload: {
          serviceId: service.id,
          quoteId: quoteId
        }
      })
      // Opcional: mostrar mensaje de éxito
      alert('Cotización seleccionada exitosamente')
    }
  }

  /**
   * Función que maneja el envío del formulario de cotización (solo para PROVEEDOR_SERVICIO)
   * Crea una nueva cotización o actualiza una existente
   */
  const handleSubmitQuote = (e) => {
    e.preventDefault()

    // Validación básica
    if (!quoteForm.precioTotal || !quoteForm.plazoDias) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const precioTotal = parseFloat(quoteForm.precioTotal)
    const plazoDias = parseInt(quoteForm.plazoDias)

    if (isNaN(precioTotal) || precioTotal <= 0) {
      alert('El precio debe ser un número mayor a 0')
      return
    }

    if (isNaN(plazoDias) || plazoDias <= 0) {
      alert('El plazo debe ser un número mayor a 0')
      return
    }

    // Si ya existe una cotización, la actualizamos
    if (miCotizacion) {
      // Solo permitimos editar si el servicio no está ASIGNADO
      if (service.estado === 'ASIGNADO') {
        alert('No puedes editar una cotización de un servicio ya asignado')
        return
      }

      dispatch({
        type: 'UPDATE_QUOTE',
        payload: {
          id: miCotizacion.id,
          precioTotal: precioTotal,
          plazoDias: plazoDias,
          notas: quoteForm.notas
        }
      })
      alert('Cotización actualizada exitosamente')
    } else {
      // Creamos una nueva cotización
      const nuevaCotizacion = {
        id: `quote-${Date.now()}`, // ID temporal (en producción vendría del backend)
        serviceId: service.id,
        proveedorServicioId: currentUser.id,
        precioTotal: precioTotal,
        plazoDias: plazoDias,
        notas: quoteForm.notas,
        estado: 'PENDIENTE',
        fechaCreacion: new Date().toISOString()
      }

      dispatch({
        type: 'CREATE_QUOTE',
        payload: nuevaCotizacion
      })
      alert('Cotización enviada exitosamente')
    }

    // Redirigimos a la lista de cotizaciones
    navigate('/cotizaciones')
  }

  /**
   * Función que maneja la eliminación de una cotización (solo para PROVEEDOR_SERVICIO)
   */
  const handleDeleteQuote = () => {
    if (!miCotizacion) return

    // Solo permitimos eliminar si el servicio no está ASIGNADO
    if (service.estado === 'ASIGNADO') {
      alert('No puedes eliminar una cotización de un servicio ya asignado')
      return
    }

    if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
      dispatch({
        type: 'DELETE_QUOTE',
        payload: miCotizacion.id
      })
      alert('Cotización eliminada exitosamente')
      navigate('/cotizaciones')
    }
  }

  return (
    <div className="service-detail-page">
      {/* Link de volver */}
      <Link to="/servicios" className="service-detail-back">
        ← Volver a servicios
      </Link>

      {/* Header: Título y badge de estado */}
      <div className="service-detail-header">
        <h1 className="service-detail-title">{service.titulo}</h1>
        <span className={`service-detail-status service-status-${service.estado.toLowerCase()}`}>
          {getEstadoText(service.estado)}
        </span>
      </div>

      {/* Layout de dos columnas */}
      <div className="service-detail-layout">
        {/* COLUMNA IZQUIERDA */}
        <div className="service-detail-left">
          {/* Card: Datos del Servicio */}
          <div className="service-detail-card">
            <h2 className="service-card-title">
              <span className="service-card-icon">📦</span>
              Datos del Servicio
            </h2>
            <div className="service-data-content">
              <div className="service-data-item">
                <span className="service-data-label">Descripción:</span>
                <span className="service-data-value">{service.descripcion}</span>
              </div>
              <div className="service-data-item">
                <span className="service-data-label">Categoría:</span>
                <span className="service-data-value">{service.categoria}</span>
              </div>
              <div className="service-data-item">
                <span className="service-data-label">
                  <span className="service-data-icon">📅</span>
                  Fecha Preferida:
                </span>
                <span className="service-data-value">{formatDate(service.fechaPreferida)}</span>
              </div>
              <div className="service-data-item">
                <span className="service-data-label">
                  <span className="service-data-icon">📍</span>
                  Ubicación:
                </span>
                <span className="service-data-value">{service.direccion}, {service.ciudad}</span>
              </div>
            </div>
          </div>

          {/* Card: Insumos Requeridos */}
          <div className="service-detail-card">
            <h2 className="service-card-title">
              <span className="service-card-icon">📦</span>
              Insumos Requeridos
            </h2>
            {insumosRequeridos.length === 0 ? (
              <p className="service-empty-text">No se requieren insumos específicos.</p>
            ) : (
              <table className="service-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosRequeridos.map((req, idx) => (
                    <tr key={idx}>
                      <td>{req.nombre || (req.insumo ? req.insumo.nombre : 'Insumo no encontrado')}</td>
                      <td>{req.cantidad}</td>
                      <td>{req.unidad || (req.insumo ? req.insumo.unidad : '-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Card: Cotizaciones Recibidas (solo para SOLICITANTE) */}
          {currentUser.rol === 'SOLICITANTE' && (
            <div className="service-detail-card">
              <div className="service-card-header">
                <h2 className="service-card-title">
                  <span className="service-card-icon">📄</span>
                  Cotizaciones Recibidas ({serviceQuotes.length})
                </h2>
                {serviceQuotes.length > 0 && (
                  <select
                    className="service-sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="precio-asc">Ordenar por: Menor Precio</option>
                    <option value="precio-desc">Ordenar por: Mayor Precio</option>
                    <option value="plazo-asc">Ordenar por: Menor Plazo</option>
                  </select>
                )}
              </div>
              {serviceQuotes.length === 0 ? (
                <p className="service-empty-text">Aún no has recibido cotizaciones.</p>
              ) : (
                <div className="quotes-list">
                  {sortedQuotes.map(quote => (
                    <div key={quote.id} className="quote-card">
                      <div className="quote-card-content">
                        <div className="quote-provider">
                          <span className="quote-provider-name">
                            {getProveedorName(quote.proveedorServicioId)}
                          </span>
                          <span className="quote-rating">
                            ⭐ {getProveedorRating(quote.proveedorServicioId)}
                          </span>
                        </div>
                        <div className="quote-details">
                          <span className="quote-price">${quote.precioTotal.toLocaleString()}</span>
                          <span className="quote-plazo">{quote.plazoDias} {quote.plazoDias === 1 ? 'día' : 'días'}</span>
                        </div>
                      </div>
                      <div className="quote-card-actions">
                        {service.estado !== 'ASIGNADO' && quote.estado === 'PENDIENTE' && (
                          <button
                            className="quote-select-button"
                            onClick={() => handleSelectQuote(quote.id)}
                          >
                            Seleccionar
                          </button>
                        )}
                        {service.estado === 'ASIGNADO' && quote.id === service.cotizacionSeleccionadaId && (
                          <span className="quote-selected">Seleccionada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card: Formulario de Cotización (solo para PROVEEDOR_SERVICIO) */}
          {currentUser.rol === 'PROVEEDOR_SERVICIO' && service.estado !== 'ASIGNADO' && service.estado !== 'COMPLETADO' && (
            <div className="service-detail-card">
              <h2 className="service-card-title">
                <span className="service-card-icon">📝</span>
                {miCotizacion ? 'Editar Mi Cotización' : 'Enviar Cotización'}
              </h2>
              <form onSubmit={handleSubmitQuote} className="quote-form">
                <div className="quote-form-field">
                  <label htmlFor="precioTotal" className="quote-form-label">
                    Precio Total ($) <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="number"
                    id="precioTotal"
                    className="quote-form-input"
                    value={quoteForm.precioTotal}
                    onChange={(e) => setQuoteForm({ ...quoteForm, precioTotal: e.target.value })}
                    placeholder="Ej: 15000"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div className="quote-form-field">
                  <label htmlFor="plazoDias" className="quote-form-label">
                    Plazo (días) <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="number"
                    id="plazoDias"
                    className="quote-form-input"
                    value={quoteForm.plazoDias}
                    onChange={(e) => setQuoteForm({ ...quoteForm, plazoDias: e.target.value })}
                    placeholder="Ej: 3"
                    min="1"
                    required
                  />
                </div>

                <div className="quote-form-field">
                  <label htmlFor="notas" className="quote-form-label">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="notas"
                    className="quote-form-textarea"
                    value={quoteForm.notas}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notas: e.target.value })}
                    placeholder="Agrega notas adicionales sobre tu cotización..."
                    rows="4"
                  />
                </div>

                <div className="quote-form-actions">
                  <button type="submit" className="quote-form-submit">
                    {miCotizacion ? 'Actualizar Cotización' : 'Enviar Cotización'}
                  </button>
                  {miCotizacion && (
                    <button
                      type="button"
                      className="quote-form-delete"
                      onClick={handleDeleteQuote}
                    >
                      Eliminar Cotización
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Mensaje si el servicio ya está asignado o completado */}
          {currentUser.rol === 'PROVEEDOR_SERVICIO' && (service.estado === 'ASIGNADO' || service.estado === 'COMPLETADO') && (
            <div className="service-detail-card">
              <p className="service-empty-text">
                Este servicio ya está {service.estado === 'ASIGNADO' ? 'asignado' : 'completado'}. 
                No puedes enviar cotizaciones.
              </p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="service-detail-right">
          {/* Card: Packs de Insumos Disponibles */}
          <div className="service-detail-card">
            <h2 className="service-card-title">
              <span className="service-card-icon">📦</span>
              Packs de Insumos Disponibles
            </h2>
            {serviceSupplyOffers.length === 0 ? (
              <p className="service-empty-text">No hay packs de insumos disponibles.</p>
            ) : (
              <div className="supply-packs-list">
                {serviceSupplyOffers.map(offer => (
                  <div key={offer.id} className="supply-pack-card">
                    <h3 className="supply-pack-name">{offer.nombre}</h3>
                    <p className="supply-pack-price">${offer.precioTotal.toLocaleString()}</p>
                    <div className="supply-pack-items">
                      <p className="supply-pack-label">Incluye:</p>
                      <ul className="supply-pack-list">
                        {offer.items.map((item, idx) => {
                          const insumo = state.supplies.find(s => s.id === item.insumoId)
                          return (
                            <li key={idx}>
                              {insumo ? insumo.nombre : 'Insumo no encontrado'} - {item.cantidad} {insumo ? insumo.unidad : ''}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Información */}
          <div className="service-detail-card">
            <h2 className="service-card-title">Información</h2>
            <div className="service-info-content">
              <div className="service-info-item">
                <span className="service-info-label">ID del servicio:</span>
                <span className="service-info-value">{service.id}</span>
              </div>
              <div className="service-info-item">
                <span className="service-info-label">Cotizaciones recibidas:</span>
                <span className="service-info-value">{serviceQuotes.length}</span>
              </div>
              <div className="service-info-item">
                <span className="service-info-label">Insumos necesarios:</span>
                <span className="service-info-value">{insumosRequeridos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetailPage
