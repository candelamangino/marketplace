import { createContext, useContext, useReducer } from 'react'
import { appReducer, initialState } from './appReducer'

/**
 * Contexto de la aplicación
 * 
 * React Context resuelve el problema de "prop drilling":
 * - Sin Context: tendrías que pasar datos desde el componente raíz
 *   hasta componentes muy anidados, pasando por todos los intermedios
 * - Con Context: cualquier componente puede acceder directamente
 *   al estado global sin pasar por componentes intermedios
 * 
 * En este proyecto usamos Context para:
 * - Estado del usuario logueado (currentUser)
 * - Lista de servicios, cotizaciones, insumos, etc.
 * - Funciones para modificar estos datos (dispatch)
 */

// Creamos el contexto. Este será el "canal" por donde fluyen los datos
export const AppContext = createContext()

/**
 * Provider del contexto
 * 
 * Este componente envuelve toda la aplicación y provee:
 * - state: el estado actual (servicios, usuarios, etc.)
 * - dispatch: función para enviar acciones al reducer
 * 
 * useReducer es similar a useState, pero para estados complejos:
 * - useState: para estados simples (un valor, un array simple)
 * - useReducer: para estados complejos con múltiples propiedades
 *   y muchas formas de modificarlos
 */
export const AppProvider = ({ children }) => {
  // useReducer retorna [state, dispatch]
  // state: el estado actual
  // dispatch: función para enviar acciones (ej: dispatch({ type: 'LOGIN_SUCCESS', payload: user }))
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook personalizado para usar el contexto fácilmente
 * 
 * En vez de escribir:
 *   const { state, dispatch } = useContext(AppContext)
 * 
 * Podemos escribir:
 *   const { state, dispatch } = useAppContext()
 * 
 * Además, si alguien usa este hook fuera del Provider, lanzará un error claro.
 */
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider')
  }
  return context
}

