import React, { useState, useMemo, useContext, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { AppContext } from '../../context/AppContext'
import { usersMock } from '../../data/usersMock'

/**
 * Pantalla de Detalle de Servicio - ServiceDetailScreen
 * 
 * Muestra el detalle completo de un servicio:
 * - Datos del servicio
 * - Insumos requeridos
 * - Cotizaciones recibidas (para SOLICITANTE)
 * - Formulario de cotización (para PROVEEDOR_SERVICIO)
 * 
 * Ciclo de vida:
 * - useEffect: cuando se monta, busca el servicio por ID desde los parámetros de navegación
 * - useEffect: si el proveedor ya tiene una cotización, precarga el formulario
 */
const ServiceDetailScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { serviceId } = route.params
  const { state, dispatch } = useContext(AppContext)
  const { currentUser, services, quotes, supplies, supplyOffers } = state

  const [sortOrder, setSortOrder] = useState('precio-asc')
  const [quoteForm, setQuoteForm] = useState({
    precioTotal: '',
    plazoDias: '',
    notas: ''
  })

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  const service = services.find(s => String(s.id) === String(serviceId))

  if (!service) {
    return (
      <View style={styles.container}>
        <Text>Servicio no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>← Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Verificamos permisos
  if (currentUser.rol === 'SOLICITANTE' && service.solicitanteId !== currentUser.id) {
    return (
      <View style={styles.container}>
        <Text>No tienes permiso para ver este servicio</Text>
      </View>
    )
  }

  if (currentUser.rol === 'PROVEEDOR_SERVICIO' && service.solicitanteId === currentUser.id) {
    return (
      <View style={styles.container}>
        <Text>No puedes cotizar tus propios servicios</Text>
      </View>
    )
  }

  const miCotizacion = useMemo(() => {
    if (currentUser.rol !== 'PROVEEDOR_SERVICIO') return null
    return quotes.find(
      q => q.serviceId === service.id && q.proveedorServicioId === currentUser.id
    )
  }, [quotes, service.id, currentUser])

  // Precargamos el formulario si ya existe una cotización
  useEffect(() => {
    if (miCotizacion) {
      setQuoteForm({
        precioTotal: miCotizacion.precioTotal.toString(),
        plazoDias: miCotizacion.plazoDias.toString(),
        notas: miCotizacion.notas || ''
      })
    }
  }, [miCotizacion])

  const serviceQuotes = useMemo(() => {
    return quotes.filter(q => q.serviceId === service.id)
  }, [quotes, service.id])

  const sortedQuotes = useMemo(() => {
    const quotesList = [...serviceQuotes]
    switch (sortOrder) {
      case 'precio-asc':
        return quotesList.sort((a, b) => a.precioTotal - b.precioTotal)
      case 'precio-desc':
        return quotesList.sort((a, b) => b.precioTotal - a.precioTotal)
      case 'plazo-asc':
        return quotesList.sort((a, b) => a.plazoDias - b.plazoDias)
      default:
        return quotesList
    }
  }, [serviceQuotes, sortOrder])

  const insumosRequeridos = useMemo(() => {
    return service.insumosRequeridos.map(req => {
      if (req.nombre) {
        return {
          nombre: req.nombre,
          cantidad: req.cantidad,
          unidad: req.unidad
        }
      } else if (req.insumoId) {
        const insumo = supplies.find(s => s.id === req.insumoId)
        return {
          nombre: insumo ? insumo.nombre : 'Insumo no encontrado',
          cantidad: req.cantidad,
          unidad: req.unidad || (insumo ? insumo.unidad : '')
        }
      }
      return {
        nombre: 'Insumo sin nombre',
        cantidad: req.cantidad || 0,
        unidad: req.unidad || ''
      }
    })
  }, [service.insumosRequeridos, supplies])

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

  const getProveedorName = (proveedorId) => {
    const proveedor = usersMock.find(u => u.id === proveedorId)
    return proveedor ? proveedor.nombre : `Proveedor ${proveedorId}`
  }

  const getProveedorRating = (proveedorId) => {
    return (4.0 + Math.random() * 1.0).toFixed(1)
  }

  const handleSelectQuote = (quoteId) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de seleccionar esta cotización?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            dispatch({
              type: 'SELECT_QUOTE_FOR_SERVICE',
              payload: {
                serviceId: service.id,
                quoteId: quoteId
              }
            })
            Alert.alert('Éxito', 'Cotización seleccionada exitosamente')
          }
        }
      ]
    )
  }

  const handleSubmitQuote = () => {
    if (!quoteForm.precioTotal || !quoteForm.plazoDias) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos')
      return
    }

    const precioTotal = parseFloat(quoteForm.precioTotal)
    const plazoDias = parseInt(quoteForm.plazoDias)

    if (isNaN(precioTotal) || precioTotal <= 0) {
      Alert.alert('Error', 'El precio debe ser un número mayor a 0')
      return
    }

    if (isNaN(plazoDias) || plazoDias <= 0) {
      Alert.alert('Error', 'El plazo debe ser un número mayor a 0')
      return
    }

    if (miCotizacion) {
      if (service.estado === 'ASIGNADO') {
        Alert.alert('Error', 'No puedes editar una cotización de un servicio ya asignado')
        return
      }

      dispatch({
        type: 'UPDATE_QUOTE',
        payload: {
          id: miCotizacion.id,
          precioTotal: precioTotal,
          plazoDias: plazoDias,
          notas: quoteForm.notas
        }
      })
      Alert.alert('Éxito', 'Cotización actualizada exitosamente')
      navigation.navigate('CotizacionesTab', { screen: 'QuotesList' })
    } else {
      const nuevaCotizacion = {
        id: `quote-${Date.now()}`,
        serviceId: service.id,
        proveedorServicioId: currentUser.id,
        precioTotal: precioTotal,
        plazoDias: plazoDias,
        notas: quoteForm.notas,
        estado: 'PENDIENTE',
        fechaCreacion: new Date().toISOString()
      }

      dispatch({
        type: 'CREATE_QUOTE',
        payload: nuevaCotizacion
      })
      Alert.alert('Éxito', 'Cotización enviada exitosamente')
      navigation.navigate('CotizacionesTab', { screen: 'QuotesList' })
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{service.titulo}</Text>
        <View style={[
          styles.statusBadge,
          styles[`statusBadge${service.estado}`]
        ]}>
          <Text style={styles.statusBadgeText}>
            {getEstadoText(service.estado)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Datos del Servicio</Text>
        <Text style={styles.dataItem}><Text style={styles.label}>Descripción:</Text> {service.descripcion}</Text>
        <Text style={styles.dataItem}><Text style={styles.label}>Categoría:</Text> {service.categoria}</Text>
        <Text style={styles.dataItem}><Text style={styles.label}>📅 Fecha Preferida:</Text> {formatDate(service.fechaPreferida)}</Text>
        <Text style={styles.dataItem}><Text style={styles.label}>📍 Ubicación:</Text> {service.direccion}, {service.ciudad}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Insumos Requeridos</Text>
        {insumosRequeridos.length === 0 ? (
          <Text style={styles.emptyText}>No se requieren insumos específicos.</Text>
        ) : (
          insumosRequeridos.map((req, idx) => (
            <View key={idx} style={styles.insumoItem}>
              <Text style={styles.insumoText}>
                {req.nombre} - {req.cantidad} {req.unidad}
              </Text>
            </View>
          ))
        )}
      </View>

      {currentUser.rol === 'SOLICITANTE' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📄 Cotizaciones Recibidas ({serviceQuotes.length})</Text>
            {serviceQuotes.length > 0 && (
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Ordenar:</Text>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortOrder('precio-asc')}
                >
                  <Text style={styles.sortButtonText}>Menor Precio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortOrder('plazo-asc')}
                >
                  <Text style={styles.sortButtonText}>Menor Plazo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {serviceQuotes.length === 0 ? (
            <Text style={styles.emptyText}>Aún no has recibido cotizaciones.</Text>
          ) : (
            sortedQuotes.map(quote => (
              <View key={quote.id} style={styles.quoteCard}>
                <Text style={styles.quoteProvider}>
                  {getProveedorName(quote.proveedorServicioId)} ⭐ {getProveedorRating(quote.proveedorServicioId)}
                </Text>
                <Text style={styles.quotePrice}>${quote.precioTotal.toLocaleString()}</Text>
                <Text style={styles.quotePlazo}>{quote.plazoDias} {quote.plazoDias === 1 ? 'día' : 'días'}</Text>
                {service.estado !== 'ASIGNADO' && quote.estado === 'PENDIENTE' && (
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectQuote(quote.id)}
                  >
                    <Text style={styles.selectButtonText}>Seleccionar</Text>
                  </TouchableOpacity>
                )}
                {service.estado === 'ASIGNADO' && quote.id === service.cotizacionSeleccionadaId && (
                  <Text style={styles.selectedText}>Seleccionada</Text>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {currentUser.rol === 'PROVEEDOR_SERVICIO' && service.estado !== 'ASIGNADO' && service.estado !== 'COMPLETADO' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📝 {miCotizacion ? 'Editar Mi Cotización' : 'Enviar Cotización'}
          </Text>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>
              Precio Total ($) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.formInput}
              value={quoteForm.precioTotal}
              onChangeText={(text) => setQuoteForm({ ...quoteForm, precioTotal: text })}
              placeholder="Ej: 15000"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>
              Plazo (días) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.formInput}
              value={quoteForm.plazoDias}
              onChangeText={(text) => setQuoteForm({ ...quoteForm, plazoDias: text })}
              placeholder="Ej: 3"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Notas (opcional)</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={quoteForm.notas}
              onChangeText={(text) => setQuoteForm({ ...quoteForm, notas: text })}
              placeholder="Agrega notas adicionales..."
              multiline
              numberOfLines={4}
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuote}>
            <Text style={styles.submitButtonText}>
              {miCotizacion ? 'Actualizar Cotización' : 'Enviar Cotización'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  statusBadge: {
    alignSelf: 'flex-start',
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
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  dataItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  label: {
    fontWeight: '600',
    color: '#333'
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  insumoItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  insumoText: {
    fontSize: 14,
    color: '#333'
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8
  },
  sortLabel: {
    fontSize: 12,
    color: '#666'
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  sortButtonText: {
    fontSize: 12,
    color: '#007AFF'
  },
  quoteCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  quoteProvider: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  quotePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  quotePlazo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  selectButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  selectedText: {
    color: '#4CAF50',
    fontWeight: '600'
  },
  formField: {
    marginBottom: 16
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  required: {
    color: '#f44336'
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default ServiceDetailScreen

