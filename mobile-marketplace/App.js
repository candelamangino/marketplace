import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppProvider } from './src/context/AppContext'
import AppNavigator from './src/navigation/AppNavigator'

/**
 * Componente principal de la aplicación
 * 
 * Este es el punto de entrada de la app. Envuelve toda la aplicación con:
 * - SafeAreaProvider: maneja las áreas seguras del dispositivo (notch, etc.)
 * - AppProvider: provee el contexto global (estado, dispatch)
 * - AppNavigator: maneja toda la navegación de la app
 * 
 * Ciclo de vida:
 * - Al montar, inicializa el contexto con los datos mock
 * - El AppNavigator decide qué mostrar según si hay usuario logueado o no
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  )
}

