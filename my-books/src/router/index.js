import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import BookSearch from '../views/BookSearch.vue'
import BookDetail from '../views/BookDetail.vue'
import ReadingList from '../views/ReadingList.vue'
import Favorites from '../views/Favorites.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard - Mi Biblioteca'
    }
  },
  {
    path: '/search',
    name: 'search',
    component: BookSearch,
    meta: {
      title: 'Buscar Libros - Mi Biblioteca'
    }
  },
  {
    path: '/book/:id',
    name: 'book-detail',
    component: BookDetail,
    props: true,
    meta: {
      title: 'Detalles del Libro - Mi Biblioteca'
    }
  },
  {
    path: '/reading-list',
    name: 'reading-list',
    component: ReadingList,
    meta: {
      title: 'Lista de Lectura - Mi Biblioteca'
    }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Favorites,
    meta: {
      title: 'Favoritos - Mi Biblioteca'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Cambiar el título de la página según la ruta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Mi Biblioteca'
  next()
})

export default router 