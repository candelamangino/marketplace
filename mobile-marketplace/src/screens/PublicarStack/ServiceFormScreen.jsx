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
import { useNavigation } from '@react-navigation/native'
import { AppContext } from '../../context/AppContext'

/**
 * Pantalla de Formulario de Servicio - ServiceFormScreen
 * 
 * Permite a los usuarios con rol SOLICITANTE crear un nuevo servicio.
 * 
 * El formulario incluye:
 * - Datos básicos: título, descripción, categoría, fecha preferida
 * - Ubicación: dirección y ciudad
 * - Insumos requeridos: lista de insumos necesarios
 * 
 * Ciclo de vida:
 * - Al montar, inicializa el estado del formulario vacío
 * - Cuando el usuario completa y envía, crea el servicio y navega a la lista
 */
const ServiceFormScreen = () => {
  const { state, dispatch } = useContext(AppContext)
  const navigation = useNavigation()

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    fechaPreferida: '',
    direccion: '',
    ciudad: '',
    insumosRequeridos: []
  })

  const [insumoActual, setInsumoActual] = useState({
    insumoId: '',
    nombrePersonalizado: '',
    tipoNombre: 'PREDEFINIDO',
    cantidad: '',
    unidad: ''
  })

  const categorias = [
    'Electricidad',
    'Construcción',
    'Pintura',
    'Plomería',
    'Climatización',
    'Carpintería',
    'Jardinería',
    'Otro'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInsumoChange = (field, value) => {
    setInsumoActual(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddInsumo = () => {
    const nombreInsumo = insumoActual.tipoNombre === 'PREDEFINIDO' 
      ? insumoActual.insumoId 
      : insumoActual.nombrePersonalizado

    if (!nombreInsumo || !insumoActual.cantidad || !insumoActual.unidad) {
      Alert.alert('Error', 'Por favor completa todos los campos: nombre del insumo, cantidad y unidad')
      return
    }

    if (insumoActual.tipoNombre === 'OTRO' && !insumoActual.nombrePersonalizado.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el insumo')
      return
    }

    let nombreFinal = ''
    if (insumoActual.tipoNombre === 'PREDEFINIDO') {
      const insumoSeleccionado = state.supplies.find(s => s.id === insumoActual.insumoId)
      nombreFinal = insumoSeleccionado ? insumoSeleccionado.nombre : 'Insumo no encontrado'
    } else {
      nombreFinal = insumoActual.nombrePersonalizado.trim()
    }

    setFormData(prev => ({
      ...prev,
      insumosRequeridos: [
        ...prev.insumosRequeridos,
        {
          nombre: nombreFinal,
          cantidad: parseInt(insumoActual.cantidad),
          unidad: insumoActual.unidad.trim()
        }
      ]
    }))

    setInsumoActual({ 
      insumoId: '', 
      nombrePersonalizado: '', 
      tipoNombre: 'PREDEFINIDO',
      cantidad: '', 
      unidad: '' 
    })
  }

  const handleRemoveInsumo = (index) => {
    setFormData(prev => ({
      ...prev,
      insumosRequeridos: prev.insumosRequeridos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    if (!formData.titulo || !formData.descripcion || !formData.categoria || 
        !formData.fechaPreferida || !formData.direccion || !formData.ciudad) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos')
      return
    }

    const newService = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      fechaPreferida: formData.fechaPreferida,
      estado: 'PUBLICADO',
      solicitanteId: state.currentUser.id,
      insumosRequeridos: formData.insumosRequeridos,
      cotizacionesIds: [],
      cotizacionSeleccionadaId: null
    }

    dispatch({ type: 'CREATE_SERVICE', payload: newService })
    Alert.alert('Éxito', 'Servicio publicado exitosamente')
    navigation.navigate('ServiciosTab', { screen: 'ServicesList' })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Básicos</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>
            Título del servicio <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.titulo}
            onChangeText={(text) => handleInputChange('titulo', text)}
            placeholder="Ej: Limpieza de jardín residencial"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Descripción detallada <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.descripcion}
            onChangeText={(text) => handleInputChange('descripcion', text)}
            placeholder="Describe el servicio que necesitas..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Categoría <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryButtons}>
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  formData.categoria === cat && styles.categoryButtonActive
                ]}
                onPress={() => handleInputChange('categoria', cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.categoria === cat && styles.categoryButtonTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Fecha preferida <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.fechaPreferida}
            onChangeText={(text) => handleInputChange('fechaPreferida', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>
            Dirección <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(text) => handleInputChange('direccion', text)}
            placeholder="Ej: Av. Libertador 1234"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Ciudad <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formData.ciudad}
            onChangeText={(text) => handleInputChange('ciudad', text)}
            placeholder="Ej: Buenos Aires"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insumos Requeridos</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Nombre del insumo</Text>
          <View style={styles.insumoSelector}>
            <TouchableOpacity
              style={[
                styles.insumoTypeButton,
                insumoActual.tipoNombre === 'PREDEFINIDO' && styles.insumoTypeButtonActive
              ]}
              onPress={() => {
                setInsumoActual({ ...insumoActual, tipoNombre: 'PREDEFINIDO', nombrePersonalizado: '' })
              }}
            >
              <Text style={styles.insumoTypeButtonText}>Predefinido</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.insumoTypeButton,
                insumoActual.tipoNombre === 'OTRO' && styles.insumoTypeButtonActive
              ]}
              onPress={() => {
                setInsumoActual({ ...insumoActual, tipoNombre: 'OTRO', insumoId: '' })
              }}
            >
              <Text style={styles.insumoTypeButtonText}>Otro</Text>
            </TouchableOpacity>
          </View>

          {insumoActual.tipoNombre === 'PREDEFINIDO' ? (
            <View style={styles.selectContainer}>
              {state.supplies.map(supply => (
                <TouchableOpacity
                  key={supply.id}
                  style={[
                    styles.supplyOption,
                    insumoActual.insumoId === supply.id && styles.supplyOptionActive
                  ]}
                  onPress={() => {
                    setInsumoActual({ 
                      ...insumoActual, 
                      insumoId: supply.id,
                      unidad: supply.unidad 
                    })
                  }}
                >
                  <Text style={styles.supplyOptionText}>
                    {supply.nombre} ({supply.unidad})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={insumoActual.nombrePersonalizado}
              onChangeText={(text) => handleInsumoChange('nombrePersonalizado', text)}
              placeholder="Ingresa el nombre del insumo"
            />
          )}
        </View>

        <View style={styles.insumoRow}>
          <View style={[styles.field, styles.insumoFieldSmall]}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={styles.input}
              value={insumoActual.cantidad}
              onChangeText={(text) => handleInsumoChange('cantidad', text)}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.field, styles.insumoFieldSmall]}>
            <Text style={styles.label}>Unidad</Text>
            <TextInput
              style={styles.input}
              value={insumoActual.unidad}
              onChangeText={(text) => handleInsumoChange('unidad', text)}
              placeholder="Ej: kg, litro, unidad"
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddInsumo}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {formData.insumosRequeridos.length > 0 && (
          <View style={styles.insumosList}>
            {formData.insumosRequeridos.map((req, index) => (
              <View key={index} style={styles.insumoItem}>
                <Text style={styles.insumoItemText}>
                  {req.nombre} - {req.cantidad} {req.unidad}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveInsumo(index)}
                >
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Publicar Servicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  required: {
    color: '#f44336'
  },
  input: {
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
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333'
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  insumoSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8
  },
  insumoTypeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  insumoTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  insumoTypeButtonText: {
    fontSize: 14,
    color: '#333'
  },
  selectContainer: {
    maxHeight: 200
  },
  supplyOption: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  supplyOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF'
  },
  supplyOptionText: {
    fontSize: 14,
    color: '#333'
  },
  insumoRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end'
  },
  insumoFieldSmall: {
    flex: 1
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  insumosList: {
    marginTop: 12
  },
  insumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8
  },
  insumoItemText: {
    fontSize: 14,
    color: '#333'
  },
  removeButton: {
    fontSize: 20,
    color: '#f44336'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600'
  }
})

export default ServiceFormScreen

