<script setup>
import { computed, ref } from 'vue'
import { useBookStore } from '../stores/bookStore'
import BookDetail from './BookDetail.vue'
import '../assets/styles/components.css'

const store = useBookStore()
const selectedBook = ref(null)
const showBookDetail = ref(false)

const readingList = computed(() => store.readingList)

const showBookDetails = (book) => {
  selectedBook.value = book
  showBookDetail.value = true
}

const closeBookDetails = () => {
  showBookDetail.value = false
  selectedBook.value = null
}

const updateBookStatus = (bookId, newStatus) => {
  store.updateBookStatus(bookId, newStatus)
}
</script>

<template>
  <div class="container">
    <h1>Lista de Lectura</h1>
    
    <div class="reading-stats">
      <div class="stat-card">
        <h3>Pendientes</h3>
        <div class="stat-number">{{ store.getReadingListByStatus('pending').length }}</div>
      </div>
      <div class="stat-card">
        <h3>En Progreso</h3>
        <div class="stat-number">{{ store.getReadingListByStatus('inProgress').length }}</div>
      </div>
      <div class="stat-card">
        <h3>Leídos</h3>
        <div class="stat-number">{{ store.getReadingListByStatus('read').length }}</div>
      </div>
    </div>

    <div class="reading-list-columns">
      <!-- Columna de Libros Pendientes -->
      <div class="reading-column">
        <h2>Pendientes</h2>
        <div class="books-grid">
          <div 
            v-for="book in store.getReadingListByStatus('pending')" 
            :key="book.id" 
            class="book-card"
            @click="showBookDetails(book)"
          >
            <div class="book-cover">
              <img 
                v-if="book.coverUrl" 
                :src="book.coverUrl" 
                :alt="book.title"
                class="cover-image"
              />
              <div v-else class="no-cover">Sin portada</div>
              <div class="book-status">
                <select 
                  v-model="book.status" 
                  @change="updateBookStatus(book.id, book.status)"
                  @click.stop
                  class="status-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="inProgress">En Progreso</option>
                  <option value="read">Leído</option>
                </select>
              </div>
            </div>
            <div class="book-info">
              <h4>{{ book.title }}</h4>
              <p class="authors">{{ book.authors.join(', ') }}</p>
              <p class="added-date">Agregado: {{ new Date(book.addedDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna de Libros En Progreso -->
      <div class="reading-column">
        <h2>En Progreso</h2>
        <div class="books-grid">
          <div 
            v-for="book in store.getReadingListByStatus('inProgress')" 
            :key="book.id" 
            class="book-card"
            @click="showBookDetails(book)"
          >
            <div class="book-cover">
              <img 
                v-if="book.coverUrl" 
                :src="book.coverUrl" 
                :alt="book.title"
                class="cover-image"
              />
              <div v-else class="no-cover">Sin portada</div>
              <div class="book-status">
                <select 
                  v-model="book.status" 
                  @change="updateBookStatus(book.id, book.status)"
                  @click.stop
                  class="status-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="inProgress">En Progreso</option>
                  <option value="read">Leído</option>
                </select>
              </div>
            </div>
            <div class="book-info">
              <h4>{{ book.title }}</h4>
              <p class="authors">{{ book.authors.join(', ') }}</p>
              <p class="added-date">Agregado: {{ new Date(book.addedDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna de Libros Leídos -->
      <div class="reading-column">
        <h2>Leídos</h2>
        <div class="books-grid">
          <div 
            v-for="book in store.getReadingListByStatus('read')" 
            :key="book.id" 
            class="book-card"
            @click="showBookDetails(book)"
          >
            <div class="book-cover">
              <img 
                v-if="book.coverUrl" 
                :src="book.coverUrl" 
                :alt="book.title"
                class="cover-image"
              />
              <div v-else class="no-cover">Sin portada</div>
              <div class="book-status">
                <select 
                  v-model="book.status" 
                  @change="updateBookStatus(book.id, book.status)"
                  @click.stop
                  class="status-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="inProgress">En Progreso</option>
                  <option value="read">Leído</option>
                </select>
              </div>
            </div>
            <div class="book-info">
              <h4>{{ book.title }}</h4>
              <p class="authors">{{ book.authors.join(', ') }}</p>
              <p class="added-date">Agregado: {{ new Date(book.addedDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BookDetail
      v-if="selectedBook"
      :book="selectedBook"
      :show="showBookDetail"
      @close="closeBookDetails"
    />
  </div>
</template>

<style scoped>
/* Estilos específicos de la vista ReadingList */
.container {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: var(--text-dark);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}
</style> 