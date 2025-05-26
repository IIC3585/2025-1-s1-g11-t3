const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'
import { nyTimesService } from './nyTimesService'

export const bookService = {
  // Search for books with filters
  async searchBooks(query, filters = {}) {
    try {
      // Si hay un query, lo buscamos específicamente en el título
      let searchQuery = query ? `intitle:${query}` : ''
      
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

      console.log('Buscando libros con query:', searchQuery)
      const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=40`)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      const results = this.formatBookResults(data.items || [])
      
      // Filtramos adicionalmente para asegurar que el título contenga la búsqueda
      const filteredResults = query 
        ? results.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase())
          )
        : results

      console.log('Resultados encontrados:', filteredResults.length)
      return filteredResults
    } catch (error) {
      console.error('Error al buscar libros:', error)
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

  // Get popular books (combined from Google Books and NYT)
  async getPopularBooks() {
    try {
      console.log('Obteniendo libros populares...')
      const [googleBooks, nytBooks] = await Promise.allSettled([
        // Get popular books from Google Books
        fetch(`${API_BASE_URL}?q=subject:fiction&orderBy=rating&maxResults=8`)
          .then(res => {
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
            return res.json()
          })
          .then(data => this.formatBookResults(data.items || [])),
        
        // Get bestsellers from NYT
        nyTimesService.getCurrentBestsellers()
          .then(books => books.map(book => nyTimesService.formatBookData(book)))
      ])

      console.log('Resultados de Google Books:', googleBooks)
      console.log('Resultados de NY Times:', nytBooks)

      // Manejar resultados de Google Books
      const googleResults = googleBooks.status === 'fulfilled' ? googleBooks.value : []
      if (googleBooks.status === 'rejected') {
        console.error('Error al obtener libros de Google:', googleBooks.reason)
      }

      // Manejar resultados de NY Times
      const nytResults = nytBooks.status === 'fulfilled' ? nytBooks.value : []
      if (nytBooks.status === 'rejected') {
        console.error('Error al obtener libros de NY Times:', nytBooks.reason)
      }

      // Combine and deduplicate results based on ISBN
      const combinedBooks = [...googleResults]
      const existingIsbns = new Set(googleResults.map(book => book.isbn))

      nytResults.forEach(book => {
        if (book && !existingIsbns.has(book.isbn)) {
          combinedBooks.push(book)
          existingIsbns.add(book.isbn)
        }
      })

      console.log('Libros combinados:', combinedBooks)
      return combinedBooks.slice(0, 8) // Return top 8 books
    } catch (error) {
      console.error('Error al obtener libros populares:', error)
      return []
    }
  },

  // Get bestsellers (combined from Google Books and NYT)
  async getBestsellers() {
    try {
      console.log('Obteniendo bestsellers...')
      const [googleBooks, nytBooks] = await Promise.allSettled([
        // Get bestsellers from Google Books
        fetch(`${API_BASE_URL}?q=subject:fiction&orderBy=newest&maxResults=8`)
          .then(res => {
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
            return res.json()
          })
          .then(data => this.formatBookResults(data.items || [])),
        
        // Get bestsellers from NYT
        nyTimesService.getCurrentBestsellers('combined-print-and-e-book-fiction')
          .then(books => books.map(book => nyTimesService.formatBookData(book)))
      ])

      // Manejar resultados de Google Books
      const googleResults = googleBooks.status === 'fulfilled' ? googleBooks.value : []
      if (googleBooks.status === 'rejected') {
        console.error('Error al obtener bestsellers de Google:', googleBooks.reason)
      }

      // Manejar resultados de NY Times
      const nytResults = nytBooks.status === 'fulfilled' ? nytBooks.value : []
      if (nytBooks.status === 'rejected') {
        console.error('Error al obtener bestsellers de NY Times:', nytBooks.reason)
      }

      // Combine and deduplicate results based on ISBN
      const combinedBooks = [...googleResults]
      const existingIsbns = new Set(googleResults.map(book => book.isbn))

      nytResults.forEach(book => {
        if (book && !existingIsbns.has(book.isbn)) {
          combinedBooks.push(book)
          existingIsbns.add(book.isbn)
        }
      })

      return combinedBooks.slice(0, 8) // Return top 8 books
    } catch (error) {
      console.error('Error al obtener bestsellers:', error)
      return []
    }
  },

  // Get trending books (combined from Google Books and NYT)
  async getTrendingBooks() {
    try {
      console.log('Obteniendo libros en tendencia...')
      const currentYear = new Date().getFullYear()
      const [googleBooks, nytBooks] = await Promise.allSettled([
        // Get trending books from Google Books
        fetch(`${API_BASE_URL}?q=publishedDate:${currentYear}&orderBy=rating&maxResults=8`)
          .then(res => {
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
            return res.json()
          })
          .then(data => this.formatBookResults(data.items || [])),
        
        // Get bestsellers from NYT (these are current trending books)
        nyTimesService.getCurrentBestsellers('combined-print-and-e-book-fiction')
          .then(books => books.map(book => nyTimesService.formatBookData(book)))
      ])

      // Manejar resultados de Google Books
      const googleResults = googleBooks.status === 'fulfilled' ? googleBooks.value : []
      if (googleBooks.status === 'rejected') {
        console.error('Error al obtener tendencias de Google:', googleBooks.reason)
      }

      // Manejar resultados de NY Times
      const nytResults = nytBooks.status === 'fulfilled' ? nytBooks.value : []
      if (nytBooks.status === 'rejected') {
        console.error('Error al obtener tendencias de NY Times:', nytBooks.reason)
      }

      // Combine and deduplicate results based on ISBN
      const combinedBooks = [...googleResults]
      const existingIsbns = new Set(googleResults.map(book => book.isbn))

      nytResults.forEach(book => {
        if (book && !existingIsbns.has(book.isbn)) {
          combinedBooks.push(book)
          existingIsbns.add(book.isbn)
        }
      })

      return combinedBooks.slice(0, 8) // Return top 8 books
    } catch (error) {
      console.error('Error al obtener libros en tendencia:', error)
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