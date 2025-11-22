/**
 * Datos mock de servicios
 * 
 * Cada servicio representa una solicitud de trabajo que un SOLICITANTE
 * publica para que los PROVEEDOR_SERVICIO puedan cotizar.
 * 
 * Estados posibles:
 * - PUBLICADO: servicio recién creado, disponible para cotizar
 * - EN_EVALUACION: el solicitante está revisando cotizaciones
 * - ASIGNADO: se seleccionó una cotización, el servicio está en ejecución
 * - COMPLETADO: el servicio fue finalizado
 */

export const servicesMock = [
  {
    id: '1',
    titulo: 'Instalación de sistema eléctrico en casa nueva',
    descripcion: 'Necesito instalar todo el sistema eléctrico en una casa de 120m². Incluye cableado, tablero principal, tomas y luces.',
    categoria: 'Electricidad',
    direccion: 'Av. 18 de Julio 1234',
    ciudad: 'Montevideo',
    fechaPreferida: '2024-02-15',
    estado: 'PUBLICADO',
    solicitanteId: '1',
    insumosRequeridos: [
      { insumoId: '1', cantidad: 500, unidad: 'metro' }, // Cable
      { insumoId: '2', cantidad: 1, unidad: 'unidad' },    // Tablero
      { insumoId: '3', cantidad: 20, unidad: 'unidad' }   // Tomas
    ],
    cotizacionesIds: ['1', '2'],
    cotizacionSeleccionadaId: null
  },
  {
    id: '2',
    titulo: 'Reparación de techo con filtraciones',
    descripcion: 'Techo con múltiples filtraciones que necesita reparación completa. Aproximadamente 80m².',
    categoria: 'Construcción',
    direccion: 'Calle Rivera 567',
    ciudad: 'Montevideo',
    fechaPreferida: '2024-02-20',
    estado: 'EN_EVALUACION',
    solicitanteId: '1',
    insumosRequeridos: [
      { insumoId: '4', cantidad: 50, unidad: 'm²' },   // Láminas de zinc
      { insumoId: '5', cantidad: 2, unidad: 'litro' }    // Pintura impermeabilizante
    ],
    cotizacionesIds: ['3'],
    cotizacionSeleccionadaId: null
  },
  {
    id: '3',
    titulo: 'Pintura completa de apartamento',
    descripcion: 'Pintura interior y exterior de apartamento de 2 dormitorios. Incluye preparación de superficies.',
    categoria: 'Pintura',
    direccion: 'Bvar. Artigas 890',
    ciudad: 'Montevideo',
    fechaPreferida: '2024-02-25',
    estado: 'ASIGNADO',
    solicitanteId: '4',
    insumosRequeridos: [
      { insumoId: '6', cantidad: 30, unidad: 'unidad' },   // Latas de pintura
      { insumoId: '7', cantidad: 5, unidad: 'unidad' }      // Rodillos
    ],
    cotizacionesIds: ['4', '5'],
    cotizacionSeleccionadaId: '4'
  },
  {
    id: '4',
    titulo: 'Instalación de aire acondicionado',
    descripcion: 'Instalación de 2 unidades de aire acondicionado split en oficina.',
    categoria: 'Climatización',
    direccion: 'Av. Libertador 234',
    ciudad: 'Montevideo',
    fechaPreferida: '2024-03-01',
    estado: 'PUBLICADO',
    solicitanteId: '4',
    insumosRequeridos: [
      { insumoId: '8', cantidad: 2, unidad: 'unidad' },    // Unidades de AC
      { insumoId: '1', cantidad: 100, unidad: 'metro' }   // Cable
    ],
    cotizacionesIds: [],
    cotizacionSeleccionadaId: null
  }
]

