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
 * Pantalla de Lista de Cotizaciones - QuotesListScreen
 * 
 * Muestra todas las cotizaciones que el proveedor ha enviado.
 * Solo visible para usuarios con rol PROVEEDOR_SERVICIO.
 * 
 * Funcionalidades:
 * - Muestra estadísticas de cotizaciones
 * - Búsqueda por nombre de servicio o ciudad
 * - Agrupación por estado
 * - Navegación al detalle del servicio para editar
 * 
 * Ciclo de vida:
 * - useMemo calcula las cotizaciones filtradas cuando cambian los datos o la búsqueda
 */
const QuotesListScreen = () => {
  const { state, dispatch } = useContext(AppContext)
  const { currentUser, services, quotes } = state
  const navigation = useNavigation()

  const [searchTerm, setSearchTerm] = useState('')

  if (!currentUser || currentUser.rol !== 'PROVEEDOR_SERVICIO') {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  const misCotizaciones = useMemo(() => {
    return quotes
      .filter(q => q.proveedorServicioId === currentUser.id)
      .map(quote => {
        const service = services.find(s => s.id === quote.serviceId)
        return {
          ...quote,
          service: service
        }
      })
      .filter(quote => quote.service)
  }, [quotes, services, currentUser])

  const stats = useMemo(() => {
    return {
      totalEnviadas: misCotizaciones.length,
      enEvaluacion: misCotizaciones.filter(q => q.estado === 'PENDIENTE').length,
      asignadas: misCotizaciones.filter(q => q.estado === 'ACEPTADA').length,
      completadas: misCotizaciones.filter(q => {
        const service = services.find(s => s.id === q.serviceId)
        return service && service.estado === 'COMPLETADO'
      }).length
    }
  }, [misCotizaciones, services])

  const cotizacionesFiltradas = useMemo(() => {
    if (searchTerm === '') {
      return misCotizaciones
    }

    const term = searchTerm.toLowerCase()
    return misCotizaciones.filter(quote => {
      const service = quote.service
      if (!service) return false
      return service.titulo.toLowerCase().includes(term) ||
             service.ciudad.toLowerCase().includes(term)
    })
  }, [misCotizaciones, searchTerm])

  const cotizacionesPorEstado = useMemo(() => {
    const grupos = {
      'PUBLICADO': [],
      'EN_EVALUACION': []
    }

    cotizacionesFiltradas.forEach(quote => {
      const service = quote.service
      if (!service) return

      if (quote.estado === 'PENDIENTE') {
        if (service.estado === 'PUBLICADO') {
          grupos['PUBLICADO'].push(quote)
        } else if (service.estado === 'EN_EVALUACION') {
          grupos['EN_EVALUACION'].push(quote)
        }
      } else if (quote.estado === 'ACEPTADA') {
        grupos['EN_EVALUACION'].push(quote)
      }
    })

    return grupos
  }, [cotizacionesFiltradas])

  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ]
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const renderQuote = ({ item: quote }) => {
    const service = quote.service
    if (!service) return null

    return (
      <TouchableOpacity
        style={styles.quoteCard}
        onPress={() => {
          navigation.navigate('ServiciosTab', {
            screen: 'ServiceDetail',
            params: { serviceId: service.id }
          })
        }}
      >
        <View style={styles.quoteLeft}>
          <Text style={styles.quoteTitle}>{service.titulo}</Text>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteMetaText}>📍 {service.ciudad}</Text>
            <Text style={styles.quoteMetaText}>📅 {formatDateShort(service.fechaPreferida)}</Text>
            <Text style={styles.quoteCategory}>{service.categoria}</Text>
          </View>
        </View>
        <View style={styles.quoteRight}>
          <Text style={styles.quotePrice}>$ {quote.precioTotal.toLocaleString()}</Text>
          <Text style={styles.quotePlazo}>⏰ {quote.plazoDias} {quote.plazoDias === 1 ? 'día' : 'días'}</Text>
          <Text style={styles.quoteDetail}>Ver detalle →</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.statsContainer} horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📄</Text>
          <Text style={styles.statNumber}>{stats.totalEnviadas}</Text>
          <Text style={styles.statLabel}>Total Enviadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text style={styles.statNumber}>{stats.enEvaluacion}</Text>
          <Text style={styles.statLabel}>En Evaluación</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💼</Text>
          <Text style={styles.statNumber}>{stats.asignadas}</Text>
          <Text style={styles.statLabel}>Asignadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statNumber}>{stats.completadas}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
      </ScrollView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por servicio o ciudad..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {cotizacionesFiltradas.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No se encontraron cotizaciones</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {cotizacionesPorEstado['PUBLICADO'].length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>
                Publicado ({cotizacionesPorEstado['PUBLICADO'].length})
              </Text>
              <FlatList
                data={cotizacionesPorEstado['PUBLICADO']}
                renderItem={renderQuote}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {cotizacionesPorEstado['EN_EVALUACION'].length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>
                En Evaluación ({cotizacionesPorEstado['EN_EVALUACION'].length})
              </Text>
              <FlatList
                data={cotizacionesPorEstado['EN_EVALUACION']}
                renderItem={renderQuote}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  statCard: {
    width: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center'
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  content: {
    flex: 1,
    padding: 16
  },
  group: {
    marginBottom: 24
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  quoteLeft: {
    flex: 1
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  quoteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quoteMetaText: {
    fontSize: 12,
    color: '#666'
  },
  quoteCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  quoteRight: {
    alignItems: 'flex-end'
  },
  quotePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  quotePlazo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8
  },
  quoteDetail: {
    fontSize: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  }
})

export default QuotesListScreen

