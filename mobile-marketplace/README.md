# Marketplace Mobile

Aplicación móvil React Native con Expo SDK 54 que replica la funcionalidad de la versión web del marketplace.

## Requisitos

- Node.js 18+
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Expo Go app en tu dispositivo móvil (versión 1017756 o compatible)

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npx expo start
```

3. Escanea el código QR con Expo Go en tu dispositivo móvil.

## Estructura del Proyecto

```
mobile-marketplace/
├── src/
│   ├── context/          # Context y Reducer (estado global)
│   ├── data/             # Datos mock (usuarios, servicios, etc.)
│   ├── navigation/       # Configuración de navegación
│   └── screens/          # Pantallas de la aplicación
│       ├── ServicesStack/
│       ├── PublicarStack/
│       ├── CotizacionesStack/
│       └── PerfilStack/
├── App.js                # Punto de entrada
└── package.json
```

## Funcionalidades

- **Login**: Autenticación simulada con selección de rol
- **Servicios**: Lista y detalle de servicios (según rol)
- **Publicar**: Formulario para crear servicios (solo SOLICITANTE)
- **Cotizaciones**: Lista de cotizaciones enviadas (solo PROVEEDOR_SERVICIO)
- **Perfil**: Información del usuario y cerrar sesión

## Roles

- **SOLICITANTE**: Puede crear servicios y ver cotizaciones recibidas
- **PROVEEDOR_SERVICIO**: Puede ver servicios disponibles y enviar cotizaciones
- **PROVEEDOR_INSUMOS**: Puede gestionar catálogo de insumos (no implementado en mobile)

## Versiones Exactas

- Expo SDK: ~54.0.0
- React: 18.2.0
- React Native: 0.76.0
- React Navigation: ^6.1.16

## Notas

- Esta app es compatible con Expo Go
- Los datos son mock (simulados)
- El login es simulado para fines educativos

