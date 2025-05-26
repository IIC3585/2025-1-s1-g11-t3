<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { bookService } from '../services/bookService'
import BookDetail from './BookDetail.vue'
import '../assets/styles/main.css'

const store = useBookStore()
const selectedBook = ref(null)
const showBookDetail = ref(false)
const popularBooks = ref([])
const bestsellers = ref([])
const trendingBooks = ref([])
const isLoading = ref({
  popular: false,
  bestsellers: false,
  trending: false
})
const error = ref(null)

const stats = computed(() => ({
  read: store.getReadingListByStatus('read').length,
  inProgress: store.getReadingListByStatus('inProgress').length,
  pending: store.getReadingListByStatus('pending').length,
  favorites: store.favorites.length
}))

const showBookDetails = (book) => {
  console.log('Opening book details for:', {
    bookId: book.id,
    bookTitle: book.title
  })
  selectedBook.value = book
  showBookDetail.value = true
  console.log('Modal state after opening:', {
    selectedBook: selectedBook.value?.id,
    showBookDetail: showBookDetail.value
  })
}

const closeBookDetails = () => {
  console.log('Closing book details')
  showBookDetail.value = false
  selectedBook.value = null
}

const updateBookStatus = (bookId, newStatus) => {
  store.updateBookStatus(bookId, newStatus)
}

const loadRecommendations = async () => {
  isLoading.value.popular = true
  isLoading.value.bestsellers = true
  isLoading.value.trending = true
  error.value = null

  try {
    const [popular, best, trending] = await Promise.all([
      bookService.getPopularBooks(),
      bookService.getBestsellers(),
      bookService.getTrendingBooks()
    ])

    // Verificar si tenemos libros de NY Times
    const hasNYTBooks = [...popular, ...best, ...trending].some(book => book.source === 'NYT')
    if (!hasNYTBooks) {
      console.warn('No se encontraron libros de NY Times. Verifica la API key.')
    }

    popularBooks.value = popular
    bestsellers.value = best
    trendingBooks.value = trending
  } catch (error) {
    console.error('Error loading recommendations:', error)
    error.value = 'Error al cargar las recomendaciones. Verifica la conexión y la API key de NY Times.'
  } finally {
    isLoading.value.popular = false
    isLoading.value.bestsellers = false
    isLoading.value.trending = false
  }
}

// Función para obtener la calificación del usuario para un libro
const getUserRating = (bookId) => {
  return store.getUserRating(bookId)
}

onMounted(() => {
  store.loadSavedData()
  loadRecommendations()
})
</script>

<template>
  <div class="dashboard">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <h2>Resumen de Lectura</h2>
    
    <div class="stats-container">
      <div class="stat-card">
        <h3>Libros Leídos</h3>
        <div class="stat-number">{{ stats.read }}</div>
      </div>
      <div class="stat-card">
        <h3>En Progreso</h3>
        <div class="stat-number">{{ stats.inProgress }}</div>
      </div>
      <div class="stat-card">
        <h3>Pendientes</h3>
        <div class="stat-number">{{ stats.pending }}</div>
      </div>
      <div class="stat-card">
        <h3>Favoritos</h3>
        <div class="stat-number">{{ stats.favorites }}</div>
      </div>
    </div>

    <!-- Sección de Recomendaciones -->
    <div class="recommendations-section">
      <h3>Libros Populares</h3>
      <div class="books-grid">
        <div v-if="isLoading.popular" class="loading-placeholder">
          Cargando libros populares...
        </div>
        <div 
          v-else
          v-for="book in popularBooks" 
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
            <h4>{{ book.title }}</h4>
            <p class="authors">{{ book.authors.join(', ') }}</p>
            <div class="book-rating" v-if="book.averageRating || getUserRating(book.id)">
              <div class="rating-group">
                <span v-if="book.averageRating" class="rating-item">
                  <span class="stars">★</span>
                  {{ book.averageRating.toFixed(1) }}
                  <span class="ratings-count">({{ book.ratingsCount }} reseñas)</span>
                </span>
                <span v-if="getUserRating(book.id)" class="rating-item user-rating">
                  <span class="stars">★</span>
                  Tu calificación: {{ getUserRating(book.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Bestsellers</h3>
      <div class="books-grid">
        <div v-if="isLoading.bestsellers" class="loading-placeholder">
          Cargando bestsellers...
        </div>
        <div 
          v-else
          v-for="book in bestsellers" 
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
              <span v-if="book.source === 'NYT'" class="status-source" title="Fuente: NY Times">NYT</span>
            </div>
          </div>
          <div class="book-info">
            <h4>{{ book.title }}</h4>
            <p class="authors">{{ book.authors.join(', ') }}</p>
            <div class="book-rating" v-if="book.averageRating || getUserRating(book.id)">
              <div class="rating-group">
                <span v-if="book.averageRating" class="rating-item">
                  <span class="stars">★</span>
                  {{ book.averageRating.toFixed(1) }}
                  <span class="ratings-count">({{ book.ratingsCount }} reseñas)</span>
                </span>
                <span v-if="getUserRating(book.id)" class="rating-item user-rating">
                  <span class="stars">★</span>
                  Tu calificación: {{ getUserRating(book.id) }}
                </span>
              </div>
            </div>
            <div v-if="book.weeksOnList" class="weeks-on-list">
              {{ book.weeksOnList }} semanas en lista
            </div>
          </div>
        </div>
      </div>

      <h3>Tendencias</h3>
      <div class="books-grid">
        <div v-if="isLoading.trending" class="loading-placeholder">
          Cargando tendencias...
        </div>
        <div 
          v-else
          v-for="book in trendingBooks" 
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
            <h4>{{ book.title }}</h4>
            <p class="authors">{{ book.authors.join(', ') }}</p>
            <div class="book-rating" v-if="book.averageRating || getUserRating(book.id)">
              <div class="rating-group">
                <span v-if="book.averageRating" class="rating-item">
                  <span class="stars">★</span>
                  {{ book.averageRating.toFixed(1) }}
                  <span class="ratings-count">({{ book.ratingsCount }} reseñas)</span>
                </span>
                <span v-if="getUserRating(book.id)" class="rating-item user-rating">
                  <span class="stars">★</span>
                  Tu calificación: {{ getUserRating(book.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lists-container">
      <div class="list-section">
        <h3>Lista de Lectura</h3>
        <div class="books-grid">
          <div 
            v-for="book in store.readingList" 
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
            </div>
          </div>
        </div>
      </div>

      <div class="list-section">
        <h3>Libros Favoritos</h3>
        <div class="books-grid">
          <div 
            v-for="book in store.favorites" 
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
              </div>
            </div>
            <div class="book-info">
              <h4>{{ book.title }}</h4>
              <p class="authors">{{ book.authors.join(', ') }}</p>
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
.dashboard {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0.5rem;
  }
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-card h3 {
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b883;
}

.lists-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.list-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  padding: 0 0.5rem;
}

@media (max-width: 480px) {
  .list-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .book-card {
    font-size: 0.9rem;
  }

  .book-cover {
    height: 200px;
  }

  .book-info {
    padding: 0.5rem;
  }

  .book-info h4 {
    font-size: 0.9rem;
  }

  .authors {
    font-size: 0.8rem;
  }

  .added-date {
    font-size: 0.7rem;
  }
}

.book-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 250px;
  background: #f5f5f5;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem;
}

.book-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.status-select {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem;
  font-size: 0.8rem;
  color: #2c3e50;
  max-width: 100%;
}

@media (max-width: 480px) {
  .status-select {
    font-size: 0.7rem;
    padding: 0.2rem;
  }
}

.status-favorite {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.3rem 0.5rem;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #f1c40f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-info {
  padding: 1rem;
}

.book-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  line-height: 1.4;
}

.authors {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.added-date {
  color: #888;
  font-size: 0.8rem;
  margin: 0;
}

.recommendations-section {
  margin: 2rem 0;
}

.recommendations-section h3 {
  color: var(--text-dark);
  margin: 1.5rem 0 1rem;
  font-size: 1.4rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.loading-placeholder {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-style: italic;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.stars {
  color: #f1c40f;
}

@media (max-width: 768px) {
  .recommendations-section h3 {
    font-size: 1.2rem;
    margin: 1rem 0 0.8rem;
  }

  .loading-placeholder {
    padding: 1rem;
  }
}

.status-source {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #2c3e50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.weeks-on-list {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
}

.rating-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.user-rating {
  color: #42b883;
  font-weight: 500;
}

.ratings-count {
  color: #888;
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .rating-group {
    gap: 0.2rem;
  }

  .rating-item {
    font-size: 0.8rem;
  }

  .ratings-count {
    font-size: 0.7rem;
  }
}
</style> 