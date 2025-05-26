# MyBooks - Gestión de Biblioteca Personal con Autenticación

Una aplicación completa para gestionar tu biblioteca personal con sistema de autenticación seguro, construida con SvelteKit, TypeScript, PostgreSQL y Lucia Auth.

## 🚀 Características Implementadas

### ✅ Sistema de Autenticación Completo
- **Registro de usuarios** con validación de formularios
- **Inicio de sesión** seguro con hash de contraseñas
- **Sesiones persistentes** usando Lucia Auth
- **Logout funcional** con invalidación de sesiones
- **Protección de rutas** automática
- **Redirecciones inteligentes** según estado de autenticación

### 📚 Gestión de Libros (Base de Datos Lista)
- **Esquema completo** de base de datos para libros
- **Estados de lectura**: Leído, Leyendo, Por leer, Recomendado, Abandonado
- **Información detallada**: Título, autor, ISBN, género, descripción, portada
- **Datos personales**: Calificaciones (1-5), notas, citas favoritas, progreso
- **Estadísticas reales** en el dashboard
- **Libros recientes** y seguimiento de progreso

### 🎨 Interfaz de Usuario
- **Componentes reutilizables** (Button, Input)
- **Dashboard dinámico** con estadísticas reales
- **Formularios con validación** y mensajes de error claros
- **Navegación dinámica** que cambia según el estado del usuario
- **Diseño responsive** con Tailwind CSS
- **Estados de carga** y feedback visual

### 🔒 Seguridad
- **Hash de contraseñas** con Argon2
- **Validación de sesiones** en el servidor
- **Cookies seguras** con configuración apropiada
- **Validación de formularios** tanto en cliente como servidor

## 🛠️ Stack Tecnológico

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: SvelteKit API Routes
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Lucia Auth
- **Hash de Contraseñas**: @node-rs/argon2

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd my-books-svelte
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mybooks"
LUCIA_SECRET="your-secret-key-here-minimum-32-characters"
GOOGLE_BOOKS_API_KEY="your-google-books-api-key-here"
```

**Nota sobre Google Books API:**
- La API key es opcional pero recomendada para evitar límites de rate
- Obtén tu API key en [Google Cloud Console](https://console.cloud.google.com/)
- Habilita la "Books API" en tu proyecto
- Sin API key, la búsqueda funcionará pero con límites más estrictos

### 4. Configurar base de datos

#### Opción A: Docker Compose con inicialización automática (RECOMENDADO)
```bash
# Inicia PostgreSQL y automáticamente crea el usuario demo con libros de ejemplo
docker-compose up

# En otra terminal, una vez que veas "¡MyBooks está listo!"
npm run dev
```

#### Opción B: Docker Compose solo PostgreSQL + setup manual
```bash
# Solo PostgreSQL (sin inicialización automática)
docker-compose -f docker-compose.simple.yml up -d

# Luego ejecutar setup manual
npm run db:setup
npm run seed
```

#### Opción C: Setup completo manual (sin Docker)
```bash
# Configuración inicial completa (crea tablas + usuario demo)
npm run db:setup

# Agregar libros de ejemplo (opcional pero recomendado)
npm run seed
```

#### Opción D: Reset completo (para desarrollo)
```bash
# Reset completo: elimina todo y recrea con datos de ejemplo
npm run db:reset
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🗄️ Esquema de Base de Datos

### Autenticación
- **`user`**: Información de usuarios (id, username, passwordHash, age)
- **`session`**: Sesiones de Lucia Auth

### Gestión de Libros
- **`books`**: Información de libros (título, autor, ISBN, género, etc.)
- **`user_books`**: Relación usuario-libro con datos personales
- **`reading_goals`**: Metas de lectura anuales

## 🧪 Pruebas del Sistema

### Cuenta Demo
Para probar el sistema sin registrarse:
- **Usuario**: `demo`
- **Contraseña**: `demo123`

### Flujos de Prueba

#### 1. Registro de Usuario
1. Ir a `/register`
2. Llenar el formulario con datos válidos
3. Verificar redirección automática al dashboard
4. Confirmar que la navegación muestra el estado autenticado

#### 2. Inicio de Sesión
1. Ir a `/login`
2. Usar credenciales válidas (o cuenta demo)
3. Verificar redirección al dashboard
4. Confirmar persistencia de sesión al recargar

#### 3. Dashboard con Estadísticas
1. Acceder al dashboard autenticado
2. Ver estadísticas reales de libros (inicialmente en 0)
3. Verificar que muestra mensaje de "comenzar biblioteca"
4. Probar enlaces a diferentes secciones

#### 4. Protección de Rutas
1. Intentar acceder a `/dashboard` sin autenticación
2. Verificar redirección automática a `/login`
3. Autenticarse y verificar acceso al dashboard

#### 5. Logout
1. Estando autenticado, hacer clic en "Cerrar Sesión"
2. Verificar redirección a la página principal
3. Confirmar que intentar acceder a rutas protegidas redirige al login

#### 6. Búsqueda de Libros
1. Ir a `/search` o hacer clic en "Buscar Libros" desde el dashboard
2. Probar búsquedas con términos como "García Márquez" o "Cien años"
3. Verificar que aparecen resultados de Google Books API
4. Probar las búsquedas populares predefinidas
5. Usar el autocompletado escribiendo parcialmente un autor
6. Hacer clic en "Cargar más resultados" para paginación
7. Probar el botón "Agregar a mi biblioteca" (simulado por ahora)

#### 7. Detalles de Libros
1. Desde la búsqueda, hacer clic en "Ver detalles" de cualquier libro
2. Verificar que se carga la página `/books/[id]` con información completa
3. Revisar que se muestra: portada, título, autores, descripción, metadatos
4. Probar el botón "Agregar a mi biblioteca" (funcional)
5. Si está disponible, probar "Vista previa" y "Ver en Google Books"
6. Usar el botón "Volver" para regresar a la búsqueda
7. Verificar que la navegación breadcrumb funciona correctamente

#### 8. Agregar Libros a Biblioteca
1. Estando autenticado, buscar un libro en `/search`
2. Hacer clic en "Agregar a mi biblioteca" desde la búsqueda o detalles
3. Verificar que aparece mensaje de confirmación
4. Intentar agregar el mismo libro nuevamente (debe mostrar "ya está en biblioteca")
5. Verificar que el libro se guarda en la base de datos
6. Probar sin autenticación (debe redirigir al login)
7. Verificar manejo de errores de conexión

#### 9. Mi Biblioteca
1. Ir a `/books` o hacer clic en "Mi Biblioteca" desde la navegación
2. Verificar que se muestran todos los libros guardados
3. Probar los filtros por estado (Por leer, Leyendo, Leídos, etc.)
4. Usar la búsqueda dentro de la biblioteca personal
5. Cambiar el estado de un libro usando el dropdown
6. Verificar que las estadísticas se actualizan correctamente
7. Hacer clic en "Ver detalles" para ir a la página del libro
8. Verificar que los libros "Leyendo" muestran barra de progreso
9. Probar la paginación con "Cargar más libros"
10. Verificar el estado vacío cuando no hay libros

#### 10. Estadísticas Avanzadas (NUEVO)
1. Ir a `/stats` o hacer clic en "Estadísticas" desde la navegación
2. Verificar las métricas generales (total libros, páginas leídas, etc.)
3. Revisar la distribución por estados con barras de progreso
4. Ver la distribución de calificaciones (si hay libros calificados)
5. Explorar los géneros favoritos y autores más leídos
6. Revisar la actividad mensual de los últimos 12 meses
7. Ver las rachas de lectura (actual y más larga)
8. Verificar los logros desbloqueados según la actividad
9. Revisar los libros que se están leyendo actualmente
10. Ver el historial de libros recientes terminados
11. Verificar el estado vacío cuando no hay datos

## 📁 Estructura del Proyecto

```
src/
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts           # Conexión a BD
│   │   │   └── schema.ts          # Esquemas completos (auth + books)
│   │   └── auth.ts                # Configuración Lucia
│   ├── types.ts                   # Tipos completos (auth + books)
│   ├── utils/
│   │   └── debounce.ts            # Utilidad para debounce en búsquedas
│   └── components/
│       ├── SearchBox.svelte       # Componente de búsqueda con autocompletado
│       ├── BookCard.svelte        # Tarjeta para mostrar libros
│       ├── Toast.svelte           # Componente de notificaciones
│       └── ui/
│           ├── Button.svelte      # Componente botón reutilizable
│           └── Input.svelte       # Componente input con validación
├── routes/
│   ├── api/
│   │   ├── search/
│   │   │   └── +server.ts         # API endpoint para Google Books
│   │   └── books/
│   │       ├── +server.ts         # API endpoint para gestión de biblioteca
│   │       └── [id]/
│   │           └── +server.ts     # API endpoint para actualizar/eliminar libros
│   ├── login/
│   │   ├── +page.svelte           # Página de login
│   │   └── +page.server.ts        # Lógica de autenticación
│   ├── register/
│   │   ├── +page.svelte           # Página de registro
│   │   └── +page.server.ts        # Lógica de registro
│   ├── logout/
│   │   └── +server.ts             # Endpoint de logout
│   ├── search/
│   │   └── +page.svelte           # Página de búsqueda de libros
│   ├── books/
│   │   ├── +page.svelte           # Página Mi Biblioteca
│   │   ├── +page.server.ts        # Carga de libros del usuario
│   │   └── [id]/
│   │       ├── +page.svelte       # Página de detalles del libro
│   │       └── +page.server.ts    # Carga de datos del libro
│   ├── stats/
│   │   ├── +page.svelte           # Página de estadísticas avanzadas
│   │   └── +page.server.ts        # Cálculo de métricas y análisis
│   ├── dashboard/
│   │   ├── +page.svelte           # Dashboard con estadísticas reales
│   │   └── +page.server.ts        # Carga de datos de libros
│   ├── +layout.svelte             # Layout con navegación dinámica
│   ├── +layout.server.ts          # Carga global de usuario
│   └── +page.svelte               # Homepage con landing page
├── hooks.server.ts                # Middleware de sesiones
└── app.d.ts                       # Tipos globales de Lucia
```

## 🎯 Estado Actual de Funcionalidades

### ✅ Completamente Implementado
- [x] **Autenticación completa** (registro, login, logout, protección)
- [x] **Base de datos** con esquemas completos
- [x] **Dashboard** con estadísticas reales
- [x] **UI/UX** moderna y responsive
- [x] **Seguridad** robusta
- [x] **Tipos TypeScript** completos

### ✅ Búsqueda de Libros
- **Página de búsqueda** (`/search`) completamente funcional
- **Integración con Google Books API** para búsqueda en tiempo real
- **Componente SearchBox** con autocompletado y sugerencias
- **Componente BookCard** para mostrar resultados
- **Paginación** y carga de más resultados
- **Búsquedas populares** predefinidas
- **Estados de carga** y manejo de errores

### ✅ Detalles de Libros
- **Página de detalles** (`/books/[id]`) con información completa
- **Información detallada** (título, subtítulo, autores, descripción, etc.)
- **Calificaciones y reseñas** de Google Books
- **Metadatos completos** (ISBN, editorial, idioma, páginas, etc.)
- **Enlaces externos** (vista previa, Google Books)
- **Botón para agregar** a biblioteca personal
- **Navegación inteligente** (botón volver)

### ✅ Gestión de Biblioteca Personal
- **API endpoints** (`/api/books` y `/api/books/[id]`) para CRUD completo
- **Página Mi Biblioteca** (`/books`) para ver libros guardados
- **Funcionalidad real** de "Agregar a Mi Biblioteca"
- **Validación de duplicados** (evita libros repetidos)
- **Creación automática** de registros de libros y usuario-libro
- **Estados de lectura** configurables (por leer, leyendo, leído, etc.)
- **Actualización de estados** en tiempo real
- **Filtros y búsqueda** dentro de la biblioteca personal
- **Estadísticas detalladas** por estado de lectura
- **Progreso de lectura** visual para libros en curso
- **Fechas automáticas** (inicio y fin de lectura)
- **Manejo de errores** robusto con mensajes específicos
- **Feedback visual** con estados de carga

### ✅ Estadísticas Avanzadas (NUEVO)
- **Página de estadísticas** (`/stats`) con análisis completo
- **Métricas de lectura** (libros leídos, páginas, promedios)
- **Distribución por estados** con gráficos de barras
- **Calificaciones** y distribución de ratings
- **Géneros favoritos** y autores más leídos
- **Actividad mensual** de los últimos 12 meses
- **Rachas de lectura** (actual y más larga)
- **Sistema de logros** desbloqueables
- **Libros actuales** con progreso de lectura
- **Historial reciente** de libros terminados
- **Visualizaciones interactivas** con CSS puro

### 🚧 Próximas Implementaciones
- [ ] **Edición avanzada** de libros (notas, citas, progreso detallado)
- [ ] **Eliminación** de libros de la biblioteca
- [ ] **Calificaciones y reseñas** personales expandidas
- [ ] **Formularios de libros** (`/books/add`) para agregar manualmente
- [ ] **Metas de lectura** anuales y seguimiento
- [ ] **Recomendaciones** basadas en historial de lectura
- [ ] **Exportación** de datos y reportes
- [ ] **Gráficos interactivos** con bibliotecas de charts

## 🚀 Próximos Pasos Recomendados

### 1. Implementar CRUD de Libros
```bash
# Crear páginas faltantes
src/routes/books/+page.svelte          # Lista de libros
src/routes/books/add/+page.svelte      # Agregar libro
src/routes/search/+page.svelte         # Búsqueda de libros
src/routes/stats/+page.svelte          # Estadísticas detalladas
```

### 2. Agregar API Endpoints
```bash
src/routes/api/books/+server.ts        # CRUD de libros
src/routes/api/search/+server.ts       # Google Books API
src/routes/api/stats/+server.ts        # Estadísticas
```

### 3. Crear Componentes de Libros
```bash
src/lib/components/BookCard.svelte     # Tarjeta de libro
src/lib/components/SearchBox.svelte    # Búsqueda con autocompletado
src/lib/components/RatingStars.svelte  # Sistema de calificación
```

## 🐛 Resolución de Problemas

### Error de Dependencias
Si encuentras errores relacionados con `@rollup/rollup-win32-x64-msvc`:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de Base de Datos
Verificar que PostgreSQL esté ejecutándose y la URL de conexión sea correcta:
```bash
# Verificar conexión
psql $DATABASE_URL
```

### Error de Variables de Entorno
Asegurar que el archivo `.env` esté en la raíz del proyecto con todas las variables necesarias.

## 📝 Notas de Desarrollo

- El sistema usa **Lucia Auth** para manejo de sesiones
- Las contraseñas se hashean con **Argon2** para máxima seguridad
- La validación se hace tanto en cliente como servidor
- Las rutas protegidas redirigen automáticamente si no hay autenticación
- El layout se actualiza dinámicamente según el estado de autenticación
- **El esquema de base de datos está completo** para toda la funcionalidad de libros
- **Las estadísticas del dashboard son reales** y se cargan desde la base de datos

## 🎉 Estado Actual

**✅ SISTEMA BASE COMPLETAMENTE FUNCIONAL**

### Lo que funciona ahora:
- ✅ **Autenticación completa** (registro, login, logout)
- ✅ **Dashboard con estadísticas reales** de libros
- ✅ **Búsqueda de libros** con Google Books API
- ✅ **Detalles de libros** con información completa
- ✅ **Mi Biblioteca** para gestionar libros guardados
- ✅ **Agregar libros** a biblioteca personal
- ✅ **Cambiar estados** de lectura en tiempo real
- ✅ **Filtros y búsqueda** dentro de la biblioteca
- ✅ **Estadísticas avanzadas** con gráficos y análisis
- ✅ **Sistema de logros** y métricas de lectura
- ✅ **Actividad mensual** y rachas de lectura
- ✅ **Base de datos completa** con todas las funcionalidades
- ✅ **Protección de rutas** automática
- ✅ **UI moderna** y responsive
- ✅ **Usuario demo** para pruebas

### Lo que está listo para implementar:
- 🚧 **Edición avanzada** de libros (notas detalladas, citas)
- 🚧 **Estadísticas avanzadas** con gráficos y análisis
- 🚧 **Metas de lectura** anuales con seguimiento
- 🚧 **Recomendaciones** basadas en historial
- 🚧 **Exportación** de datos de biblioteca

¡El sistema ahora tiene funcionalidad completa de gestión de biblioteca personal! 📚✨
