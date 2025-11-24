import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

/**
 * Componente de barra de navegación superior
 * 
 * Muestra el nombre del usuario logueado y un botón para cerrar sesión.
 * Solo se muestra cuando hay un usuario autenticado.
 */
const Navbar = () => {
  const { state, dispatch } = useContext(AppContext)
  const navigate = useNavigate()

  // Función para cerrar sesión
  const handleLogout = () => {
    // Enviamos la acción LOGOUT al reducer
    dispatch({ type: 'LOGOUT' })
    // Redirigimos al login
    navigate('/login')
  }

  if (!state.currentUser) {
    return null // No mostramos navbar si no hay usuario logueado
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="navbar-title">Marketplace de Servicios</h1>
        <div className="navbar-user">
          <span className="navbar-user-name">
            {state.currentUser.nombre} ({state.currentUser.rol})
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

