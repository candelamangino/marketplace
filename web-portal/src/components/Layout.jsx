import Navbar from './Navbar'
import Sidebar from './Sidebar'

/**
 * Componente de layout principal
 * 
 * Envuelve las páginas con el navbar y sidebar.
 * Este patrón es común: tener un layout que se reutiliza
 * en todas las páginas autenticadas.
 */
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

