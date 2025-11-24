# Marketplace de Servicios - Versión Web

Aplicación web para un marketplace de servicios con gestión de insumos, desarrollada con React 18 + Vite.

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos para ejecutar

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   La aplicación se abrirá automáticamente en `http://localhost:3000`

### Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 👥 Usuarios de Prueba

La aplicación incluye usuarios mock para probar diferentes roles:

### Solicitante
- **Email:** `solicitante@test.com`
- **Password:** `123456`
- **Rol:** SOLICITANTE
- **Funcionalidades:** Crear servicios, ver cotizaciones, seleccionar proveedores

### Proveedor de Servicio
- **Email:** `proveedor@test.com`
- **Password:** `123456`
- **Rol:** PROVEEDOR_SERVICIO
- **Funcionalidades:** Ver servicios disponibles, crear cotizaciones, gestionar mis cotizaciones

### Proveedor de Insumos
- **Email:** `insumos@test.com`
- **Password:** `123456`
- **Rol:** PROVEEDOR_INSUMOS
- **Funcionalidades:** Gestionar catálogo de insumos, crear packs de insumos

## 📁 Estructura del Proyecto

```
web-portal/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout.jsx       # Layout principal con navbar y sidebar
│   │   ├── Navbar.jsx       # Barra de navegación superior
│   │   └── Sidebar.jsx      # Barra lateral de navegación
│   ├── context/             # Context API y Reducer
│   │   ├── AppContext.jsx   # Contexto global de la aplicación
│   │   └── appReducer.js    # Reducer para manejar el estado global
│   ├── data/                # Datos mock
│   │   ├── usersMock.js     # Usuarios de prueba
│   │   ├── servicesMock.js # Servicios mock
│   │   ├── quotesMock.js    # Cotizaciones mock
│   │   ├── suppliesMock.js  # Insumos mock
│   │   └── supplyOffersMock.js # Ofertas de insumos mock
│   ├── pages/               # Páginas de la aplicación
│   │   ├── LoginPage.jsx    # Página de inicio de sesión
│   │   ├── DashboardPage.jsx # Dashboard principal
│   │   ├── ServicesListPage.jsx # Lista de servicios
│   │   ├── ServiceDetailPage.jsx # Detalle de un servicio
│   │   ├── ServiceFormPage.jsx # Formulario para crear servicio
│   │   ├── SuppliesPage.jsx # Gestión de insumos
│   │   └── QuotesPage.jsx   # Mis cotizaciones
│   ├── routes/              # Configuración de rutas
│   │   └── AppRouter.jsx    # Router principal con protección de rutas
│   ├── styles/              # Estilos CSS
│   │   ├── global.css       # Estilos globales
│   │   ├── layout.css       # Estilos del layout
│   │   └── components.css   # Estilos de componentes
│   ├── docs/                # Documentación
│   │   └── conceptos-defensa.md # Conceptos para la defensa
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── index.html               # HTML principal
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
└── README.md                # Este archivo
```

## 🔑 Funcionalidades por Rol

### SOLICITANTE
- ✅ Crear nuevos servicios
- ✅ Ver lista de sus servicios
- ✅ Ver detalle de un servicio con cotizaciones recibidas
- ✅ Comparar cotizaciones
- ✅ Seleccionar una cotización (cambia el estado del servicio a ASIGNADO)
- ✅ Ver ofertas de packs de insumos

### PROVEEDOR_SERVICIO
- ✅ Ver servicios disponibles para cotizar
- ✅ Crear cotizaciones para servicios
- ✅ Editar/eliminar sus cotizaciones (si el servicio no está ASIGNADO)
- ✅ Ver lista de sus cotizaciones enviadas

### PROVEEDOR_INSUMOS
- ✅ Ver catálogo de sus insumos
- ✅ Crear nuevos insumos
- ✅ Editar insumos existentes
- ✅ Crear packs de insumos para servicios específicos

## 🎯 Tecnologías Utilizadas

- **React 18**: Biblioteca para construir interfaces de usuario
- **Vite**: Herramienta de build rápida
- **React Router DOM**: Navegación y enrutamiento
- **React Context API**: Gestión de estado global
- **useReducer**: Manejo de estado complejo
- **CSS puro**: Estilos sin frameworks (no Tailwind, no SCSS)

## 📊 Estado Global (Context + Reducer)

El estado global se maneja mediante:

- **AppContext**: Provee el estado y funciones de dispatch a toda la aplicación
- **appReducer**: Maneja todas las acciones que modifican el estado:
  - `LOGIN_SUCCESS`: Guarda el usuario logueado
  - `LOGOUT`: Limpia el usuario
  - `CREATE_SERVICE`: Crea un nuevo servicio
  - `UPDATE_SERVICE`: Actualiza un servicio
  - `CREATE_QUOTE`: Crea una cotización
  - `SELECT_QUOTE_FOR_SERVICE`: Selecciona una cotización y cambia el estado del servicio
  - Y más...

## 🛣️ Rutas de la Aplicación

- `/login` - Página de inicio de sesión (pública)
- `/` - Dashboard (protegida, contenido según rol)
- `/servicios` - Lista de servicios (protegida)
- `/servicios/:id` - Detalle de un servicio (protegida)
- `/servicios/nuevo` - Crear servicio (solo SOLICITANTE)
- `/insumos` - Catálogo de insumos (solo PROVEEDOR_INSUMOS)
- `/cotizaciones` - Mis cotizaciones (solo PROVEEDOR_SERVICIO)

## 📝 Notas Importantes

- **Autenticación simulada**: Los usuarios se validan contra datos mock. En producción, esto se haría contra un backend real.
- **Datos mock**: Todos los datos (servicios, cotizaciones, insumos) están en archivos JS. En producción, vendrían de una API.
- **Sin persistencia**: Al recargar la página, los datos vuelven a los valores iniciales de los mocks.
- **IDs temporales**: Los IDs de nuevas entidades se generan con `Date.now()`. En producción, el backend los generaría.

## 🚧 Pendiente para Versión Mobile

- Adaptación de componentes para React Native
- Navegación con React Navigation (stack y tabs)
- Componentes nativos (TouchableOpacity, ScrollView, etc.)
- Persistencia local con AsyncStorage
- Integración con API real (cuando esté disponible)

## 📚 Documentación Adicional

Para conceptos técnicos y explicaciones detalladas sobre React, Context, Reducer, etc., consulta:
- `/src/docs/conceptos-defensa.md`

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como trabajo práctico universitario. El código está comentado en español para facilitar el estudio y la defensa del proyecto.

