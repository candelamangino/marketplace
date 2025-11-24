import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import AppRouter from './routes/AppRouter'

/**
 * Componente principal de la aplicación
 * 
 * Aquí se decide qué mostrar según si el usuario está logueado o no.
 * Si no hay usuario logueado, se muestra el router que manejará el login.
 * Si hay usuario logueado, se muestra el router completo con todas las rutas.
 */
function App() {
  const { state } = useContext(AppContext)

  return (
    <div className="app">
      <AppRouter />
    </div>
  )
}

export default App

