<script setup>
import { computed, ref } from 'vue'
import { useBookStore } from '../stores/bookStore'
import BookDetail from './BookDetail.vue'

const store = useBookStore()
const selectedBook = ref(null)
const showBookDetail = ref(false)

const favorites = computed(() => store.favorites)

const showBookDetails = (book) => {
  selectedBook.value = book
  showBookDetail.value = true
}

const closeBookDetails = () => {
  showBookDetail.value = false
  selectedBook.value = null
}
</script>

<template>
  <div class="container">
    <h1>Libros Favoritos</h1>
    
    <div class="favorites-stats">
      <div class="stat-card">
        <h3>Total de Favoritos</h3>
        <div class="stat-number">{{ favorites.length }}</div>
      </div>
      <div class="stat-card">
        <h3>En Lista de Lectura</h3>
        <div class="stat-number">
          {{ favorites.filter(book => store.isInReadingList(book.id)).length }}
        </div>
      </div>
    </div>

    <div class="books-grid">
      <div 
        v-for="book in favorites" 
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
            <span class="status-favorite" title="En favoritos">★</span>
            <span 
              v-if="store.isInReadingList(book.id)" 
              class="status-reading" 
              title="En lista de lectura"
            >
              ✓
            </span>
          </div>
        </div>
        <div class="book-info">
          <h4>{{ book.title }}</h4>
          <p class="authors">{{ book.authors.join(', ') }}</p>
          <p class="added-date">Agregado: {{ new Date(book.addedDate).toLocaleDateString() }}</p>
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
.favorites-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.stat-number {
  font-size: var(--font-size-xxl);
  font-weight: bold;
  color: var(--primary-color);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.book-status {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
}

.status-favorite,
.status-reading {
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 50%;
  font-size: var(--font-size-lg);
  box-shadow: var(--shadow-sm);
}

.status-favorite {
  color: var(--favorite-color);
}

.status-reading {
  color: var(--primary-color);
}

@media (max-width: var(--breakpoint-sm)) {
  .favorites-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-card h3 {
    font-size: var(--font-size-md);
  }

  .stat-number {
    font-size: var(--font-size-xl);
  }

  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
}
</style> 