import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ServicesListScreen from '../screens/ServicesStack/ServicesListScreen'
import ServiceDetailScreen from '../screens/ServicesStack/ServiceDetailScreen'

const Stack = createNativeStackNavigator()

/**
 * Stack Navigator para la sección de Servicios
 * 
 * Este stack contiene:
 * - ServicesListScreen: Lista de servicios (pantalla principal)
 * - ServiceDetailScreen: Detalle de un servicio específico
 * 
 * La navegación funciona así:
 * - Desde ServicesListScreen puedes tocar un servicio → navega a ServiceDetailScreen
 * - Desde ServiceDetailScreen puedes volver → navega a ServicesListScreen
 */
const ServicesStackNavigator = () => {
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
        name="ServicesList"
        component={ServicesListScreen}
        options={{ title: 'Servicios' }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ title: 'Detalle del Servicio' }}
      />
    </Stack.Navigator>
  )
}

export default ServicesStackNavigator

