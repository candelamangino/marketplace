/**
 * Datos mock de usuarios para autenticación simulada
 * 
 * Cada usuario tiene:
 * - id: identificador único
 * - nombre: nombre completo
 * - email: correo electrónico (usado para login)
 * - password: contraseña (en producción esto estaría hasheado)
 * - rol: uno de los tres roles del sistema
 */

export const usersMock = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'solicitante@test.com',
    password: '123456',
    rol: 'SOLICITANTE'
  },
  {
    id: '2',
    nombre: 'María García',
    email: 'proveedor@test.com',
    password: '123456',
    rol: 'PROVEEDOR_SERVICIO',
    rating: '4.8'
  },
  {
    id: '3',
    nombre: 'Carlos Rodríguez',
    email: 'insumos@test.com',
    password: '123456',
    rol: 'PROVEEDOR_INSUMOS'
  },
  {
    id: '4',
    nombre: 'Ana Martínez',
    email: 'insumos2@test.com',
    password: '123456',
    rol: 'PROVEEDOR_INSUMOS'
  },
  {
    id: '5',
    nombre: 'Luis Fernández',
    email: 'proveedor2@test.com',
    password: '123456',
    rol: 'PROVEEDOR_SERVICIO',
    rating: '4.5'
  }
]

