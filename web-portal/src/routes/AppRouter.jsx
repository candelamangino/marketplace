import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import ServicesListPage from '../pages/ServicesListPage'
import ServiceDetailPage from '../pages/ServiceDetailPage'
import ServiceFormPage from '../pages/ServiceFormPage'
import ProfilePage from '../pages/ProfilePage'
import SuppliesPage from '../pages/SuppliesPage'
import QuotesPage from '../pages/QuotesPage'

/**
 * Componente de protección de rutas
 * 
 * Este componente verifica si el usuario está logueado.
 * Si no está logueado, redirige al login.
 * Si está logueado, muestra el componente solicitado.
 */
const ProtectedRoute = ({ children }) => {
  const { state } = useContext(AppContext)

  if (!state.currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Componente de protección de rutas por rol
 * 
 * Verifica que el usuario tenga el rol requerido.
 * Si no tiene el rol, redirige al dashboard.
 */
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { state } = useContext(AppContext)

  if (!state.currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(state.currentUser.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * Router principal de la aplicación
 * 
 * Define todas las rutas de la aplicación:
 * - /login: página de login (pública)
 * - /: dashboard (protegida)
 * - /servicios: lista de servicios (protegida)
 * - /servicios/:id: detalle de servicio (protegida)
 * - /servicios/nuevo: crear servicio (solo SOLICITANTE)
 * - /insumos: catálogo de insumos (solo PROVEEDOR_INSUMOS)
 * - /cotizaciones: mis cotizaciones (solo PROVEEDOR_SERVICIO)
 * 
 * Routes y Route son componentes de React Router:
 * - Routes: contenedor de todas las rutas
 * - Route: define una ruta específica
 * - Navigate: redirige a otra ruta
 */
const AppRouter = () => {
  const { state } = useContext(AppContext)

  return (
    <Routes>
      {/* Ruta pública: login */}
      <Route
        path="/login"
        element={
          state.currentUser ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      {/* Rutas protegidas: requieren autenticación */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicios"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ServicesListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicios/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ServiceDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta solo para SOLICITANTE */}
      <Route
        path="/servicios/nuevo"
        element={
          <RoleProtectedRoute allowedRoles={['SOLICITANTE']}>
            <MainLayout>
              <ServiceFormPage />
            </MainLayout>
          </RoleProtectedRoute>
        }
      />

      {/* Ruta de perfil (accesible para todos los roles) */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta solo para PROVEEDOR_INSUMOS */}
      <Route
        path="/insumos"
        element={
          <RoleProtectedRoute allowedRoles={['PROVEEDOR_INSUMOS']}>
            <MainLayout>
              <SuppliesPage />
            </MainLayout>
          </RoleProtectedRoute>
        }
      />

      {/* Ruta solo para PROVEEDOR_SERVICIO */}
      <Route
        path="/cotizaciones"
        element={
          <RoleProtectedRoute allowedRoles={['PROVEEDOR_SERVICIO']}>
            <MainLayout>
              <QuotesPage />
            </MainLayout>
          </RoleProtectedRoute>
        }
      />

      {/* Ruta por defecto: redirige al dashboard si está logueado, sino al login */}
      <Route
        path="*"
        element={
          state.currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default AppRouter

