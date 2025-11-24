/**
 * Datos mock de insumos
 * 
 * Los insumos son productos/materiales que los PROVEEDOR_INSUMOS
 * ofrecen en su catálogo. Cada servicio puede requerir ciertos insumos.
 * 
 * Los datos están organizados para que coincidan con las imágenes de referencia:
 * - Insumos de piscinas (Cloro, pH+, Alguicida)
 * - Insumos de jardinería (Fertilizante orgánico)
 * - Insumos generales (Bolsas de residuos, Detergente)
 */

export const suppliesMock = [
  // Insumos de piscinas (para el proveedor de insumos id '3' - Ana Martínez)
  {
    id: '1',
    nombre: 'Cloro en polvo',
    categoria: 'Piscinas',
    unidad: 'kg',
    precioUnitario: 850,
    stock: 50,
    proveedorInsumosId: '3'
  },
  {
    id: '2',
    nombre: 'pH+ Líquido',
    categoria: 'Piscinas',
    unidad: 'litro',
    precioUnitario: 450,
    stock: 30,
    proveedorInsumosId: '3'
  },
  {
    id: '3',
    nombre: 'Alguicida',
    categoria: 'Piscinas',
    unidad: 'litro',
    precioUnitario: 650,
    stock: 25,
    proveedorInsumosId: '3'
  },
  // Insumos de jardinería
  {
    id: '4',
    nombre: 'Fertilizante orgánico',
    categoria: 'Jardinería',
    unidad: 'kg',
    precioUnitario: 320,
    stock: 100,
    proveedorInsumosId: '3'
  },
  // Insumos generales
  {
    id: '5',
    nombre: 'Bolsas residuos 100L',
    categoria: 'General',
    unidad: 'unidad',
    precioUnitario: 150,
    stock: 200,
    proveedorInsumosId: '3'
  },
  {
    id: '6',
    nombre: 'Detergente multiuso',
    categoria: 'Limpieza',
    unidad: 'litro',
    precioUnitario: 280,
    stock: 75,
    proveedorInsumosId: '3'
  },
  // Insumos adicionales para otros proveedores (mantener compatibilidad)
  {
    id: '7',
    nombre: 'Cable eléctrico 2.5mm',
    categoria: 'Electricidad',
    unidad: 'metro',
    precioUnitario: 150,
    stock: 1000,
    proveedorInsumosId: '4'
  },
  {
    id: '8',
    nombre: 'Tablero eléctrico principal',
    categoria: 'Electricidad',
    unidad: 'unidad',
    precioUnitario: 8500,
    stock: 15,
    proveedorInsumosId: '4'
  }
]
