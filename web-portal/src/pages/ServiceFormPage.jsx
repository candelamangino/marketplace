import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import '../styles/serviceForm.css'

/**
 * Página de formulario para crear un nuevo servicio - ServiceFormPage
 * 
 * Esta página permite a los usuarios con rol SOLICITANTE crear un nuevo servicio.
 * El formulario está dividido en tres secciones principales:
 * 1. Datos Básicos: título, descripción, categoría, fecha preferida
 * 2. Ubicación: dirección y ciudad
 * 3. Insumos Requeridos: lista de insumos necesarios para el servicio
 * 
 * Cada sección está en un card blanco con borde gris suave y sombra sutil.
 * Al final hay dos botones: "Publicar Servicio" (azul) y "Cancelar" (gris claro).
 */
const ServiceFormPage = () => {
  // Obtenemos el contexto para acceder al estado y dispatch
  const { state, dispatch } = useContext(AppContext)
  const navigate = useNavigate()

  // Estado del formulario principal
  const [formData, setFormData] = useState({
    titulo: '', // Título del servicio
    descripcion: '', // Descripción detallada
    categoria: '', // Categoría del servicio
    fechaPreferida: '', // Fecha preferida para realizar el servicio
    direccion: '', // Dirección donde se realizará el servicio
    ciudad: '', // Ciudad donde se realizará el servicio
    insumosRequeridos: [] // Lista de insumos requeridos
  })

  // Estado para el insumo que se está agregando actualmente
  const [insumoActual, setInsumoActual] = useState({
    insumoId: '', // ID del insumo seleccionado (si es predefinido)
    nombrePersonalizado: '', // Nombre personalizado si se selecciona "Otro"
    tipoNombre: 'PREDEFINIDO', // 'PREDEFINIDO' o 'OTRO'
    cantidad: '', // Cantidad requerida
    unidad: '' // Unidad de medida (editable por el usuario)
  })

  // Categorías disponibles para los servicios
  const categorias = [
    'Electricidad',
    'Construcción',
    'Pintura',
    'Plomería',
    'Climatización',
    'Carpintería',
    'Jardinería',
    'Otro'
  ]

  /**
   * Función que maneja los cambios en los campos del formulario
   * Actualiza el estado formData cuando el usuario escribe en los inputs
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Función que maneja los cambios en los campos del insumo actual
   * Actualiza el estado insumoActual cuando el usuario selecciona un insumo o ingresa cantidad
   */
  const handleInsumoChange = (field, value) => {
    setInsumoActual(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Función que agrega un insumo a la lista de insumos requeridos
   * Valida que haya un insumo seleccionado (predefinido o personalizado) y una cantidad ingresada
   * Resuelve el nombre final: si es PREDEFINIDO usa el nombre del insumo, si es OTRO usa el nombre personalizado
   */
  const handleAddInsumo = () => {
    // Validamos que haya un nombre definido (predefinido o personalizado) y una cantidad
    const nombreInsumo = insumoActual.tipoNombre === 'PREDEFINIDO' 
      ? insumoActual.insumoId 
      : insumoActual.nombrePersonalizado

    if (!nombreInsumo || !insumoActual.cantidad || !insumoActual.unidad) {
      alert('Por favor completa todos los campos: nombre del insumo, cantidad y unidad')
      return
    }

    // Si es "Otro", validamos que el nombre personalizado no esté vacío
    if (insumoActual.tipoNombre === 'OTRO' && !insumoActual.nombrePersonalizado.trim()) {
      alert('Por favor ingresa un nombre para el insumo')
      return
    }

    // Resolvemos el nombre final: si es predefinido, obtenemos el nombre del insumo; si es OTRO, usamos el personalizado
    let nombreFinal = ''
    if (insumoActual.tipoNombre === 'PREDEFINIDO') {
      const insumoSeleccionado = state.supplies.find(s => s.id === insumoActual.insumoId)
      nombreFinal = insumoSeleccionado ? insumoSeleccionado.nombre : 'Insumo no encontrado'
    } else {
      nombreFinal = insumoActual.nombrePersonalizado.trim()
    }

    // Agregamos el insumo a la lista de insumos requeridos con el formato: { nombre, cantidad, unidad }
    setFormData(prev => ({
      ...prev,
      insumosRequeridos: [
        ...prev.insumosRequeridos,
        {
          nombre: nombreFinal,
          cantidad: parseInt(insumoActual.cantidad),
          unidad: insumoActual.unidad.trim()
        }
      ]
    }))

    // Limpiamos el formulario del insumo actual
    setInsumoActual({ 
      insumoId: '', 
      nombrePersonalizado: '', 
      tipoNombre: 'PREDEFINIDO',
      cantidad: '', 
      unidad: '' 
    })
  }

  /**
   * Función que elimina un insumo de la lista de insumos requeridos
   * Recibe el índice del insumo a eliminar
   */
  const handleRemoveInsumo = (index) => {
    setFormData(prev => ({
      ...prev,
      insumosRequeridos: prev.insumosRequeridos.filter((_, i) => i !== index)
    }))
  }

  /**
   * Función que maneja el envío del formulario
   * Crea un nuevo servicio y lo agrega al estado global
   */
  const handleSubmit = (e) => {
    e.preventDefault() // Previene el comportamiento por defecto del formulario

    // Creamos el objeto del nuevo servicio
    const newService = {
      id: Date.now().toString(), // ID temporal basado en timestamp
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      fechaPreferida: formData.fechaPreferida,
      estado: 'PUBLICADO', // Estado inicial del servicio
      solicitanteId: state.currentUser.id, // ID del usuario que crea el servicio
      insumosRequeridos: formData.insumosRequeridos, // Lista de insumos requeridos
      cotizacionesIds: [], // Lista vacía de cotizaciones inicialmente
      cotizacionSeleccionadaId: null // No hay cotización seleccionada inicialmente
    }

    // Despachamos la acción para crear el servicio
    dispatch({ type: 'CREATE_SERVICE', payload: newService })

    // Redirigimos al usuario a la página de listado de servicios
    navigate('/servicios')
  }

  /**
   * Función que maneja el click en el botón Cancelar
   * Redirige al usuario a la página de listado de servicios sin guardar cambios
   */
  const handleCancel = () => {
    navigate('/servicios')
  }

  return (
    <div className="service-form-page">
      {/* Header: Título y subtítulo */}
      <div className="service-form-header">
        <h1 className="service-form-title">Publicar Nuevo Servicio</h1>
        <p className="service-form-subtitle">
          Completa la información del servicio que necesitas
        </p>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="service-form">
        
        {/* Sección 1: Datos Básicos */}
        <div className="form-section">
          <h2 className="form-section-title">Datos Básicos</h2>
          
          {/* Campo: Título del servicio */}
          <div className="form-field">
            <label htmlFor="titulo" className="form-label">
              Titulo del servicio <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              className="form-input"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ej: Limpieza de jardín residencial"
              required
            />
          </div>

          {/* Campo: Descripción detallada */}
          <div className="form-field">
            <label htmlFor="descripcion" className="form-label">
              Descripción detallada <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="descripcion"
              className="form-textarea"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe el servicio que necesitas..."
              rows="4"
              required
            />
          </div>

          {/* Campo: Categoría */}
          <div className="form-field">
            <label htmlFor="categoria" className="form-label">
              Categoría <span className="required-asterisk">*</span>
            </label>
            <select
              id="categoria"
              className="form-select"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Campo: Fecha preferida */}
          <div className="form-field">
            <label htmlFor="fechaPreferida" className="form-label">
              Fecha preferida <span className="required-asterisk">*</span>
            </label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="fechaPreferida"
                className="form-input form-date-input"
                value={formData.fechaPreferida}
                onChange={(e) => handleInputChange('fechaPreferida', e.target.value)}
                placeholder="dd/mm/aaaa"
                required
              />
              <span className="date-icon">📅</span>
            </div>
          </div>
        </div>

        {/* Sección 2: Ubicación */}
        <div className="form-section">
          <h2 className="form-section-title">Ubicación</h2>
          
          {/* Campo: Dirección */}
          <div className="form-field">
            <label htmlFor="direccion" className="form-label">
              Dirección <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="direccion"
              className="form-input"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Ej: Av. Libertador 1234"
              required
            />
          </div>

          {/* Campo: Ciudad */}
          <div className="form-field">
            <label htmlFor="ciudad" className="form-label">
              Ciudad <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="ciudad"
              className="form-input"
              value={formData.ciudad}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              placeholder="Ej: Buenos Aires"
              required
            />
          </div>
        </div>

        {/* Sección 3: Insumos Requeridos */}
        <div className="form-section">
          <h2 className="form-section-title">Insumos Requeridos</h2>
          <p className="form-section-description">
            Agrega todos los insumos que necesitas para este servicio. Los proveedores podrán ver esta lista al cotizar.
          </p>
          
          {/* Contenedor para agregar insumos */}
          <div className="insumos-add-container">
            {/* Campo: Nombre del insumo (select con opción "Otro") */}
            <div className="insumo-field">
              <label htmlFor="insumoId" className="form-label">
                Nombre del insumo
              </label>
              <select
                id="insumoId"
                className="form-select"
                value={insumoActual.tipoNombre === 'PREDEFINIDO' ? insumoActual.insumoId : 'OTRO'}
                onChange={(e) => {
                  if (e.target.value === 'OTRO') {
                    // Si selecciona "Otro", cambiamos el tipo y limpiamos el insumoId
                    handleInsumoChange('tipoNombre', 'OTRO')
                    handleInsumoChange('insumoId', '')
                  } else {
                    // Si selecciona un insumo predefinido, actualizamos el tipo y el insumoId
                    handleInsumoChange('tipoNombre', 'PREDEFINIDO')
                    handleInsumoChange('insumoId', e.target.value)
                    // Actualizamos la unidad cuando se selecciona un insumo (pero el usuario puede cambiarla)
                    const insumo = state.supplies.find(s => s.id === e.target.value)
                    if (insumo && !insumoActual.unidad) {
                      handleInsumoChange('unidad', insumo.unidad)
                    }
                  }
                }}
              >
                <option value="">Selecciona un insumo</option>
                {state.supplies.map(supply => (
                  <option key={supply.id} value={supply.id}>
                    {supply.nombre} ({supply.unidad})
                  </option>
                ))}
                <option value="OTRO">Otro (personalizado)</option>
              </select>
              
              {/* Campo de texto para nombre personalizado (se muestra solo si se selecciona "Otro") */}
              {insumoActual.tipoNombre === 'OTRO' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '8px' }}
                  value={insumoActual.nombrePersonalizado}
                  onChange={(e) => handleInsumoChange('nombrePersonalizado', e.target.value)}
                  placeholder="Ingresa el nombre del insumo"
                />
              )}
            </div>

            {/* Campo: Cantidad */}
            <div className="insumo-field insumo-field-small">
              <label htmlFor="cantidad" className="form-label">
                Cantidad
              </label>
              <input
                type="number"
                id="cantidad"
                className="form-input"
                value={insumoActual.cantidad}
                onChange={(e) => handleInsumoChange('cantidad', e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            {/* Campo: Unidades (editable por el usuario - puede elegir de la lista o escribir libremente) */}
            <div className="insumo-field insumo-field-small">
              <label htmlFor="unidad" className="form-label">
                Unidad
              </label>
              <input
                type="text"
                id="unidad"
                className="form-input"
                value={insumoActual.unidad}
                onChange={(e) => handleInsumoChange('unidad', e.target.value)}
                placeholder="Ej: kg, litro, unidad, m²"
                list="unidades-sugeridas"
              />
              {/* Datalist con sugerencias de unidades comunes */}
              <datalist id="unidades-sugeridas">
                <option value="kg" />
                <option value="litro" />
                <option value="litros" />
                <option value="unidad" />
                <option value="unidades" />
                <option value="metro" />
                <option value="metros" />
                <option value="m²" />
                <option value="m³" />
                <option value="balde" />
                <option value="caja" />
                <option value="paquete" />
              </datalist>
            </div>

            {/* Botón: Agregar Insumo */}
            <div className="insumo-field insumo-field-button">
              <label className="form-label form-label-invisible">Acción</label>
              <button
                type="button"
                className="insumo-add-button"
                onClick={handleAddInsumo}
                disabled={
                  (!insumoActual.insumoId && insumoActual.tipoNombre === 'PREDEFINIDO') ||
                  (insumoActual.tipoNombre === 'OTRO' && !insumoActual.nombrePersonalizado.trim()) ||
                  !insumoActual.cantidad ||
                  !insumoActual.unidad
                }
              >
                + Agregar Insumo
              </button>
            </div>
          </div>

          {/* Lista de insumos agregados */}
          {formData.insumosRequeridos.length > 0 && (
            <div className="insumos-list">
              {formData.insumosRequeridos.map((req, index) => {
                // Ahora los insumos tienen formato { nombre, cantidad, unidad }
                return (
                  <div key={index} className="insumo-item">
                    <span className="insumo-item-text">
                      {req.nombre} - {req.cantidad} {req.unidad || ''}
                    </span>
                    <button
                      type="button"
                      className="insumo-remove-button"
                      onClick={() => handleRemoveInsumo(index)}
                      aria-label="Eliminar insumo"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Botones de acción finales */}
        <div className="form-actions">
          <button
            type="button"
            className="form-button form-button-cancel"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="form-button form-button-submit"
          >
            Publicar Servicio
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceFormPage
