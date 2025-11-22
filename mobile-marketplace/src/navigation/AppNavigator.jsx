import React, { useContext } from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { AppContext } from '../context/AppContext'
import LoginScreen from '../screens/LoginScreen'

// Stacks
import ServicesStackNavigator from './ServicesStackNavigator'
import PublicarStackNavigator from './PublicarStackNavigator'
import CotizacionesStackNavigator from './CotizacionesStackNavigator'
import PerfilStackNavigator from './PerfilStackNavigator'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

/**
 * Navegador principal de la aplicación
 * 
 * Esta función maneja la navegación completa de la app:
 * 
 * 1. Si el usuario NO está logueado → muestra LoginScreen
 * 2. Si el usuario está logueado → muestra las tabs principales
 * 
 * Las tabs son:
 * - Servicios: Lista de servicios (depende del rol)
 * - Publicar: Formulario para crear servicio (solo SOLICITANTE)
 * - Cotizaciones: Lista de cotizaciones (solo PROVEEDOR_SERVICIO)
 * - Perfil: Perfil del usuario
 * 
 * Cada tab tiene su propio stack navigator para permitir navegación
 * entre pantallas relacionadas (ej: Lista → Detalle).
 */
const AppNavigator = () => {
  const { state } = useContext(AppContext)
  const { currentUser } = state

  // Si no hay usuario logueado, mostramos solo la pantalla de login
  if (!currentUser) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }

  // Si hay usuario logueado, mostramos las tabs principales
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60
          }
        }}
      >
        {/* Tab: Servicios */}
        <Tab.Screen
          name="ServiciosTab"
          component={ServicesStackNavigator}
          options={{
            tabBarLabel: 'Servicios',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💼</Text>
          }}
        />

        {/* Tab: Publicar (solo visible para SOLICITANTE) */}
        {currentUser.rol === 'SOLICITANTE' && (
          <Tab.Screen
            name="PublicarTab"
            component={PublicarStackNavigator}
            options={{
              tabBarLabel: 'Publicar',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>➕</Text>
            }}
          />
        )}

        {/* Tab: Cotizaciones (solo visible para PROVEEDOR_SERVICIO) */}
        {currentUser.rol === 'PROVEEDOR_SERVICIO' && (
          <Tab.Screen
            name="CotizacionesTab"
            component={CotizacionesStackNavigator}
            options={{
              tabBarLabel: 'Cotizaciones',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📄</Text>
            }}
          />
        )}

        {/* Tab: Perfil (visible para todos) */}
        <Tab.Screen
          name="PerfilTab"
          component={PerfilStackNavigator}
          options={{
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator

