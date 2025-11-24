import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { usersMock } from '../data/usersMock'
import '../styles/login.css'

/**
 * Página de inicio de sesión - Marketplace
 * 
 * Esta página muestra un formulario de login con diseño moderno que incluye:
 * - Logo con ícono de cubo en círculo
 * - Formulario con email (opcional) y selector de rol
 * - Botón de ingreso azul
 * - Sección de acceso rápido con usuarios de prueba
 * - Información sobre la aplicación de prueba
 * 
 * Funcionalidad:
 * 1. El usuario puede ingresar email (opcional) y seleccionar un rol
 * 2. Al hacer click en "Ingresar", se busca un usuario con ese rol en usersMock
 * 3. Si encuentra coincidencia, guarda el usuario en el contexto y redirige al dashboard
 * 4. También puede usar los botones de acceso rápido para iniciar sesión directamente
 */
const LoginPage = () => {
  // Estado para el email (opcional según el diseño)
  const [email, setEmail] = useState('')
  
  // Estado para el rol seleccionado (por defecto "Solicitante")
  const [selectedRole, setSelectedRole] = useState('SOLICITANTE')
  
  // Acceso al contexto para actualizar el usuario logueado
  const { dispatch } = useContext(AppContext)
  const navigate = useNavigate()

  /**
   * Función que maneja el envío del formulario
   * Busca un usuario con el rol seleccionado y lo loguea
   */
  const handleSubmit = (e) => {
    e.preventDefault() // Previene el comportamiento por defecto del formulario
    
    // Busca un usuario con el rol seleccionado
    // Si hay email, intenta buscar por email también
    let user = null
    
    if (email) {
      // Si hay email, busca por email y rol
      user = usersMock.find(
        u => u.email === email && u.rol === selectedRole
      )
    } else {
      // Si no hay email, busca solo por rol (toma el primero que encuentre)
      user = usersMock.find(u => u.rol === selectedRole)
    }

    if (user) {
      // Si encuentra el usuario, lo guarda en el contexto
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: user
      })
      // Redirige al dashboard
      navigate('/')
    }
  }

  /**
   * Función para acceso rápido con usuarios de prueba
   * Recibe el nombre del usuario y lo busca en usersMock
   */
  const handleQuickAccess = (userName) => {
    // Mapeo de nombres mostrados en los botones a los nombres exactos en usersMock
    const userMap = {
      'Juan Pérez': { name: 'Juan Pérez', role: 'SOLICITANTE' },
      'Maria Garcia': { name: 'Maria Garcia', role: 'PROVEEDOR_SERVICIO' },
      'Ana Martínez': { name: 'Ana Martínez', role: 'PROVEEDOR_INSUMOS' }
    }
    
    // Obtiene la información del usuario desde el mapa
    const userInfo = userMap[userName]
    
    if (userInfo) {
      // Busca el usuario por nombre exacto y rol
      const user = usersMock.find(
        u => u.nombre === userInfo.name && u.rol === userInfo.role
      )

      if (user) {
        // Si encuentra el usuario, lo guarda en el contexto
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: user
        })
        // Redirige al dashboard
        navigate('/')
      }
    }
  }

  return (
    <div className="login-page">
      {/* Contenedor principal: card blanco centrado */}
      <div className="login-card">
        
        {/* Logo: cubo azul en círculo */}
        <div className="login-logo">
          <div className="logo-circle">
            <div className="logo-cube"></div>
          </div>
        </div>

        {/* Título principal */}
        <h1 className="login-title">Marketplace</h1>
        
        {/* Subtítulo */}
        <p className="login-subtitle">Servicios con Insumos</p>

        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Campo de email (opcional) */}
          <div className="form-field">
            <label htmlFor="email">Email (opcional)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="login-input"
            />
          </div>

          {/* Selector de rol */}
          <div className="form-field">
            <label htmlFor="role">Selecciona tu rol</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="login-select"
            >
              <option value="SOLICITANTE">Solicitante</option>
              <option value="PROVEEDOR_SERVICIO">Proveedor de Servicios</option>
              <option value="PROVEEDOR_INSUMOS">Proveedor de Insumos</option>
            </select>
          </div>

          {/* Botón de ingreso */}
          <button type="submit" className="login-button">
            Ingresar
          </button>
        </form>

        {/* Sección de acceso rápido */}
        <div className="quick-access-section">
          <p className="quick-access-title">Acceso rápido con usuarios de prueba:</p>
          
          <div className="quick-access-buttons">
            {/* Botón para Juan Pérez (Solicitante) */}
            <button
              type="button"
              className="quick-access-button"
              onClick={() => handleQuickAccess('Juan Pérez')}
            >
              Juan Pérez (Solicitante)
            </button>

            {/* Botón para Maria Garcia (Proveedor de Servicios) */}
            <button
              type="button"
              className="quick-access-button"
              onClick={() => handleQuickAccess('Maria Garcia')}
            >
              Maria Garcia (Proveedor de Servicios)
            </button>

            {/* Botón para Ana Martínez (Proveedor de Insumos) */}
            <button
              type="button"
              className="quick-access-button"
              onClick={() => handleQuickAccess('Ana Martínez')}
            >
              Ana Martínez (Proveedor de Insumos)
            </button>
          </div>
        </div>

        {/* Caja de información inferior */}
        <div className="login-info-box">
          <div className="info-icon">ℹ️</div>
          <p className="info-text">
            Esta es una aplicación de prueba. El login es simulado para fines educativos.
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
