/**
 * Datos mock de ofertas de insumos (packs)
 * 
 * Los packs son ofertas que los PROVEEDOR_INSUMOS crean para un servicio específico.
 * Incluyen una combinación de insumos con un precio total.
 * 
 * Los datos están organizados para que coincidan con las imágenes de referencia:
 * - Pack Mantenimiento Piscina Básico
 * - Pack Jardinería Premium
 */

export const supplyOffersMock = [
  {
    id: '1',
    nombre: 'Pack Mantenimiento Piscina Básico',
    serviceId: '1', // Asociado a un servicio (puede ser cualquier servicio)
    proveedorInsumosId: '3', // Ana Martínez (Proveedor de Insumos)
    precioTotal: 1800,
    items: [
      { insumoId: '1', cantidad: 2 }, // Cloro en polvo - 2 kg
      { insumoId: '2', cantidad: 1 }, // pH+ Líquido - 1 litro
      { insumoId: '3', cantidad: 1 } // Alguicida - 1 litro
    ],
    fechaCreacion: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Pack Jardinería Premium',
    serviceId: '2', // Asociado a un servicio
    proveedorInsumosId: '3', // Ana Martínez (Proveedor de Insumos)
    precioTotal: 2500,
    items: [
      { insumoId: '4', cantidad: 5 }, // Fertilizante orgánico - 5 kg
      { insumoId: '5', cantidad: 10 } // Bolsas residuos 100L - 10 unidades
    ],
    fechaCreacion: '2024-01-18'
  },
  // Pack adicional para mantener compatibilidad
  {
    id: '3',
    nombre: 'Pack completo instalación eléctrica',
    serviceId: '3',
    proveedorInsumosId: '4',
    precioTotal: 18000,
    items: [
      { insumoId: '7', cantidad: 500 },
      { insumoId: '8', cantidad: 1 }
    ],
    fechaCreacion: '2024-01-20'
  }
]

