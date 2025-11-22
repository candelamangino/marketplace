import React, { useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native'
import { AppContext } from '../../context/AppContext'

/**
 * Pantalla de Perfil - ProfileScreen
 * 
 * Muestra la información del perfil del usuario actual:
 * - Nombre completo
 * - Email
 * - Rol
 * - Rating (solo para PROVEEDOR_SERVICIO)
 * 
 * También permite cerrar sesión.
 * 
 * Ciclo de vida:
 * - Al montar, obtiene el usuario actual del contexto
 * - No necesita efectos porque los datos vienen del contexto global
 */
const ProfileScreen = () => {
  const { state, dispatch } = useContext(AppContext)
  const { currentUser } = state

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  const getRoleText = (rol) => {
    const roleMap = {
      'SOLICITANTE': 'Solicitante',
      'PROVEEDOR_SERVICIO': 'Proveedor de Servicios',
      'PROVEEDOR_INSUMOS': 'Proveedor de Insumos'
    }
    return roleMap[rol] || rol
  }

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'LOGOUT' })
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {currentUser.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{currentUser.nombre}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{currentUser.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>{getRoleText(currentUser.rol)}</Text>
        </View>

        {currentUser.rol === 'PROVEEDOR_SERVICIO' && (
          <View style={styles.field}>
            <Text style={styles.label}>Rating</Text>
            <Text style={styles.value}>
              ⭐ {currentUser.rating || '4.8'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff'
  },
  field: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default ProfileScreen

