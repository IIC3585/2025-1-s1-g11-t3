# Scripts de Base de Datos - MyBooks

Este directorio contiene scripts para configurar y gestionar la base de datos de MyBooks.

## 📋 Scripts Disponibles

### 🚀 Setup Inicial

#### `npm run db:setup`
**Configuración inicial completa de la base de datos**
- Ejecuta `drizzle-kit push` para crear las tablas
- Crea el usuario demo automáticamente
- Ideal para configuración inicial del proyecto

```bash
npm run db:setup
```

### 🌱 Seeding

#### `npm run seed`
**Poblar la base de datos con datos de ejemplo**
- Crea el usuario demo si no existe
- Agrega 5 libros clásicos de literatura hispana
- Asigna estados aleatorios a los libros (leído, leyendo, etc.)
- Incluye calificaciones y notas de ejemplo

```bash
npm run seed
```

#### `npm run create-demo-user`
**Crear solo el usuario demo**
- Crea únicamente el usuario demo sin libros
- Útil si solo necesitas el usuario de prueba

```bash
npm run create-demo-user
```

### 🔄 Reset y Mantenimiento

#### `npm run db:reset`
**Reset completo de la base de datos**
- ⚠️ **CUIDADO**: Elimina TODOS los datos
- Recrea el schema desde cero
- Ejecuta el seeding automáticamente
- Ideal para desarrollo cuando necesitas empezar limpio

```bash
npm run db:reset
```

## 👤 Usuario Demo

Todos los scripts crean un usuario demo con las siguientes credenciales:

- **Username**: `demo`
- **Password**: `demo123`
- **Edad**: 25 años

## 📚 Libros de Ejemplo

El script de seeding incluye estos libros clásicos:

1. **Cien años de soledad** - Gabriel García Márquez
2. **Don Quijote de la Mancha** - Miguel de Cervantes
3. **La casa de los espíritus** - Isabel Allende
4. **Rayuela** - Julio Cortázar
5. **El amor en los tiempos del cólera** - Gabriel García Márquez

Cada libro se asigna aleatoriamente con diferentes estados:
- ✅ **Leído** (con calificación y notas)
- 📖 **Leyendo** (con progreso de páginas)
- 📋 **Por leer**
- 💡 **Recomendado**

## 🔧 Flujo de Trabajo Recomendado

### Primera vez configurando el proyecto (RECOMENDADO):
```bash
# 1. Inicialización automática con Docker
docker-compose up

# 2. En otra terminal, una vez listo
npm run dev
```

### Configuración manual (sin Docker):
```bash
# 1. Asegúrate de que PostgreSQL esté ejecutándose
npm run db:start

# 2. Configura la base de datos completa
npm run db:setup

# 3. (Opcional) Agrega libros de ejemplo
npm run seed
```

### Durante el desarrollo:
```bash
# Si necesitas empezar limpio
npm run db:reset

# Si solo necesitas agregar datos de ejemplo
npm run seed
```

### Solo crear usuario demo:
```bash
npm run create-demo-user
```

### Con Docker (inicialización automática):
```bash
# Inicia todo automáticamente
docker-compose up

# Solo PostgreSQL (sin inicialización)
docker-compose -f docker-compose.simple.yml up -d
```

## 🛠️ Archivos de Scripts

- `setup-db.ts` - Configuración inicial (schema + usuario demo)
- `seed.ts` - Seeding completo (usuario + libros de ejemplo)
- `reset-db.ts` - Reset completo de la base de datos
- `create-demo-user.ts` - Solo crear usuario demo
- `docker-init.ts` - Inicialización automática para Docker
- `db-connection.ts` - Conexión a BD standalone para scripts
- `init-db.sql` - Script SQL de inicialización para PostgreSQL

## ⚠️ Notas Importantes

1. **Variables de entorno**: Asegúrate de tener `DATABASE_URL` configurada
2. **PostgreSQL**: La base de datos debe estar ejecutándose antes de usar los scripts
3. **Datos existentes**: Los scripts verifican duplicados antes de crear datos
4. **Reset**: El comando `db:reset` elimina TODOS los datos - úsalo con cuidado

## 🎯 Casos de Uso

### Nuevo desarrollador en el equipo:
```bash
npm install
npm run db:setup
npm run seed
npm run dev
```

### Probar funcionalidades con datos limpios:
```bash
npm run db:reset
npm run dev
```

### Solo necesito el usuario demo:
```bash
npm run create-demo-user
```

### Agregar más datos de ejemplo:
```bash
npm run seed
``` 