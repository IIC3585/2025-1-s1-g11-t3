<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '../stores/bookStore'
import '../assets/styles/components.css'
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
