import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import QuotesListScreen from '../screens/CotizacionesStack/QuotesListScreen'

const Stack = createNativeStackNavigator()

/**
 * Stack Navigator para la sección de Cotizaciones
 * 
 * Este stack contiene:
 * - QuotesListScreen: Lista de cotizaciones enviadas por el proveedor
 * 
 * Solo visible para usuarios con rol PROVEEDOR_SERVICIO.
 * Muestra todas las cotizaciones que el proveedor ha enviado.
 */
const CotizacionesStackNavigator = () => {
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
        name="QuotesList"
        component={QuotesListScreen}
        options={{ title: 'Mis Cotizaciones' }}
      />
    </Stack.Navigator>
  )
}

export default CotizacionesStackNavigator

