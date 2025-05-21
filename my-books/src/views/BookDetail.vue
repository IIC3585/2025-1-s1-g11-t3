<script setup>
import { computed } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { bookService } from '../services/bookService'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const store = useBookStore()

const isFavorite = computed(() => store.isFavorite(props.book.id))
const isInReadingList = computed(() => store.isInReadingList(props.book.id))

const toggleFavorite = () => {
  if (isFavorite.value) {
    store.removeFromFavorites(props.book.id)
  } else {
    store.addToFavorites(props.book)
  }
}

const toggleReadingList = () => {
  if (isInReadingList.value) {
    store.removeFromReadingList(props.book.id)
  } else {
    store.addToReadingList(props.book)
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">&times;</button>
      
      <div class="book-details">
        <div class="book-cover">
          <img 
            v-if="book.coverUrl" 
            :src="book.coverUrl" 
            :alt="book.title"
            class="cover-image"
          />
          <div v-else class="no-cover">Sin portada</div>
        </div>

        <div class="book-info">
          <h2>{{ book.title }}</h2>
          <p class="authors">{{ book.authors.join(', ') }}</p>

          <div class="book-rating" v-if="book.averageRating">
            <span class="stars">★</span>
            {{ book.averageRating.toFixed(1) }}
            <span class="ratings-count">({{ book.ratingsCount }} reseñas)</span>
          </div>

          <div class="book-actions">
            <button 
              @click="toggleFavorite" 
              :class="['action-button', { active: isFavorite }]"
            >
              {{ isFavorite ? '★ Favorito' : '☆ Agregar a Favoritos' }}
            </button>
            <button 
              @click="toggleReadingList" 
              :class="['action-button', { active: isInReadingList }]"
            >
              {{ isInReadingList ? '✓ En Lista de Lectura' : '+ Agregar a Lista de Lectura' }}
            </button>
          </div>

          <div class="book-metadata">
            <div class="meta-group">
              <h3>Detalles</h3>
              <p v-if="book.publisher"><strong>Editorial:</strong> {{ book.publisher }}</p>
              <p v-if="book.publishedDate"><strong>Publicado:</strong> {{ book.publishedDate }}</p>
              <p v-if="book.pageCount"><strong>Páginas:</strong> {{ book.pageCount }}</p>
              <p v-if="book.language"><strong>Idioma:</strong> {{ bookService.getLanguages().find(l => l.code === book.language)?.name || book.language }}</p>
              <p v-if="book.isbn"><strong>ISBN:</strong> {{ book.isbn }}</p>
            </div>

            <div class="meta-group" v-if="book.categories?.length">
              <h3>Categorías</h3>
              <div class="categories-list">
                <span v-for="category in book.categories" :key="category" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>
          </div>

          <div class="book-description">
            <h3>Descripción</h3>
            <p>{{ book.description || 'No hay descripción disponible.' }}</p>
          </div>

          <div class="book-links">
            <a v-if="book.previewLink" :href="book.previewLink" target="_blank" class="preview-link">
              Vista Previa
            </a>
            <a v-if="book.infoLink" :href="book.infoLink" target="_blank" class="info-link">
              Más Información
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;
}

.book-details {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 2rem;
}

.book-cover {
  width: 300px;
  height: 450px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
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

.book-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-info h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
  line-height: 1.3;
}

.authors {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #f1c40f;
}

.stars {
  font-size: 1.4rem;
}

.ratings-count {
  color: #666;
  font-size: 1rem;
}

.book-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.action-button {
  padding: 0.8rem 1.5rem;
  border: 2px solid #42b883;
  border-radius: 8px;
  background: white;
  color: #42b883;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: #42b883;
  color: white;
}

.action-button.active {
  background: #42b883;
  color: white;
}

.book-metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.meta-group h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.meta-group p {
  margin: 0.5rem 0;
  color: #666;
}

.meta-group strong {
  color: #2c3e50;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  background-color: #e9ecef;
  color: #2c3e50;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
}

.book-description {
  margin: 1rem 0;
}

.book-description h3 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.book-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.book-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.preview-link,
.info-link {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.preview-link {
  background-color: #42b883;
  color: white;
}

.info-link {
  background-color: #2c3e50;
  color: white;
}

.preview-link:hover,
.info-link:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .book-details {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .book-cover {
    max-width: 200px;
    margin: 0 auto;
  }

  .book-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .book-info {
    gap: 0.5rem;
  }

  .book-info h2 {
    font-size: 1.5rem;
  }

  .book-info p {
    font-size: 0.9rem;
  }

  .book-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .book-actions button {
    width: 100%;
  }

  .book-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .book-links a {
    width: 100%;
    text-align: center;
  }
}
</style> 