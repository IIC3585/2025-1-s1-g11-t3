<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '../stores/bookStore'

const route = useRoute()
const store = useBookStore()

const stats = computed(() => ({
  read: store.getReadingListByStatus('read').length,
  inProgress: store.getReadingListByStatus('inProgress').length,
  pending: store.getReadingListByStatus('pending').length,
  favorites: store.favorites.length
}))

const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <nav class="app-nav">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        Mi Biblioteca
      </router-link>

      <div class="nav-links">
        <router-link 
          to="/" 
          class="nav-link"
          :class="{ active: isActive('/') }"
        >
          Dashboard
        </router-link>
        <router-link 
          to="/search" 
          class="nav-link"
          :class="{ active: isActive('/search') }"
        >
          Buscar Libros
        </router-link>
        <router-link 
          to="/reading-list" 
          class="nav-link"
          :class="{ active: isActive('/reading-list') }"
        >
          Lista de Lectura
          <span class="nav-badge">{{ stats.pending + stats.inProgress }}</span>
        </router-link>
        <router-link 
          to="/favorites" 
          class="nav-link"
          :class="{ active: isActive('/favorites') }"
        >
          Favoritos
          <span class="nav-badge">{{ stats.favorites }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  background: var(--white);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: var(--breakpoint-xl);
  margin: 0 auto;
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-link:hover {
  background: var(--background-light);
}

.nav-link.active {
  background: var(--primary-color);
  color: var(--white);
}

.nav-badge {
  background: var(--secondary-color);
  color: var(--white);
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: var(--font-size-xs);
}

@media (max-width: var(--breakpoint-md)) {
  .nav-container {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .nav-link {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}
</style> 