import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

/**
 * Componente Topbar - Barra superior del layout
 * 
 * Este componente muestra:
 * 1. Mensaje de bienvenida con el nombre del usuario
 * 2. Subtítulo con el tipo de panel según el rol
 * 3. Botón de cerrar sesión alineado a la derecha
 * 
 * El botón de cerrar sesión ejecuta la acción LOGOUT del reducer
 * y redirige al usuario a la página de login.
 */
const Topbar = () => {
  // Obtenemos el contexto para acceder al usuario y dispatch
  const { state, dispatch } = useContext(AppContext)
  const navigate = useNavigate()
  
  const currentUser = state.currentUser

  // Si no hay usuario, no mostramos el topbar
  if (!currentUser) {
    return null
  }

  /**
   * Función para obtener el texto del panel según el rol
   * Retorna el nombre del panel que se muestra como subtítulo
   */
  const getPanelText = (rol) => {
    const panelMap = {
      'SOLICITANTE': 'Panel de Solicitante',
      'PROVEEDOR_SERVICIO': 'Panel de Proveedor de Servicios',
      'PROVEEDOR_INSUMOS': 'Panel de Proveedor de Insumos'
    }
    return panelMap[rol] || 'Panel'
  }

  /**
   * Función que maneja el cierre de sesión
   * 1. Despacha la acción LOGOUT al reducer
   * 2. Redirige al usuario a la página de login
   */
  const handleLogout = () => {
    // Despachamos la acción LOGOUT para limpiar el usuario del estado
    dispatch({ type: 'LOGOUT' })
    
    // Redirigimos al usuario a la página de login
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Sección izquierda: Bienvenida y título del panel */}
        <div className="topbar-left">
          <h1 className="topbar-welcome">
            Bienvenido, {currentUser.nombre || 'usuario'}
          </h1>
          <p className="topbar-subtitle">
            {getPanelText(currentUser.rol)}
          </p>
        </div>

        {/* Sección derecha: Botón de cerrar sesión */}
        <div className="topbar-right">
          <button 
            type="button"
            className="topbar-logout-button"
            onClick={handleLogout}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Topbar

