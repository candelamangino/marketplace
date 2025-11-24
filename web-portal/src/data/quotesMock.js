/**
 * Datos mock de cotizaciones
 * 
 * Las cotizaciones son propuestas que los PROVEEDOR_SERVICIO envían
 * para un servicio específico. Incluyen precio, plazo y comentarios.
 * 
 * Estados:
 * - PENDIENTE: cotización enviada, esperando decisión
 * - ACEPTADA: el solicitante seleccionó esta cotización
 * - RECHAZADA: el solicitante rechazó esta cotización
 */

export const quotesMock = [
  {
    id: '1',
    serviceId: '1',
    proveedorServicioId: '2',
    precioTotal: 45000,
    plazoDias: 7,
    notas: 'Trabajo garantizado. Incluye materiales básicos.',
    estado: 'PENDIENTE',
    fechaCreacion: '2024-01-15'
  },
  {
    id: '2',
    serviceId: '1',
    proveedorServicioId: '5',
    precioTotal: 42000,
    plazoDias: 5,
    notas: 'Precio competitivo. Disponible inmediatamente.',
    estado: 'PENDIENTE',
    fechaCreacion: '2024-01-16'
  },
  {
    id: '3',
    serviceId: '2',
    proveedorServicioId: '2',
    precioTotal: 35000,
    plazoDias: 10,
    notas: 'Incluye mano de obra y materiales. Garantía de 1 año.',
    estado: 'PENDIENTE',
    fechaCreacion: '2024-01-18'
  },
  {
    id: '4',
    serviceId: '3',
    proveedorServicioId: '5',
    precioTotal: 28000,
    plazoDias: 6,
    notas: 'Pintura de primera calidad. Preparación incluida.',
    estado: 'ACEPTADA',
    fechaCreacion: '2024-01-20'
  },
  {
    id: '5',
    serviceId: '3',
    proveedorServicioId: '2',
    precioTotal: 32000,
    plazoDias: 8,
    notas: 'Incluye dos manos de pintura y sellado.',
    estado: 'RECHAZADA',
    fechaCreacion: '2024-01-21'
  }
]

