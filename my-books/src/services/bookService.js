const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export const bookService = {
  // Search for books with filters
  async searchBooks(query, filters = {}) {
    try {
      let searchQuery = query
      
      // Add filters to the search query
      if (filters.author) {
        searchQuery += ` inauthor:${filters.author}`
      }
      if (filters.publisher) {
        searchQuery += ` inpublisher:${filters.publisher}`
      }
      if (filters.subject) {
        searchQuery += ` subject:${filters.subject}`
      }
      if (filters.language) {
        searchQuery += ` lang:${filters.language}`
      }
      if (filters.year) {
        searchQuery += ` publishedDate:${filters.year}`
      }

      const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=40`)
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error searching books:', error)
      return []
    }
  },

  // Get book details by ID
  async getBookById(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${bookId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching book details:', error)
      return null
    }
  },

  // Get book cover URL
  getBookCoverUrl(book, size = 'medium') {
    if (!book.volumeInfo?.imageLinks) return null
    
    const sizes = {
      small: 'thumbnail',
      medium: 'small',
      large: 'large'
    }
    
    return book.volumeInfo.imageLinks[sizes[size]] || book.volumeInfo.imageLinks.thumbnail
  },

  // Get available languages
  getLanguages() {
    return [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'Inglés' },
      { code: 'fr', name: 'Francés' },
      { code: 'de', name: 'Alemán' },
      { code: 'it', name: 'Italiano' },
      { code: 'pt', name: 'Portugués' }
    ]
  },

  // Get common subjects/categories
  getSubjects() {
    return [
      'Ficción',
      'No Ficción',
      'Ciencia Ficción',
      'Fantasía',
      'Misterio',
      'Romance',
      'Historia',
      'Ciencia',
      'Tecnología',
      'Biografía',
      'Autoayuda',
      'Negocios'
    ]
  },

  // Get popular books (based on ratings and reviews)
  async getPopularBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}?q=subject:fiction&orderBy=rating&maxResults=8`)
      const data = await response.json()
      return this.formatBookResults(data.items || [])
    } catch (error) {
      console.error('Error fetching popular books:', error)
      return []
    }
  },

  // Get bestsellers (based on sales and popularity)
  async getBestsellers() {
    try {
      const response = await fetch(`${API_BASE_URL}?q=subject:fiction&orderBy=newest&maxResults=8`)
      const data = await response.json()
      return this.formatBookResults(data.items || [])
    } catch (error) {
      console.error('Error fetching bestsellers:', error)
      return []
    }
  },

  // Get trending books (based on recent publications and ratings)
  async getTrendingBooks() {
    try {
      const currentYear = new Date().getFullYear()
      const response = await fetch(
        `${API_BASE_URL}?q=publishedDate:${currentYear}&orderBy=rating&maxResults=8`
      )
      const data = await response.json()
      return this.formatBookResults(data.items || [])
    } catch (error) {
      console.error('Error fetching trending books:', error)
      return []
    }
  },

  // Helper method to format book results consistently
  formatBookResults(books) {
    return books.map(book => ({
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || ['Autor desconocido'],
      description: book.volumeInfo.description || 'Sin descripción disponible',
      coverUrl: this.getBookCoverUrl(book),
      publishedDate: book.volumeInfo.publishedDate,
      pageCount: book.volumeInfo.pageCount,
      publisher: book.volumeInfo.publisher,
      categories: book.volumeInfo.categories || [],
      language: book.volumeInfo.language,
      averageRating: book.volumeInfo.averageRating,
      ratingsCount: book.volumeInfo.ratingsCount,
      previewLink: book.volumeInfo.previewLink,
      infoLink: book.volumeInfo.infoLink,
      isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier || 'No disponible'
    }))
  }
} 