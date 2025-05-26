<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { bookService } from '../services/bookService'
import BookDetail from './BookDetail.vue'

const store = useBookStore()
const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)
const error = ref(null)
const showFilters = ref(false)
const selectedBook = ref(null)
const showBookDetail = ref(false)

// Filters
const filters = ref({
  author: '',
  publisher: '',
  subject: '',
  language: '',
  year: ''
})

// Available filter options
const languages = bookService.getLanguages()
const subjects = bookService.getSubjects()

// Computed property for years (last 50 years)
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 50 }, (_, i) => currentYear - i)
})

// Computed property for sorted results
const sortedResults = computed(() => {
  return store.sortedBooks(searchResults.value)
})

const searchBooks = async () => {
  if (!searchQuery.value.trim()) return
  
  isLoading.value = true
  error.value = null
  
  try {
    const results = await bookService.searchBooks(searchQuery.value, filters.value)
    searchResults.value = results
  } catch (err) {
    error.value = 'Error al buscar libros. Por favor, intenta de nuevo.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    author: '',
    publisher: '',
    subject: '',
    language: '',
    year: ''
  }
  if (searchQuery.value) {
    searchBooks()
  }
}

const showBookDetails = (book) => {
  selectedBook.value = book
  showBookDetail.value = true
}

const closeBookDetails = () => {
  showBookDetail.value = false
  selectedBook.value = null
}

onMounted(() => {
  store.loadSavedData()
})
</script>

<template>
  <div class="book-search">
    <div class="search-container">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar libros..."
          @keyup.enter="searchBooks"
          class="search-input"
        />
        <button @click="searchBooks" class="search-button" :disabled="isLoading">
          {{ isLoading ? 'Buscando...' : 'Buscar' }}
        </button>
        <button @click="showFilters = !showFilters" class="filter-button">
          {{ showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
        </button>
      </div>
    </div>

    <div v-if="showFilters" class="filters-container">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Autor:</label>
          <input v-model="filters.author" type="text" placeholder="Nombre del autor" />
        </div>
        <div class="filter-group">
          <label>Editorial:</label>
          <input v-model="filters.publisher" type="text" placeholder="Nombre de la editorial" />
        </div>
        <div class="filter-group">
          <label>Categoría:</label>
          <select v-model="filters.subject">
            <option value="">Todas las categorías</option>
            <option v-for="subject in subjects" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Idioma:</label>
          <select v-model="filters.language">
            <option value="">Todos los idiomas</option>
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Año:</label>
          <select v-model="filters.year">
            <option value="">Todos los años</option>
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      <div class="filter-actions">
        <button @click="clearFilters" class="clear-filters-button">
          Limpiar Filtros
        </button>
        <button @click="searchBooks" class="apply-filters-button">
          Aplicar Filtros
        </button>
      </div>
    </div>

    <div v-if="searchResults.length > 0" class="sort-container">
      <div class="sort-group">
        <label>Ordenar por:</label>
        <select v-model="store.sortBy" class="sort-select">
          <option value="relevance">Relevancia</option>
          <option value="date">Fecha de publicación</option>
          <option value="rating">Calificación</option>
        </select>
      </div>
      <div class="sort-group">
        <label>Orden:</label>
        <select v-model="store.sortOrder" class="sort-select">
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="sortedResults.length > 0" class="results-container">
      <div 
        v-for="book in sortedResults" 
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
            <span v-if="store.isFavorite(book.id)" class="status-favorite" title="En favoritos">★</span>
            <span v-if="store.isInReadingList(book.id)" class="status-reading" title="En lista de lectura">✓</span>
          </div>
        </div>
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="authors">{{ book.authors.join(', ') }}</p>
          
          <div class="book-rating" v-if="book.averageRating">
            <span class="stars">★</span>
            {{ book.averageRating.toFixed(1) }}
            <span class="ratings-count">({{ book.ratingsCount }} reseñas)</span>
          </div>

          <div class="book-details">
            <p v-if="book.publisher"><strong>Editorial:</strong> {{ book.publisher }}</p>
            <p v-if="book.publishedDate"><strong>Publicado:</strong> {{ book.publishedDate }}</p>
          </div>

          <div class="book-categories" v-if="book.categories?.length">
            <span v-for="category in book.categories.slice(0, 2)" :key="category" class="category-tag">
              {{ category }}
            </span>
            <span v-if="book.categories.length > 2" class="category-more">
              +{{ book.categories.length - 2 }}
            </span>
          </div>

          <p class="description">{{ book.description }}</p>
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
.book-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.search-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .search-container {
    padding: 0.5rem;
  }
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-bar input {
    width: 100%;
  }

  .search-bar button {
    width: 100%;
  }
}

.search-input {
  flex: 1;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-button {
  padding: 0.8rem 1.5rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #3aa876;
}

.search-button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin: 1rem 0;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
}

@media (max-width: 480px) {
  .results-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .book-cover {
    height: 140px;
  }

  .book-info {
    padding: 0.5rem;
  }
}

.book-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 160px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  color: #666;
  text-align: center;
  padding: 1rem;
}

.book-info {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
  align-items: center;
}

.book-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
}

.authors {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
}

.description {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
}

.book-details {
  font-size: 0.8rem;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.book-details p {
  margin: 0;
  text-align: center;
  width: 100%;
  padding: 0 0.5rem;
  word-wrap: break-word;
}

.book-details p strong {
  display: inline-block;
  margin-right: 0.25rem;
}

.book-categories {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
  justify-content: center;
  width: 100%;
}

.category-tag {
  background-color: #e9ecef;
  color: #666;
  padding: 0.15rem 0.4rem;
  border-radius: 12px;
  font-size: 0.7rem;
}

.book-rating {
  font-size: 0.8rem;
  margin: 0.25rem 0;
  width: 100%;
  text-align: center;
}

.ratings-count {
  font-size: 0.7rem;
  color: #666;
}

.book-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.status-favorite,
.status-reading {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.3rem 0.5rem;
  border-radius: 50%;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-favorite {
  color: #f1c40f;
}

.status-reading {
  color: #42b883;
}

.book-card {
  cursor: pointer;
  position: relative;
}

.category-more {
  background-color: #e9ecef;
  color: #666;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  font-size: 0.8rem;
}

.filters-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .filters-container {
    padding: 0.8rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.clear-filters-button,
.apply-filters-button {
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.clear-filters-button:hover,
.apply-filters-button:hover {
  background-color: #3aa876;
}

.sort-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .sort-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .sort-container select {
    width: 100%;
  }
}

.sort-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-group label {
  color: #2c3e50;
  font-weight: bold;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
}
</style> 