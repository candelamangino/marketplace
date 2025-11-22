import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ServiceFormScreen from '../screens/PublicarStack/ServiceFormScreen'

const Stack = createNativeStackNavigator()

/**
 * Stack Navigator para la sección de Publicar
 * 
 * Este stack contiene:
 * - ServiceFormScreen: Formulario para crear un nuevo servicio
 * 
 * Solo visible para usuarios con rol SOLICITANTE.
 * Permite crear nuevos servicios que luego aparecerán en la lista.
 */
const PublicarStackNavigator = () => {
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
        name="ServiceForm"
        component={ServiceFormScreen}
        options={{ title: 'Publicar Servicio' }}
      />
    </Stack.Navigator>
  )
}

export default PublicarStackNavigator

