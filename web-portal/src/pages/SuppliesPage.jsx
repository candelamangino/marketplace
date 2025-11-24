import { useState, useMemo } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/supplierCatalog.css'

/**
 * Página de Catálogo de Insumos - SupplierCatalogPage
 * 
 * Esta página permite al PROVEEDOR_INSUMOS gestionar su catálogo de insumos:
 * 
 * 1. Título "Catálogo de Insumos" con subtítulo
 * 2. Cards de estadísticas:
 *    - Insumos en Catálogo
 *    - Stock Total
 *    - Packs Disponibles
 * 3. Botón "+ Agregar Insumo"
 * 4. Formulario "Agregar Nuevo Insumo" (se muestra al hacer clic en el botón)
 * 5. Barra de búsqueda y filtro por categoría
 * 6. Tabla "Mis Insumos" con columnas: Nombre, Categoría, Unidad, Precio Unitario, Stock, Acciones
 * 7. Sección "Packs de Insumos" con cards de packs y botón "+ Crear Pack"
 * 
 * Funcionalidades:
 * - Crear nuevos insumos asociados al proveedor actual
 * - Editar insumos existentes (precio y stock)
 * - Filtrar insumos por búsqueda de texto y categoría
 * - Ver packs de insumos del proveedor
 * 
 * Los datos se obtienen del contexto global (supplies, supplyOffers).
 */
const SuppliesPage = () => {
  const { state, dispatch } = useContext(AppContext)
  const navigate = useNavigate()
  const { currentUser, supplies, supplyOffers } = state

  // Estado para mostrar/ocultar el formulario de insumo
  const [showForm, setShowForm] = useState(false)
  const [editingSupply, setEditingSupply] = useState(null)

  // Estado para mostrar/ocultar el formulario de pack
  const [showPackForm, setShowPackForm] = useState(false)
  const [editingPack, setEditingPack] = useState(null)

  // Estado para los filtros
  const [filters, setFilters] = useState({
    search: '',
    categoria: ''
  })

  // Estado del formulario de insumo
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    unidad: '',
    precioUnitario: '',
    stock: ''
  })

  // Estado del formulario de pack
  const [packFormData, setPackFormData] = useState({
    nombre: '',
    serviceId: '', // Opcional: puede estar vinculado a un servicio
    precioTotal: '',
    notas: '',
    items: [] // Array de { insumoId, cantidad }
  })

  // Estado para el item de pack que se está agregando
  const [packItemActual, setPackItemActual] = useState({
    insumoId: '',
    cantidad: ''
  })

  // Si no hay usuario o no es PROVEEDOR_INSUMOS, no mostramos nada
  if (!currentUser || currentUser.rol !== 'PROVEEDOR_INSUMOS') {
    return <div>Cargando...</div>
  }

  // Insumos del proveedor actual
  const misInsumos = useMemo(() => {
    return supplies.filter(s => s.proveedorInsumosId === currentUser.id)
  }, [supplies, currentUser])

  // Packs del proveedor actual
  const misPacks = useMemo(() => {
    return supplyOffers.filter(so => so.proveedorInsumosId === currentUser.id)
  }, [supplyOffers, currentUser])

  // Calculamos las estadísticas
  const stats = useMemo(() => {
    // Insumos en catálogo del proveedor actual
    const insumosEnCatalogo = misInsumos.length

    // Stock total (suma de todos los stocks de insumos del proveedor)
    const stockTotal = misInsumos.reduce((total, insumo) => total + (insumo.stock || 0), 0)

    // Packs disponibles del proveedor actual
    const packsDisponibles = misPacks.length

    return {
      insumosEnCatalogo,
      stockTotal,
      packsDisponibles
    }
  }, [misInsumos, misPacks])

  // Categorías disponibles (extraídas de los insumos existentes)
  const categorias = useMemo(() => {
    const cats = new Set()
    misInsumos.forEach(insumo => {
      if (insumo.categoria) {
        cats.add(insumo.categoria)
      }
    })
    return Array.from(cats).sort()
  }, [misInsumos])

  // Unidades disponibles
  const unidades = ['unidad', 'metro', 'kg', 'litro', 'balde', 'caja', 'paquete']

  // Filtramos los insumos según los filtros
  const insumosFiltrados = useMemo(() => {
    return misInsumos.filter(insumo => {
      // Filtro por búsqueda de texto (nombre)
      const matchesSearch = filters.search === '' || 
        insumo.nombre.toLowerCase().includes(filters.search.toLowerCase())

      // Filtro por categoría
      const matchesCategoria = filters.categoria === '' || 
        insumo.categoria === filters.categoria

      return matchesSearch && matchesCategoria
    })
  }, [misInsumos, filters])

  /**
   * Función para abrir formulario de creación
   * Limpia el formulario y lo muestra
   */
  const handleAddInsumo = () => {
    setEditingSupply(null)
    setFormData({
      nombre: '',
      categoria: '',
      unidad: '',
      precioUnitario: '',
      stock: ''
    })
    setShowForm(true)
  }

  /**
   * Función para abrir formulario de edición
   * Precarga los datos del insumo seleccionado
   */
  const handleEdit = (supply) => {
    setEditingSupply(supply)
    setFormData({
      nombre: supply.nombre,
      categoria: supply.categoria,
      unidad: supply.unidad,
      precioUnitario: supply.precioUnitario.toString(),
      stock: supply.stock.toString()
    })
    setShowForm(true)
  }

  /**
   * Función para limpiar formulario y ocultarlo
   */
  const handleCancel = () => {
    setShowForm(false)
    setEditingSupply(null)
    setFormData({
      nombre: '',
      categoria: '',
      unidad: '',
      precioUnitario: '',
      stock: ''
    })
  }

  /**
   * Función para crear/actualizar insumo
   * Despacha la acción correspondiente al reducer
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingSupply) {
      // Actualizar insumo existente
      dispatch({
        type: 'UPDATE_SUPPLY',
        payload: {
          id: editingSupply.id,
          nombre: formData.nombre,
          categoria: formData.categoria,
          unidad: formData.unidad,
          precioUnitario: parseFloat(formData.precioUnitario),
          stock: parseInt(formData.stock)
        }
      })
    } else {
      // Crear nuevo insumo
      const newSupply = {
        id: `supply-${Date.now()}`, // ID temporal (en producción vendría del backend)
        nombre: formData.nombre,
        categoria: formData.categoria,
        unidad: formData.unidad,
        precioUnitario: parseFloat(formData.precioUnitario),
        stock: parseInt(formData.stock),
        proveedorInsumosId: currentUser.id
      }
      dispatch({ type: 'CREATE_SUPPLY', payload: newSupply })
    }

    handleCancel()
  }

  /**
   * Función que obtiene el nombre de un insumo por su ID
   * Para mostrar en los packs
   */
  const getInsumoName = (insumoId) => {
    const insumo = supplies.find(s => s.id === insumoId)
    return insumo ? insumo.nombre : 'Insumo no encontrado'
  }

  /**
   * Función que obtiene la unidad de un insumo por su ID
   * Para mostrar en los packs
   */
  const getInsumoUnidad = (insumoId) => {
    const insumo = supplies.find(s => s.id === insumoId)
    return insumo ? insumo.unidad : ''
  }

  /**
   * Función para abrir formulario de creación de pack
   * Limpia el formulario y lo muestra
   */
  const handleCreatePack = () => {
    setEditingPack(null)
    setPackFormData({
      nombre: '',
      serviceId: '',
      precioTotal: '',
      notas: '',
      items: []
    })
    setPackItemActual({
      insumoId: '',
      cantidad: ''
    })
    setShowPackForm(true)
  }

  /**
   * Función para abrir formulario de edición de pack
   * Precarga los datos del pack seleccionado
   */
  const handleEditPack = (pack) => {
    setEditingPack(pack)
    setPackFormData({
      nombre: pack.nombre || '',
      serviceId: pack.serviceId || '',
      precioTotal: pack.precioTotal.toString(),
      notas: pack.notas || '',
      items: pack.items || []
    })
    setPackItemActual({
      insumoId: '',
      cantidad: ''
    })
    setShowPackForm(true)
  }

  /**
   * Función para cerrar formulario de pack
   */
  const handleCancelPack = () => {
    setShowPackForm(false)
    setEditingPack(null)
    setPackFormData({
      nombre: '',
      serviceId: '',
      precioTotal: '',
      notas: '',
      items: []
    })
    setPackItemActual({
      insumoId: '',
      cantidad: ''
    })
  }

  /**
   * Función para agregar un item al pack actual
   */
  const handleAddPackItem = () => {
    if (!packItemActual.insumoId || !packItemActual.cantidad || parseInt(packItemActual.cantidad) <= 0) {
      alert('Por favor selecciona un insumo e ingresa una cantidad válida')
      return
    }

    // Verificamos que el insumo no esté ya en la lista
    const yaExiste = packFormData.items.some(item => item.insumoId === packItemActual.insumoId)
    if (yaExiste) {
      alert('Este insumo ya está en el pack. Puedes editar la cantidad desde la lista.')
      return
    }

    // Agregamos el item al pack
    setPackFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          insumoId: packItemActual.insumoId,
          cantidad: parseInt(packItemActual.cantidad)
        }
      ]
    }))

    // Limpiamos el formulario del item actual
    setPackItemActual({
      insumoId: '',
      cantidad: ''
    })
  }

  /**
   * Función para eliminar un item del pack
   */
  const handleRemovePackItem = (index) => {
    setPackFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  /**
   * Función para crear/actualizar pack
   */
  const handleSubmitPack = (e) => {
    e.preventDefault()

    // Validaciones
    if (!packFormData.nombre.trim()) {
      alert('Por favor ingresa un nombre para el pack')
      return
    }

    if (packFormData.items.length === 0) {
      alert('El pack debe tener al menos un insumo')
      return
    }

    if (!packFormData.precioTotal || parseFloat(packFormData.precioTotal) <= 0) {
      alert('Por favor ingresa un precio total válido mayor a 0')
      return
    }

    const precioTotal = parseFloat(packFormData.precioTotal)

    if (editingPack) {
      // Actualizar pack existente
      dispatch({
        type: 'UPDATE_SUPPLY_OFFER',
        payload: {
          id: editingPack.id,
          nombre: packFormData.nombre.trim(),
          serviceId: packFormData.serviceId || null,
          proveedorInsumosId: currentUser.id, // Mantener el proveedor original
          precioTotal: precioTotal,
          notas: packFormData.notas.trim() || undefined,
          items: packFormData.items
        }
      })
      alert('Pack actualizado exitosamente')
    } else {
      // Crear nuevo pack
      const nuevoPack = {
        id: `pack-${Date.now()}`, // ID temporal (en producción vendría del backend)
        nombre: packFormData.nombre.trim(),
        serviceId: packFormData.serviceId || null,
        proveedorInsumosId: currentUser.id,
        precioTotal: precioTotal,
        notas: packFormData.notas.trim() || undefined,
        items: packFormData.items,
        fechaCreacion: new Date().toISOString()
      }
      dispatch({ type: 'CREATE_SUPPLY_OFFER', payload: nuevoPack })
      alert('Pack creado exitosamente')
    }

    handleCancelPack()
  }

  return (
    <div className="supplier-catalog-page">
      {/* Header: Título y subtítulo */}
      <div className="catalog-header">
        <h1 className="catalog-title">Catálogo de Insumos</h1>
        <p className="catalog-subtitle">
          Gestiona tu catálogo de insumos disponibles
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="catalog-stats">
        {/* Card: Insumos en Catálogo */}
        <div className="catalog-stat-card">
          <div className="catalog-stat-icon">📦</div>
          <div className="catalog-stat-content">
            <div className="catalog-stat-number">{stats.insumosEnCatalogo}</div>
            <div className="catalog-stat-label">Insumos en Catálogo</div>
          </div>
        </div>

        {/* Card: Stock Total */}
        <div className="catalog-stat-card">
          <div className="catalog-stat-icon">📊</div>
          <div className="catalog-stat-content">
            <div className="catalog-stat-number">{stats.stockTotal}</div>
            <div className="catalog-stat-label">Stock Total</div>
          </div>
        </div>

        {/* Card: Packs Disponibles */}
        <div className="catalog-stat-card">
          <div className="catalog-stat-icon">💰</div>
          <div className="catalog-stat-content">
            <div className="catalog-stat-number">{stats.packsDisponibles}</div>
            <div className="catalog-stat-label">Packs Disponibles</div>
          </div>
        </div>
      </div>

      {/* Botón "Agregar Insumo" */}
      <div className="catalog-actions">
        <button
          type="button"
          className="catalog-add-button"
          onClick={handleAddInsumo}
        >
          + Agregar Insumo
        </button>
      </div>

      {/* Formulario "Agregar Nuevo Insumo" */}
      {showForm && (
        <div className="catalog-form-card">
          <h2 className="catalog-form-title">
            {editingSupply ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}
          </h2>
          <form onSubmit={handleSubmit} className="catalog-form">
            <div className="catalog-form-field">
              <label htmlFor="nombre" className="catalog-form-label">
                Nombre del insumo <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                className="catalog-form-input"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cloro en polvo"
                required
              />
            </div>

            <div className="catalog-form-field">
              <label htmlFor="categoria" className="catalog-form-label">
                Categoría <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id="categoria"
                className="catalog-form-input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ej: Piscinas"
                required
              />
            </div>

            <div className="catalog-form-field">
              <label htmlFor="unidad" className="catalog-form-label">
                Unidad <span className="required-asterisk">*</span>
              </label>
              <select
                id="unidad"
                className="catalog-form-select"
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                required
              >
                <option value="">Selecciona una unidad</option>
                {unidades.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="catalog-form-field">
              <label htmlFor="precioUnitario" className="catalog-form-label">
                Precio unitario ($) <span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                id="precioUnitario"
                className="catalog-form-input"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                placeholder="850"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="catalog-form-field">
              <label htmlFor="stock" className="catalog-form-label">
                Stock <span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                id="stock"
                className="catalog-form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                min="0"
                required
              />
            </div>

            <div className="catalog-form-actions">
              <button type="submit" className="catalog-form-submit">
                {editingSupply ? 'Actualizar Insumo' : 'Agregar Insumo'}
              </button>
              <button type="button" className="catalog-form-cancel" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="catalog-filters">
        <div className="catalog-filter-group">
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Buscar insumos..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="catalog-filter-group">
          <select
            className="catalog-filter-select"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla "Mis Insumos" */}
      <div className="catalog-section">
        <h2 className="catalog-section-title">
          Mis Insumos ({insumosFiltrados.length})
        </h2>
        {insumosFiltrados.length === 0 ? (
          <div className="catalog-empty-state">
            <p>No se encontraron insumos.</p>
          </div>
        ) : (
          <div className="catalog-table-container">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Precio Unitario</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map(supply => (
                  <tr key={supply.id}>
                    <td>{supply.nombre}</td>
                    <td>{supply.categoria}</td>
                    <td>{supply.unidad}</td>
                    <td>${supply.precioUnitario.toLocaleString()}</td>
                    <td className="stock-cell">{supply.stock}</td>
                    <td>
                      <button
                        className="catalog-edit-button"
                        onClick={() => handleEdit(supply)}
                        title="Editar insumo"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección "Packs de Insumos" */}
      <div className="catalog-section">
        <div className="catalog-section-header">
          <h2 className="catalog-section-title">
            Packs de Insumos ({misPacks.length})
          </h2>
          <button
            type="button"
            className="catalog-create-pack-button"
            onClick={handleCreatePack}
          >
            + Crear Pack
          </button>
        </div>
        {misPacks.length === 0 ? (
          <div className="catalog-empty-state">
            <p>No tienes packs de insumos creados.</p>
          </div>
        ) : (
          <div className="catalog-packs-grid">
            {misPacks.map(pack => (
              <div key={pack.id} className="catalog-pack-card">
                <h3 className="catalog-pack-name">{pack.nombre}</h3>
                <p className="catalog-pack-price">${pack.precioTotal.toLocaleString()}</p>
                <div className="catalog-pack-items">
                  <p className="catalog-pack-label">Incluye:</p>
                  <ul className="catalog-pack-list">
                    {pack.items.map((item, idx) => (
                      <li key={idx}>
                        {getInsumoName(item.insumoId)} - {item.cantidad} {getInsumoUnidad(item.insumoId)}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="catalog-pack-edit-button"
                  onClick={() => handleEditPack(pack)}
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario "Crear/Editar Pack" */}
      {showPackForm && (
        <div className="catalog-form-card" style={{ marginTop: '2rem' }}>
          <h2 className="catalog-form-title">
            {editingPack ? 'Editar Pack' : 'Crear Nuevo Pack'}
          </h2>
          <form onSubmit={handleSubmitPack} className="catalog-form">
            {/* Campo: Nombre del pack */}
            <div className="catalog-form-field">
              <label htmlFor="packNombre" className="catalog-form-label">
                Nombre del pack <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id="packNombre"
                className="catalog-form-input"
                value={packFormData.nombre}
                onChange={(e) => setPackFormData({ ...packFormData, nombre: e.target.value })}
                placeholder="Ej: Pack Mantenimiento Piscina Básico"
                required
              />
            </div>

            {/* Campo: Precio Total */}
            <div className="catalog-form-field">
              <label htmlFor="packPrecioTotal" className="catalog-form-label">
                Precio Total ($) <span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                id="packPrecioTotal"
                className="catalog-form-input"
                value={packFormData.precioTotal}
                onChange={(e) => setPackFormData({ ...packFormData, precioTotal: e.target.value })}
                placeholder="1800"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Campo: Service ID (opcional - para packs vinculados a servicios) */}
            <div className="catalog-form-field">
              <label htmlFor="packServiceId" className="catalog-form-label">
                ID del Servicio (opcional)
              </label>
              <input
                type="text"
                id="packServiceId"
                className="catalog-form-input"
                value={packFormData.serviceId}
                onChange={(e) => setPackFormData({ ...packFormData, serviceId: e.target.value })}
                placeholder="Deja vacío para pack general"
              />
            </div>

            {/* Campo: Notas (opcional) */}
            <div className="catalog-form-field">
              <label htmlFor="packNotas" className="catalog-form-label">
                Notas (opcional)
              </label>
              <textarea
                id="packNotas"
                className="catalog-form-textarea"
                value={packFormData.notas}
                onChange={(e) => setPackFormData({ ...packFormData, notas: e.target.value })}
                placeholder="Agrega notas adicionales sobre el pack..."
                rows="3"
              />
            </div>

            {/* Sección: Agregar insumos al pack */}
            <div className="catalog-form-field">
              <label className="catalog-form-label">Insumos del Pack</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select
                  className="catalog-form-select"
                  style={{ flex: 2 }}
                  value={packItemActual.insumoId}
                  onChange={(e) => setPackItemActual({ ...packItemActual, insumoId: e.target.value })}
                >
                  <option value="">Selecciona un insumo</option>
                  {misInsumos.map(insumo => (
                    <option key={insumo.id} value={insumo.id}>
                      {insumo.nombre} ({insumo.unidad}) - Stock: {insumo.stock}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="catalog-form-input"
                  style={{ flex: 1 }}
                  value={packItemActual.cantidad}
                  onChange={(e) => setPackItemActual({ ...packItemActual, cantidad: e.target.value })}
                  placeholder="Cantidad"
                  min="1"
                />
                <button
                  type="button"
                  className="catalog-form-submit"
                  onClick={handleAddPackItem}
                  disabled={!packItemActual.insumoId || !packItemActual.cantidad}
                >
                  + Agregar
                </button>
              </div>

              {/* Lista de insumos agregados al pack */}
              {packFormData.items.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Insumos incluidos:</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {packFormData.items.map((item, idx) => {
                      const insumo = misInsumos.find(i => i.id === item.insumoId)
                      return (
                        <li key={idx} style={{ padding: '6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {insumo ? insumo.nombre : 'Insumo no encontrado'} - {item.cantidad} {insumo ? insumo.unidad : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePackItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px' }}
                            title="Eliminar insumo"
                          >
                            ✕
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="catalog-form-actions">
              <button type="submit" className="catalog-form-submit">
                {editingPack ? 'Actualizar Pack' : 'Crear Pack'}
              </button>
              <button type="button" className="catalog-form-cancel" onClick={handleCancelPack}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default SuppliesPage
