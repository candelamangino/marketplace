import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ProfileScreen from '../screens/PerfilStack/ProfileScreen'

const Stack = createNativeStackNavigator()

/**
 * Stack Navigator para la sección de Perfil
 * 
 * Este stack contiene:
 * - ProfileScreen: Perfil del usuario logueado
 * 
 * Visible para todos los roles.
 * Muestra la información del usuario actual y permite cerrar sesión.
 */
const PerfilStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Stack.Navigator>
  )
}

export default PerfilStackNavigator

