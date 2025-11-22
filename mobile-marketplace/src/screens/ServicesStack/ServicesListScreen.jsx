import React, { useState, useMemo, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AppContext } from '../../context/AppContext'

/**
 * Pantalla de Lista de Servicios - ServicesListScreen
 * 
 * Esta pantalla muestra la lista de servicios según el rol del usuario:
 * - SOLICITANTE: ve solo sus servicios
 * - PROVEEDOR_SERVICIO: ve servicios disponibles para cotizar
 * 
 * Funcionalidades:
 * - Filtrado en tiempo real por texto, categoría y ciudad
 * - Navegación al detalle de un servicio
 * - Muestra estado vacío cuando no hay servicios
 * 
 * Ciclo de vida:
 * - useEffect no se usa aquí porque los filtros se calculan con useMemo
 * - useMemo recalcula automáticamente cuando cambian los filtros o los datos
 */
const ServicesListScreen = () => {
  const { state } = useContext(AppContext)
  const { currentUser, services, quotes } = state
  const navigation = useNavigation()

  // Estado para los filtros
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    ciudad: '',
    fecha: ''
  })

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  // Obtenemos las categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set()
    services.forEach(service => {
      if (service.categoria) {
        cats.add(service.categoria)
      }
    })
    return Array.from(cats).sort()
  }, [services])

  // Obtenemos las ciudades únicas
  const ciudades = useMemo(() => {
    const cities = new Set()
    services.forEach(service => {
      if (service.ciudad) {
        cities.add(service.ciudad)
      }
    })
    return Array.from(cities).sort()
  }, [services])

  // Filtramos los servicios según el rol
  const serviciosBase = useMemo(() => {
    if (currentUser.rol === 'SOLICITANTE') {
      return services.filter(s => s.solicitanteId === currentUser.id)
    } else if (currentUser.rol === 'PROVEEDOR_SERVICIO') {
      return services.filter(
        s => (s.estado === 'PUBLICADO' || s.estado === 'EN_EVALUACION') &&
             s.solicitanteId !== currentUser.id
      )
    }
    return []
  }, [services, currentUser])

  // Aplicamos los filtros
  const serviciosFiltrados = useMemo(() => {
    return serviciosBase
      .filter(service => {
        const matchesSearch = filters.search === '' || 
          service.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
          service.descripcion.toLowerCase().includes(filters.search.toLowerCase())

        const matchesCategoria = filters.categoria === '' || 
          service.categoria === filters.categoria

        const matchesCiudad = filters.ciudad === '' || 
          service.ciudad === filters.ciudad

        let matchesFecha = true
        if (filters.fecha && service.fechaPreferida) {
          const fechaFiltro = new Date(filters.fecha)
          fechaFiltro.setHours(0, 0, 0, 0)
          const fechaServicio = new Date(service.fechaPreferida)
          fechaServicio.setHours(0, 0, 0, 0)
          matchesFecha = fechaServicio >= fechaFiltro
        }

        return matchesSearch && matchesCategoria && matchesCiudad && matchesFecha
      })
      .map(service => {
        const cotizacionesCount = quotes.filter(
          q => q.serviceId === service.id
        ).length

        return {
          ...service,
          cotizacionesCount
        }
      })
  }, [serviciosBase, filters, quotes])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
  }

  const getEstadoText = (estado) => {
    const estadoMap = {
      'PUBLICADO': 'Publicado',
      'EN_EVALUACION': 'En Evaluación',
      'ASIGNADO': 'Asignado',
      'COMPLETADO': 'Completado'
    }
    return estadoMap[estado] || estado
  }

  const renderService = ({ item: service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: service.id })}
    >
      <View style={styles.serviceCardContent}>
        <Text style={styles.serviceTitle}>{service.titulo}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.descripcion}
        </Text>
        
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.categoria}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📍 {service.ciudad}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📅 {formatDate(service.fechaPreferida)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              💬 {service.cotizacionesCount} {service.cotizacionesCount === 1 ? 'cotización' : 'cotizaciones'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.serviceCardActions}>
        <View style={[
          styles.statusBadge,
          styles[`statusBadge${service.estado}`]
        ]}>
          <Text style={styles.statusBadgeText}>
            {getEstadoText(service.estado)}
          </Text>
        </View>
        <Text style={styles.detailButton}>Ver detalle →</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.filtersContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Buscar servicios..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
        />

        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Categoría:</Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity
              style={[
                styles.selectButton,
                filters.categoria === '' && styles.selectButtonActive
              ]}
              onPress={() => setFilters({ ...filters, categoria: '' })}
            >
              <Text style={styles.selectButtonText}>Todas</Text>
            </TouchableOpacity>
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.selectButton,
                  filters.categoria === cat && styles.selectButtonActive
                ]}
                onPress={() => setFilters({ ...filters, categoria: cat })}
              >
                <Text style={styles.selectButtonText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Ciudad:</Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity
              style={[
                styles.selectButton,
                filters.ciudad === '' && styles.selectButtonActive
              ]}
              onPress={() => setFilters({ ...filters, ciudad: '' })}
            >
              <Text style={styles.selectButtonText}>Todas</Text>
            </TouchableOpacity>
            {ciudades.map(ciudad => (
              <TouchableOpacity
                key={ciudad}
                style={[
                  styles.selectButton,
                  filters.ciudad === ciudad && styles.selectButtonActive
                ]}
                onPress={() => setFilters({ ...filters, ciudad: ciudad })}
              >
                <Text style={styles.selectButtonText}>{ciudad}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {serviciosFiltrados.length > 0 && (
          <Text style={styles.countText}>
            {serviciosFiltrados.length} {serviciosFiltrados.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}
          </Text>
        )}
      </ScrollView>

      {serviciosFiltrados.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No se encontraron servicios</Text>
          <Text style={styles.emptyText}>
            {serviciosBase.length === 0
              ? 'Aún no has publicado ningún servicio.'
              : 'No hay servicios que coincidan con los filtros seleccionados.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={serviciosFiltrados}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  filterInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12
  },
  selectContainer: {
    marginBottom: 12
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  selectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  selectButtonText: {
    fontSize: 12,
    color: '#333'
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8
  },
  list: {
    padding: 16
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  serviceCardContent: {
    marginBottom: 12
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    color: '#1976D2'
  },
  serviceCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusBadgePUBLICADO: {
    backgroundColor: '#E8F5E9'
  },
  statusBadgeEN_EVALUACION: {
    backgroundColor: '#FFF3E0'
  },
  statusBadgeASIGNADO: {
    backgroundColor: '#E3F2FD'
  },
  statusBadgeCOMPLETADO: {
    backgroundColor: '#F3E5F5'
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  detailButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
})

export default ServicesListScreen

