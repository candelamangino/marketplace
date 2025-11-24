import { NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
 * Componente Sidebar - Barra lateral de navegación
 * 
 * Este componente muestra:
 * 1. Logo y nombre de la aplicación en la parte superior
 * 2. Menú de navegación con íconos y texto
 * 3. Información del usuario en la parte inferior (avatar, nombre, rol)
 * 
 * El item activo se resalta con fondo celeste claro (#E8F0FE)
 * según el diseño de Figma.
 */
const Sidebar = () => {
  // Obtenemos el usuario actual del contexto
  const { state } = useContext(AppContext)
  const currentUser = state.currentUser

  // Si no hay usuario, no mostramos el sidebar
  if (!currentUser) {
    return null
  }

  // Función para obtener el texto del rol en español
  const getRoleText = (rol) => {
    const roleMap = {
      'SOLICITANTE': 'Solicitante',
      'PROVEEDOR_SERVICIO': 'Proveedor de Servicios',
      'PROVEEDOR_INSUMOS': 'Proveedor de Insumos'
    }
    return roleMap[rol] || rol
  }

  // Función para obtener la inicial del nombre del usuario
  const getUserInitial = () => {
    if (currentUser.nombre) {
      return currentUser.nombre.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <aside className="sidebar">
      {/* Sección superior: Logo y nombre de la aplicación */}
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Marketplace</h1>
        <p className="sidebar-subtitle">Servicios + Insumos</p>
      </div>

      {/* Menú de navegación */}
      <nav className="sidebar-nav">
        {/* Link de Inicio (Dashboard) */}
        <NavLink 
          to="/" 
          className="sidebar-link" 
          end
        >
          <span className="sidebar-icon">🏠</span>
          <span className="sidebar-link-text">Inicio</span>
        </NavLink>

        {/* Link de Servicios - visible para todos los roles */}
        <NavLink 
          to="/servicios" 
          className="sidebar-link"
        >
          <span className="sidebar-icon">💼</span>
          <span className="sidebar-link-text">Servicios</span>
        </NavLink>

        {/* Link de Mis Cotizaciones - solo para PROVEEDOR_SERVICIO */}
        {currentUser.rol === 'PROVEEDOR_SERVICIO' && (
          <NavLink 
            to="/cotizaciones" 
            className="sidebar-link"
          >
            <span className="sidebar-icon">📄</span>
            <span className="sidebar-link-text">Mis Cotizaciones</span>
          </NavLink>
        )}

        {/* Link de Perfil - visible para todos los roles */}
        <NavLink 
          to="/perfil" 
          className="sidebar-link"
        >
          <span className="sidebar-icon">👤</span>
          <span className="sidebar-link-text">Perfil</span>
        </NavLink>
      </nav>

      {/* Sección inferior: Información del usuario */}
      <div className="sidebar-user">
        {/* Avatar circular con inicial del usuario */}
        <div className="sidebar-avatar">
          {getUserInitial()}
        </div>
        
        {/* Información del usuario */}
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{currentUser.nombre || 'usuario'}</p>
          <p className="sidebar-user-role">{getRoleText(currentUser.rol)}</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
