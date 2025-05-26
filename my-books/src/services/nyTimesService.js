// Usando la API key directamente mientras se configura el .env
const NYT_API_KEY = 'wz8Md835HTVgX3Ipa6t7brPgwdU8C5Pb'
const NYT_API_BASE_URL = 'https://api.nytimes.com/svc/books/v3'

export const nyTimesService = {
  // Get current bestsellers
  async getCurrentBestsellers(list = 'combined-print-and-e-book-fiction') {
    try {
      console.log('Obteniendo bestsellers de NYT...')
      const url = `${NYT_API_BASE_URL}/lists/current/${list}.json?api-key=${NYT_API_KEY}`
      console.log('URL de la petición:', url)
      
      const response = await fetch(url)
      console.log('Respuesta de NYT:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Datos recibidos de NYT:', data)
      
      if (data.fault) {
        throw new Error(`Error de NYT API: ${data.fault.detail.errorcode}`)
      }

      // Verificar si tenemos libros en la respuesta
      if (!data.results?.books?.length) {
        console.warn('No se encontraron libros en la respuesta de NYT')
        return []
      }

      // Ordenar por rank y tomar los primeros 8
      const sortedBooks = data.results.books.sort((a, b) => a.rank - b.rank)
      console.log('Libros ordenados por rank:', sortedBooks)
      
      return sortedBooks.slice(0, 8)
    } catch (error) {
      console.error('Error detallado al obtener bestsellers de NYT:', error)
      return []
    }
  },

  // Get book reviews
  async getBookReviews(isbn) {
    try {
      console.log('Intentando obtener reseñas de NYT para ISBN:', isbn)
      const url = `${NYT_API_BASE_URL}/reviews.json?isbn=${isbn}&api-key=${NYT_API_KEY}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error al obtener reseñas de NYT:', error)
      return []
    }
  },

  // Get available bestseller lists
  async getBestsellerLists() {
    try {
      console.log('Obteniendo listas de bestsellers disponibles...')
      const url = `${NYT_API_BASE_URL}/lists/names.json?api-key=${NYT_API_KEY}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Listas disponibles:', data.results)
      return data.results || []
    } catch (error) {
      console.error('Error al obtener listas de NYT:', error)
      return []
    }
  },

  // Format NYT book data to match our app's format
  formatBookData(nytBook) {
    if (!nytBook) {
      console.warn('Intentando formatear un libro nulo o indefinido de NYT')
      return null
    }
    
    console.log('Formateando libro de NYT:', nytBook)
    return {
      id: `nyt-${nytBook.primary_isbn13}`,
      title: nytBook.title,
      authors: [nytBook.author],
      description: nytBook.description || 'Sin descripción disponible',
      coverUrl: nytBook.book_image,
      publishedDate: nytBook.created_date,
      publisher: nytBook.publisher,
      categories: [nytBook.list_name],
      isbn: nytBook.primary_isbn13,
      rank: nytBook.rank,
      weeksOnList: nytBook.weeks_on_list,
      amazonUrl: nytBook.amazon_product_url,
      reviewUrl: nytBook.book_review_link,
      buyLinks: nytBook.buy_links || [],
      source: 'NYT'
    }
  }
} 