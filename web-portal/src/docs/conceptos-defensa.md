# Conceptos para la Defensa del Proyecto

Este documento explica los conceptos técnicos utilizados en el proyecto, pensado para la defensa del trabajo práctico.

---

## 📦 Conceptos Básicos de JavaScript y React

### ¿Qué es un Componente?

Un **componente** es una pieza reutilizable de código que define cómo se ve y se comporta una parte de la interfaz.

**Ejemplo:**
```jsx
// Componente funcional (el tipo que usamos en este proyecto)
function Boton({ texto, onClick }) {
  return <button onClick={onClick}>{texto}</button>
}

// Uso del componente
<Boton texto="Hacer clic" onClick={() => alert('Hola!')} />
```

**Características:**
- Es como una función que retorna HTML (JSX)
- Puede recibir datos mediante **props**
- Puede tener su propio **estado** interno
- Se puede reutilizar múltiples veces

### ¿Qué son las Props?

**Props** (propiedades) son datos que se pasan de un componente padre a un componente hijo.

**Ejemplo:**
```jsx
// Componente padre
function App() {
  const nombre = "Juan"
  return <Saludo nombre={nombre} />  // Pasamos "nombre" como prop
}

// Componente hijo recibe la prop
function Saludo({ nombre }) {
  return <h1>Hola, {nombre}!</h1>  // Usa la prop
}
```

**Comunicación hijo → padre:**
Se hace mediante **callbacks** (funciones que se pasan como props):

```jsx
function Padre() {
  const [contador, setContador] = useState(0)
  
  // Función que se pasa al hijo
  const incrementar = () => {
    setContador(contador + 1)
  }
  
  return <Hijo onIncrementar={incrementar} />
}

function Hijo({ onIncrementar }) {
  return <button onClick={onIncrementar}>Incrementar</button>
}
```

### ¿Qué es el Estado?

El **estado** es información que puede cambiar durante la ejecución de la aplicación y que afecta cómo se renderiza el componente.

**Ejemplo:**
```jsx
function Contador() {
  const [numero, setNumero] = useState(0)  // Estado inicial: 0
  
  return (
    <div>
      <p>Contador: {numero}</p>
      <button onClick={() => setNumero(numero + 1)}>Sumar</button>
    </div>
  )
}
```

**Diferencia entre props y estado:**
- **Props**: Datos que vienen del componente padre (no se modifican dentro del hijo)
- **Estado**: Datos que pertenecen al componente y pueden cambiar

---

## 🔄 Ciclo de Vida de un Componente

En React, los componentes pasan por diferentes fases:

1. **Montaje**: El componente se crea y se inserta en el DOM
2. **Actualización**: El componente se actualiza cuando cambian props o estado
3. **Desmontaje**: El componente se elimina del DOM

### useEffect y el Ciclo de Vida

`useEffect` es un hook que nos permite ejecutar código en diferentes momentos del ciclo de vida:

```jsx
useEffect(() => {
  // Este código se ejecuta después de que el componente se monta
  // y cada vez que cambian las dependencias
  
  return () => {
    // Este código se ejecuta cuando el componente se desmonta
    // (función de limpieza)
  }
}, [dependencias])  // Array de dependencias
```

**Ejemplo práctico:**
```jsx
function Usuario({ userId }) {
  const [usuario, setUsuario] = useState(null)
  
  useEffect(() => {
    // Se ejecuta cuando el componente se monta
    // y cuando cambia userId
    fetch(`/api/usuarios/${userId}`)
      .then(res => res.json())
      .then(data => setUsuario(data))
    
    // Función de limpieza (se ejecuta al desmontar o antes de re-ejecutar)
    return () => {
      // Cancelar petición si es necesario
    }
  }, [userId])  // Dependencia: se re-ejecuta si userId cambia
  
  return <div>{usuario?.nombre}</div>
}
```

**Array de dependencias:**
- `[]` (vacío): Se ejecuta solo al montar
- `[variable]`: Se ejecuta al montar y cuando `variable` cambia
- Sin array: Se ejecuta en cada render (¡cuidado, puede causar loops infinitos!)

---

## 🎣 Hooks de React

### useState

`useState` permite agregar estado a un componente funcional.

**Sintaxis:**
```jsx
const [valor, setValor] = useState(valorInicial)
```

**Ejemplo:**
```jsx
function Formulario() {
  const [email, setEmail] = useState('')  // Estado inicial: string vacío
  
  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}  // Actualiza el estado
    />
  )
}
```

**¿Qué hace?**
- Retorna un array con dos elementos:
  1. El valor actual del estado
  2. Una función para actualizarlo
- Cuando llamas a `setValor`, React re-renderiza el componente con el nuevo valor

### useEffect

`useEffect` permite ejecutar efectos secundarios (peticiones a APIs, suscripciones, manipulación del DOM).

**Casos de uso comunes:**
- Cargar datos al montar el componente
- Suscribirse a eventos
- Limpiar recursos al desmontar

**Ejemplo:**
```jsx
function ServiciosList() {
  const [servicios, setServicios] = useState([])
  
  useEffect(() => {
    // Se ejecuta al montar
    fetch('/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
  }, [])  // Array vacío = solo al montar
  
  return <div>{/* renderizar servicios */}</div>
}
```

---

## 🌐 React Context

### Problema que Resuelve

Sin Context, para pasar datos desde un componente muy arriba hasta uno muy abajo, tendrías que pasar las props por todos los componentes intermedios. Esto se llama **"prop drilling"**.

**Ejemplo del problema:**
```jsx
// App tiene el usuario
function App() {
  const usuario = { nombre: "Juan" }
  return <Layout usuario={usuario} />  // Pasa usuario
}

function Layout({ usuario }) {
  return <Header usuario={usuario} />  // Pasa usuario
}

function Header({ usuario }) {
  return <Navbar usuario={usuario} />  // Pasa usuario
}

function Navbar({ usuario }) {
  return <div>{usuario.nombre}</div>  // Finalmente lo usa
}
```

### Solución con Context

Context crea un "canal" por donde los datos fluyen directamente, sin pasar por componentes intermedios.

**Ejemplo:**
```jsx
// 1. Crear el contexto
const AppContext = createContext()

// 2. Crear un Provider que envuelve la app
function AppProvider({ children }) {
  const usuario = { nombre: "Juan" }
  return (
    <AppContext.Provider value={{ usuario }}>
      {children}
    </AppContext.Provider>
  )
}

// 3. Usar el contexto en cualquier componente
function Navbar() {
  const { usuario } = useContext(AppContext)  // Acceso directo
  return <div>{usuario.nombre}</div>
}
```

### ¿Por qué lo Usamos en Este Proyecto?

Usamos Context para:
- **Usuario logueado**: Cualquier componente necesita saber quién está logueado
- **Servicios, cotizaciones, insumos**: Datos compartidos en toda la app
- **Funciones de dispatch**: Para modificar el estado desde cualquier componente

**Dónde lo usamos:**
- `AppContext.jsx`: Define el contexto y el Provider
- `appReducer.js`: Define cómo se modifica el estado
- Cualquier componente puede usar `useContext(AppContext)` para acceder al estado

---

## 🔄 useReducer

### ¿Qué es?

`useReducer` es similar a `useState`, pero para estados complejos con múltiples propiedades y muchas formas de modificarlos.

**Sintaxis:**
```jsx
const [state, dispatch] = useReducer(reducer, initialState)
```

**Ejemplo:**
```jsx
// Reducer: función que define cómo se actualiza el estado
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENTAR':
      return { ...state, contador: state.contador + 1 }
    case 'DECREMENTAR':
      return { ...state, contador: state.contador - 1 }
    default:
      return state
  }
}

// Uso
function Contador() {
  const [state, dispatch] = useReducer(reducer, { contador: 0 })
  
  return (
    <div>
      <p>{state.contador}</p>
      <button onClick={() => dispatch({ type: 'INCREMENTAR' })}>
        Sumar
      </button>
    </div>
  )
}
```

### ¿Por qué Usamos Reducer en Este Proyecto?

Porque nuestro estado tiene:
- Múltiples propiedades (currentUser, services, quotes, supplies, etc.)
- Muchas acciones diferentes (LOGIN_SUCCESS, CREATE_SERVICE, UPDATE_QUOTE, etc.)
- Lógica compleja de actualización (al crear una cotización, también actualizamos el servicio)

**Ventajas:**
- Centraliza la lógica de actualización del estado
- Facilita el debugging (puedes ver todas las acciones)
- Hace el código más predecible

---

## 🔐 Proceso de Autenticación

### Flujo Típico en una App Real

1. Usuario ingresa email y password
2. Se envía al backend para validar
3. Backend retorna un token (JWT) si es válido
4. Se guarda el token (localStorage, cookies)
5. Se guarda el usuario en el estado/contexto
6. Se redirige al dashboard

### Cómo lo Simulamos en Este Proyecto

1. Usuario ingresa email y password en `LoginPage`
2. Se busca en `usersMock.js` un usuario con ese email y password
3. Si se encuentra, se guarda en el contexto con `dispatch({ type: 'LOGIN_SUCCESS', payload: user })`
4. Se redirige al dashboard con `navigate('/')`

**Código relevante:**
```jsx
// LoginPage.jsx
const user = usersMock.find(
  u => u.email === email && u.password === password
)

if (user) {
  dispatch({ type: 'LOGIN_SUCCESS', payload: user })
  navigate('/')
}
```

**Nota:** En producción, esto se haría con una petición HTTP:
```jsx
// Ejemplo de cómo sería con API real
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
const { token, user } = await response.json()
localStorage.setItem('token', token)
dispatch({ type: 'LOGIN_SUCCESS', payload: user })
```

---

## 🛣️ React Router

### ¿Qué es una Ruta?

Una **ruta** es una URL que muestra un componente específico.

**Ejemplo:**
- `/login` → muestra `LoginPage`
- `/servicios` → muestra `ServicesListPage`
- `/servicios/123` → muestra `ServiceDetailPage` con id=123

### Componentes de React Router

- **`<Routes>`**: Contenedor de todas las rutas
- **`<Route>`**: Define una ruta específica
- **`<Link>`**: Navegación sin recargar la página (como `<a>` pero mejor)
- **`<Navigate>`**: Redirige programáticamente
- **`useNavigate()`**: Hook para navegar desde código
- **`useParams()`**: Obtiene parámetros de la URL (ej: `:id`)

**Ejemplo:**
```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/servicios/:id" element={<ServiceDetail />} />
</Routes>

// En ServiceDetail:
const { id } = useParams()  // Obtiene el id de la URL
```

### Protección de Rutas

En nuestro proyecto, protegemos rutas verificando si hay un usuario logueado:

```jsx
const ProtectedRoute = ({ children }) => {
  const { state } = useContext(AppContext)
  
  if (!state.currentUser) {
    return <Navigate to="/login" />  // Redirige si no está logueado
  }
  
  return children  // Muestra el componente si está logueado
}
```

---

## 📱 React Native (Conceptos para la Defensa)

### Diferencia General: Navegación Stack vs Tabs

**Navegación Stack (pila):**
- Una pantalla se apila sobre otra
- Ejemplo: Lista de servicios → Detalle de servicio
- El botón "atrás" vuelve a la pantalla anterior
- **React Navigation:** `createStackNavigator`

**Navegación Tabs (pestañas):**
- Múltiples pantallas accesibles desde la parte inferior/superior
- Ejemplo: Dashboard, Servicios, Perfil (cada una en una pestaña)
- No hay "atrás", cambias entre pestañas
- **React Navigation:** `createBottomTabNavigator`

**En nuestro proyecto web:**
- Usamos navegación tipo "stack" con React Router
- El sidebar es similar a tabs, pero en la web

### Componentes Nativos

En React Native, en vez de `<div>`, `<button>`, etc., usamos:
- `<View>` → como `<div>`
- `<Text>` → para texto (no puedes poner texto directamente)
- `<TouchableOpacity>` → botón presionable
- `<ScrollView>` → contenido scrolleable
- `<TextInput>` → input de texto

---

## 🛠️ Tecnologías del Proyecto

### React 18 con Vite

**¿Por qué Vite y no Create React App?**
- Vite es más rápido (usa esbuild para el build)
- Mejor experiencia de desarrollo (HMR más rápido)
- Configuración más simple

**¿Por qué no Next.js?**
- Next.js es para aplicaciones con Server-Side Rendering (SSR)
- Nuestro proyecto es una SPA (Single Page Application) simple
- Vite es más ligero para nuestro caso

### CSS Simple (No Tailwind, No SCSS)

**¿Por qué CSS puro?**
- Más fácil de entender para principiantes
- No requiere aprender sintaxis adicional
- Menos dependencias
- Suficiente para este proyecto

**En producción:**
- Podrías usar Tailwind para desarrollo más rápido
- O SCSS para mejor organización de estilos
- Pero CSS puro funciona perfectamente

---

## 🌐 Cómo Sería con Base de Datos y API Reales

### Dónde Iría el Fetch/Axios

En lugar de usar datos mock, haríamos peticiones HTTP:

**Ejemplo actual (mock):**
```jsx
// appReducer.js - initialState
services: servicesMock  // Datos hardcodeados
```

**Con API real:**
```jsx
// En un componente o hook personalizado
useEffect(() => {
  fetch('/api/servicios')
    .then(res => res.json())
    .then(data => {
      dispatch({ type: 'SET_SERVICES', payload: data })
    })
}, [])
```

### Qué Capa Reemplazaría a los Mocks

1. **Backend (API REST):**
   - Endpoints: `/api/servicios`, `/api/cotizaciones`, etc.
   - Base de datos: PostgreSQL, MongoDB, etc.
   - Autenticación: JWT tokens

2. **Frontend:**
   - Reemplazar `usersMock.js` → petición a `/api/login`
   - Reemplazar `servicesMock.js` → petición a `/api/servicios`
   - Reemplazar datos en reducer → actualizar desde API

**Ejemplo de estructura:**
```
Frontend (React) → API (Express/Node.js) → Base de Datos (PostgreSQL)
```

**Flujo típico:**
1. Usuario hace acción (ej: crear servicio)
2. Frontend envía petición POST a `/api/servicios`
3. Backend valida y guarda en BD
4. Backend retorna el servicio creado
5. Frontend actualiza el estado con el nuevo servicio

---

## 📝 Resumen de Conceptos Clave

1. **Componente**: Pieza reutilizable de UI
2. **Props**: Datos que pasan de padre a hijo
3. **Estado**: Datos que pueden cambiar y afectan el render
4. **useState**: Hook para manejar estado simple
5. **useEffect**: Hook para efectos secundarios (API calls, etc.)
6. **Context**: Solución para evitar prop drilling
7. **Reducer**: Manejo de estado complejo con acciones
8. **React Router**: Navegación entre páginas
9. **Autenticación**: Validación de usuario (simulada con mocks)
10. **API Real**: En producción, los datos vendrían de un backend

---

## 🎯 Preguntas Frecuentes para la Defensa

**¿Por qué Context en vez de solo useState?**
- Cuando el estado se comparte entre muchos componentes
- Evita pasar props por muchos niveles
- Facilita el mantenimiento

**¿Cuándo usar useState vs useReducer?**
- `useState`: Estado simple (un valor, un array simple)
- `useReducer`: Estado complejo (múltiples propiedades, muchas acciones)

**¿Qué pasa si recargo la página?**
- En este proyecto, vuelve a los datos mock iniciales
- En producción, se guardaría en localStorage o se cargaría desde API

**¿Cómo se protegerían las rutas en producción?**
- Verificar token JWT en cada petición
- Backend valida el token antes de retornar datos
- Frontend verifica si hay token válido antes de mostrar rutas protegidas

---

Este documento cubre los conceptos principales. Durante la defensa, puedes referirte a ejemplos específicos del código del proyecto.

