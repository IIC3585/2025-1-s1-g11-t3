# Mi Biblioteca - Aplicación de Gestión de Libros

Mi Biblioteca es una aplicación web desarrollada con Vue 3 y Vite que permite a los usuarios gestionar su colección de libros personales, buscar nuevos títulos y mantener un registro de sus lecturas. La aplicación se integra con las APIs de Google Books y New York Times para ofrecer una experiencia completa de descubrimiento y gestión de libros.

## 🚀 Características Principales

- **Búsqueda de Libros**: Integración con 2 APIs:
  - Google Books API para búsqueda y detalles de libros
  - New York Times API para listas de bestsellers y tendencias
- **Gestión de Lista de Lectura**: Organiza tus libros en tres categorías:
  - 📚 Pendientes
  - 📖 En Progreso
  - ✅ Leídos
- **Sistema de Favoritos**: Guarda tus libros favoritos para acceso rápido
- **Calificaciones**: Califica los libros que has leído y visualiza calificaciones promedio
- **Filtros Avanzados**: Búsqueda por autor, editorial, categoría, idioma y año
- **Ordenamiento**: Ordena tus libros por relevancia, fecha de publicación o calificación
- **Interfaz Responsiva**: Diseño adaptable a diferentes dispositivos
- **Persistencia de Datos**: Tus datos se guardan localmente en el navegador

## 🛠️ Tecnologías Utilizadas

- Vue 3 con Composition API
- Vite como bundler
- Pinia para gestión de estado
- Vue Router para navegación
- CSS moderno con variables personalizadas
- Diseño responsivo y adaptable
- Integración con APIs externas:
  - Google Books API
  - New York Times Books API

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn
- Claves de API (opcional para desarrollo local):
  - Google Books API Key
  - New York Times API Key

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd my-books
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

4. Abre tu navegador en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
my-books/
├── src/
│   ├── assets/         # Estilos y recursos estáticos
│   ├── components/     # Componentes reutilizables
│   ├── stores/         # Estado global con Pinia
│   ├── services/       # Servicios y APIs
│   ├── views/          # Vistas principales
│   ├── router/         # Configuración de rutas
│   └── App.vue         # Componente raíz
├── public/             # Archivos públicos
└── package.json        # Dependencias y scripts
```

## 🎯 Funcionalidades Detalladas

### Dashboard
- Vista general de tu biblioteca
- Estadísticas de lectura
- Libros populares y tendencias (provenientes de NYT Bestsellers)
- Acceso rápido a tus listas
- Integración con listas de bestsellers de New York Times

### Búsqueda de Libros
- Búsqueda en tiempo real usando Google Books API
- Resultados detallados incluyendo:
  - Portadas de libros
  - Información de autores
  - Descripciones
  - Calificaciones y reseñas
- Filtros avanzados:
  - Autor
  - Editorial
  - Categoría
  - Idioma
  - Año de publicación
- Ordenamiento por relevancia, fecha o calificación
- Acceso a información adicional de New York Times cuando está disponible

### Lista de Lectura
- Gestión de libros en tres estados:
  - Pendientes
  - En Progreso
  - Leídos
- Actualización de estado mediante interfaz intuitiva
- Registro de fecha de agregado

### Favoritos
- Lista personalizada de libros favoritos
- Acceso rápido desde cualquier vista
- Indicador visual en las tarjetas de libros


