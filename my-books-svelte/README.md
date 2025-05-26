# MyBooks - Gestión de Biblioteca Personal

Una aplicación web para gestionar tu biblioteca personal con sistema de autenticación, búsqueda de libros, metas de lectura y estadísticas.

**Desarrollado por:** Manuel Espinoza y Pedro del Río

## 🚀 Características

- **Autenticación completa** - Registro, login, sesiones seguras
- **Búsqueda de libros** - Integración con Google Books API
- **Gestión de biblioteca** - Estados de lectura, calificaciones, notas
- **Metas de lectura** - Objetivos anuales con seguimiento de progreso
- **Estadísticas** - Analytics de lectura con gráficos y métricas
- **Dashboard personalizado** - Resumen de actividad y progreso

## 🛠️ Stack Tecnológico

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: SvelteKit API Routes
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: Lucia Auth + Argon2
- **APIs**: Google Books API

## 📦 Instalación

### 1. Clonar e instalar
```bash
git clone <repository-url>
cd my-books-svelte
npm install
```

### 2. Variables de entorno
Crear archivo `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mybooks"
LUCIA_SECRET="your-secret-key-here-minimum-32-characters"
GOOGLE_BOOKS_API_KEY="your-google-books-api-key-here"
```

### 3. Base de datos

#### Opción A: Docker (Recomendado)
```bash
# Inicia PostgreSQL + datos demo automáticamente
docker-compose up

# En otra terminal
npm run db:setup
npm run seed
npm run dev
```

## 🧪 Cuenta Demo

- **Usuario**: `demo`
- **Contraseña**: `demo123`

## 🎯 Funcionalidades Principales

### Autenticación
- Registro y login con validación
- Sesiones persistentes y logout seguro
- Protección automática de rutas

### Biblioteca Personal
- Búsqueda de libros con Google Books API
- Estados: Por leer, Leyendo, Leído, Recomendado, Abandonado
- Calificaciones, notas personales y progreso de lectura
- Filtros y búsqueda dentro de la biblioteca

### Metas de Lectura
- Objetivos anuales de libros y páginas
- Seguimiento automático de progreso
- Métricas de rendimiento y consejos

### Estadísticas
- Dashboard con métricas de lectura
- Gráficos de progreso mensual
- Géneros favoritos y patrones de lectura
- Sistema de logros desbloqueables

## 🚀 Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run db:push      # Aplicar cambios de esquema
npm run db:reset     # Reset completo con datos demo
```

## 📱 Rutas Principales

- `/` - Página principal
- `/dashboard` - Dashboard personal (requiere auth)
- `/search` - Búsqueda de libros
- `/books` - Mi biblioteca
- `/goals` - Metas de lectura
- `/stats` - Estadísticas detalladas
