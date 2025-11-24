import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import '../styles/layout.css'

/**
 * Componente MainLayout - Layout principal de la aplicación
 * 
 * Este componente envuelve todas las páginas autenticadas con:
 * 1. Sidebar: barra lateral de navegación a la izquierda
 * 2. Topbar: barra superior con bienvenida y botón de cerrar sesión
 * 3. Área de contenido principal: donde se renderizan las páginas
 * 
 * El layout tiene:
 * - Fondo gris muy suave (#F8FAFC) para toda la aplicación
 * - Sidebar blanco fijo a la izquierda (~240px)
 * - Área de contenido principal con fondo blanco
 * 
 * Este componente se usa en AppRouter para envolver todas las rutas protegidas.
 */
const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      {/* Sidebar: barra lateral izquierda */}
      <Sidebar />
      
      {/* Contenedor principal: topbar + contenido */}
      <div className="main-layout-content">
        {/* Topbar: barra superior */}
        <Topbar />
        
        {/* Área de contenido: donde se renderizan las páginas */}
        <main className="main-layout-main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout

