import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native'
import { AppContext } from '../context/AppContext'
import { usersMock } from '../data/usersMock'

/**
 * Pantalla de Login - Marketplace Mobile
 * 
 * Esta pantalla permite al usuario iniciar sesión seleccionando un rol.
 * Funciona igual que la versión web pero adaptada a mobile.
 * 
 * Funcionalidad:
 * 1. El usuario puede ingresar email (opcional) y seleccionar un rol
 * 2. Al hacer click en "Ingresar", se busca un usuario con ese rol en usersMock
 * 3. Si encuentra coincidencia, guarda el usuario en el contexto
 * 4. También puede usar los botones de acceso rápido para iniciar sesión directamente
 * 
 * Ciclo de vida:
 * - Al montar el componente, se inicializa el estado local (email, selectedRole)
 * - Cuando el usuario interactúa, se actualiza el estado local
 * - Al hacer submit, se busca el usuario y se actualiza el contexto global
 */
const LoginScreen = ({ navigation }) => {
  // Estado para el email (opcional según el diseño)
  const [email, setEmail] = useState('')
  
  // Estado para el rol seleccionado (por defecto "Solicitante")
  const [selectedRole, setSelectedRole] = useState('SOLICITANTE')
  
  // Acceso al contexto para actualizar el usuario logueado
  const { dispatch } = useContext(AppContext)

  /**
   * Función que maneja el envío del formulario
   * Busca un usuario con el rol seleccionado y lo loguea
   */
  const handleSubmit = () => {
    // Busca un usuario con el rol seleccionado
    // Si hay email, intenta buscar por email también
    let user = null
    
    if (email) {
      // Si hay email, busca por email y rol
      user = usersMock.find(
        u => u.email === email && u.rol === selectedRole
      )
    } else {
      // Si no hay email, busca solo por rol (toma el primero que encuentre)
      user = usersMock.find(u => u.rol === selectedRole)
    }

    if (user) {
      // Si encuentra el usuario, lo guarda en el contexto
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: user
      })
      // La navegación se manejará automáticamente desde App.js
    } else {
      Alert.alert('Error', 'No se encontró un usuario con ese rol')
    }
  }

  /**
   * Función para acceso rápido con usuarios de prueba
   * Recibe el nombre del usuario y lo busca en usersMock
   */
  const handleQuickAccess = (userName) => {
    // Mapeo de nombres mostrados en los botones a los nombres exactos en usersMock
    const userMap = {
      'Juan Pérez': { name: 'Juan Pérez', role: 'SOLICITANTE' },
      'Maria Garcia': { name: 'Maria García', role: 'PROVEEDOR_SERVICIO' },
      'Ana Martínez': { name: 'Ana Martínez', role: 'PROVEEDOR_INSUMOS' }
    }
    
    // Obtiene la información del usuario desde el mapa
    const userInfo = userMap[userName]
    
    if (userInfo) {
      // Busca el usuario por nombre exacto y rol
      const user = usersMock.find(
        u => u.nombre === userInfo.name && u.rol === userInfo.role
      )

      if (user) {
        // Si encuentra el usuario, lo guarda en el contexto
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: user
        })
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoCube}>📦</Text>
          </View>
        </View>

        {/* Título principal */}
        <Text style={styles.title}>Marketplace</Text>
        
        {/* Subtítulo */}
        <Text style={styles.subtitle}>Servicios con Insumos</Text>

        {/* Formulario de login */}
        <View style={styles.form}>
          {/* Campo de email (opcional) */}
          <View style={styles.field}>
            <Text style={styles.label}>Email (opcional)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Selector de rol */}
          <View style={styles.field}>
            <Text style={styles.label}>Selecciona tu rol</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'SOLICITANTE' && styles.roleButtonActive
                ]}
                onPress={() => setSelectedRole('SOLICITANTE')}
              >
                <Text style={[
                  styles.roleButtonText,
                  selectedRole === 'SOLICITANTE' && styles.roleButtonTextActive
                ]}>
                  Solicitante
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'PROVEEDOR_SERVICIO' && styles.roleButtonActive
                ]}
                onPress={() => setSelectedRole('PROVEEDOR_SERVICIO')}
              >
                <Text style={[
                  styles.roleButtonText,
                  selectedRole === 'PROVEEDOR_SERVICIO' && styles.roleButtonTextActive
                ]}>
                  Proveedor de Servicios
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'PROVEEDOR_INSUMOS' && styles.roleButtonActive
                ]}
                onPress={() => setSelectedRole('PROVEEDOR_INSUMOS')}
              >
                <Text style={[
                  styles.roleButtonText,
                  selectedRole === 'PROVEEDOR_INSUMOS' && styles.roleButtonTextActive
                ]}>
                  Proveedor de Insumos
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón de ingreso */}
          <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
            <Text style={styles.loginButtonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de acceso rápido */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessTitle}>Acceso rápido con usuarios de prueba:</Text>
          
          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => handleQuickAccess('Juan Pérez')}
          >
            <Text style={styles.quickAccessButtonText}>Juan Pérez (Solicitante)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => handleQuickAccess('Maria Garcia')}
          >
            <Text style={styles.quickAccessButtonText}>Maria García (Proveedor de Servicios)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessButton}
            onPress={() => handleQuickAccess('Ana Martínez')}
          >
            <Text style={styles.quickAccessButtonText}>Ana Martínez (Proveedor de Insumos)</Text>
          </TouchableOpacity>
        </View>

        {/* Caja de información inferior */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Esta es una aplicación de prueba. El login es simulado para fines educativos.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%'
  },
  logoContainer: {
    marginBottom: 20
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoCube: {
    fontSize: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32
  },
  form: {
    width: '100%',
    maxWidth: 400
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  roleButton: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center'
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  roleButtonText: {
    fontSize: 14,
    color: '#333'
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  quickAccessSection: {
    width: '100%',
    maxWidth: 400,
    marginTop: 32
  },
  quickAccessTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center'
  },
  quickAccessButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center'
  },
  quickAccessButtonText: {
    fontSize: 14,
    color: '#007AFF'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 32,
    width: '100%',
    maxWidth: 400
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2'
  }
})

export default LoginScreen

