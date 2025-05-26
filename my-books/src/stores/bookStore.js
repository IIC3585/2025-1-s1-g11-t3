import { defineStore } from 'pinia'

export const useBookStore = defineStore('books', {
  state: () => ({
    favorites: [],
    readingList: [],
    sortBy: 'relevance', // 'relevance', 'date', 'rating'
    sortOrder: 'desc', // 'asc', 'desc'
    userRatings: {} // Almacena las calificaciones de usuarios { bookId: rating }
  }),

  actions: {
    addToFavorites(book) {
      if (!this.favorites.find(b => b.id === book.id)) {
        this.favorites.push(book)
        // Persist to localStorage
        localStorage.setItem('favoriteBooks', JSON.stringify(this.favorites))
      }
    },

    removeFromFavorites(bookId) {
      this.favorites = this.favorites.filter(b => b.id !== bookId)
      localStorage.setItem('favoriteBooks', JSON.stringify(this.favorites))
    },

    addToReadingList(book) {
      if (!this.readingList.find(b => b.id === book.id)) {
        this.readingList.push({
          ...book,
          status: 'pending',
          addedDate: new Date().toISOString()
        })
        localStorage.setItem('readingList', JSON.stringify(this.readingList))
      }
    },

    removeFromReadingList(bookId) {
      this.readingList = this.readingList.filter(b => b.id !== bookId)
      localStorage.setItem('readingList', JSON.stringify(this.readingList))
    },

    updateBookStatus(bookId, status) {
      const book = this.readingList.find(b => b.id === bookId)
      if (book) {
        book.status = status
        localStorage.setItem('readingList', JSON.stringify(this.readingList))
      }
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy
    },

    setSortOrder(order) {
      this.sortOrder = order
    },

    rateBook(bookId, rating) {
      this.userRatings[bookId] = rating
      localStorage.setItem('userRatings', JSON.stringify(this.userRatings))
    },

    getUserRating(bookId) {
      return this.userRatings[bookId] || null
    },

    // Load saved data from localStorage
    loadSavedData() {
      const savedFavorites = localStorage.getItem('favoriteBooks')
      const savedReadingList = localStorage.getItem('readingList')
      const savedUserRatings = localStorage.getItem('userRatings')
      
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites)
      }
      if (savedReadingList) {
        this.readingList = JSON.parse(savedReadingList)
      }
      if (savedUserRatings) {
        this.userRatings = JSON.parse(savedUserRatings)
      }
    }
  },

  getters: {
    isFavorite: (state) => (bookId) => {
      return state.favorites.some(b => b.id === bookId)
    },
    
    isInReadingList: (state) => (bookId) => {
      return state.readingList.some(b => b.id === bookId)
    },

    getReadingListByStatus: (state) => (status) => {
      return state.readingList.filter(book => book.status === status)
    },

    sortedBooks: (state) => (books) => {
      return [...books].sort((a, b) => {
        let comparison = 0
        
        switch (state.sortBy) {
          case 'date':
            comparison = new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0)
            break
          case 'rating':
            comparison = (b.averageRating || 0) - (a.averageRating || 0)
            break
          default: // 'relevance'
            return 0
        }
        
        return state.sortOrder === 'asc' ? -comparison : comparison
      })
    }
  }
}) 