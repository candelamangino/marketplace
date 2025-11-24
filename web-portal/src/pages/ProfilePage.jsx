import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import '../styles/profile.css'

/**
 * Página de Perfil - ProfilePage
 * 
 * Esta página muestra la información del perfil del usuario actual:
 * - Nombre completo
 * - Email
 * - Rol (Solicitante, Proveedor de Servicios, Proveedor de Insumos)
 * 
 * Los datos se obtienen del usuario actual en el contexto (currentUser).
 * 
 * La página está diseñada para todos los roles, pero el layout y estilo
 * coinciden con el diseño de Figma para el rol SOLICITANTE.
 */
const ProfilePage = () => {
  // Obtenemos el contexto con el usuario actual
  const { state } = useContext(AppContext)
  const { currentUser } = state

  // Si no hay usuario, no mostramos nada
  if (!currentUser) {
    return <div>Cargando...</div>
  }

  /**
   * Función que obtiene el texto del rol en español
   * Convierte los códigos de rol a texto legible
   */
  const getRoleText = (rol) => {
    const roleMap = {
      'SOLICITANTE': 'Solicitante',
      'PROVEEDOR_SERVICIO': 'Proveedor de Servicios',
      'PROVEEDOR_INSUMOS': 'Proveedor de Insumos'
    }
    return roleMap[rol] || rol
  }

  return (
    <div className="profile-page">
      {/* Título principal */}
      <h1 className="profile-title">Mi Perfil</h1>

      {/* Card de información del perfil */}
      <div className="profile-card">
        {/* Campo: Nombre */}
        <div className="profile-field">
          <span className="profile-label">Nombre</span>
          <span className="profile-value">{currentUser.nombre}</span>
        </div>

        {/* Campo: Email */}
        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{currentUser.email}</span>
        </div>

        {/* Campo: Rol */}
        <div className="profile-field">
          <span className="profile-label">Rol</span>
          <span className="profile-value">{getRoleText(currentUser.rol)}</span>
        </div>

        {/* Campo: Rating (solo para PROVEEDOR_SERVICIO) */}
        {currentUser.rol === 'PROVEEDOR_SERVICIO' && (
          <div className="profile-field">
            <span className="profile-label">Rating</span>
            <span className="profile-value profile-rating">
              ⭐ {currentUser.rating || '4.8'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

