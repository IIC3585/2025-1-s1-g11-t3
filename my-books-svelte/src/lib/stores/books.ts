import { writable, derived } from 'svelte/store';
import type { BookWithUserData, BookFilters, ReadingStats } from '$lib/types/book';

// User's books store
export const userBooks = writable<BookWithUserData[]>([]);

// Loading states
export const isLoadingBooks = writable(false);
export const isLoadingStats = writable(false);

// Filters store
export const bookFilters = writable<BookFilters>({
	status: 'all',
	genre: 'all',
	rating: 'all',
	search: '',
	author: '',
	year: undefined
});

// Reading statistics store
export const readingStats = writable<ReadingStats>({
	totalBooks: 0,
	booksRead: 0,
	booksReading: 0,
	booksWantToRead: 0,
	booksRecommended: 0,
	booksAbandoned: 0,
	averageRating: 0,
	totalPages: 0,
	booksThisYear: 0,
	favoriteGenres: [],
	monthlyReading: []
});

// Derived stores for filtered books
export const filteredBooks = derived(
	[userBooks, bookFilters],
	([$userBooks, $filters]) => {
		let filtered = $userBooks;

		// Apply status filter
		if ($filters.status && $filters.status !== 'all') {
			filtered = filtered.filter(book => book.status === $filters.status);
		}

		// Apply genre filter
		if ($filters.genre && $filters.genre !== 'all') {
			filtered = filtered.filter(book => book.genre === $filters.genre);
		}

		// Apply rating filter
		if ($filters.rating && $filters.rating !== 'all') {
			filtered = filtered.filter(book => book.rating === $filters.rating);
		}

		// Apply search filter
		if ($filters.search) {
			const searchTerm = $filters.search.toLowerCase();
			filtered = filtered.filter(book => 
				book.title.toLowerCase().includes(searchTerm) ||
				book.author.toLowerCase().includes(searchTerm)
			);
		}

		// Apply author filter
		if ($filters.author) {
			const authorTerm = $filters.author.toLowerCase();
			filtered = filtered.filter(book => 
				book.author.toLowerCase().includes(authorTerm)
			);
		}

		// Apply year filter
		if ($filters.year) {
			filtered = filtered.filter(book => 
				book.publishedDate?.startsWith($filters.year!.toString())
			);
		}

		return filtered;
	}
);

// Derived store for books by status
export const booksByStatus = derived(userBooks, ($userBooks) => {
	return {
		reading: $userBooks.filter(book => book.status === 'reading'),
		read: $userBooks.filter(book => book.status === 'read'),
		want_to_read: $userBooks.filter(book => book.status === 'want_to_read'),
		recommended: $userBooks.filter(book => book.status === 'recommended'),
		abandoned: $userBooks.filter(book => book.status === 'abandoned')
	};
});

// Derived store for recent books
export const recentBooks = derived(userBooks, ($userBooks) => {
	return $userBooks
		.sort((a, b) => new Date(b.userUpdatedAt).getTime() - new Date(a.userUpdatedAt).getTime())
		.slice(0, 5);
});

// Functions to update stores
export const booksStore = {
	// Load user books
	async loadBooks(filters?: BookFilters) {
		isLoadingBooks.set(true);
		try {
			const params = new URLSearchParams();
			
			if (filters?.status && filters.status !== 'all') {
				params.append('status', filters.status);
			}
			if (filters?.genre && filters.genre !== 'all') {
				params.append('genre', filters.genre);
			}
			if (filters?.rating && filters.rating !== 'all') {
				params.append('rating', filters.rating.toString());
			}
			if (filters?.search) {
				params.append('search', filters.search);
			}
			if (filters?.author) {
				params.append('author', filters.author);
			}
			if (filters?.year) {
				params.append('year', filters.year.toString());
			}

			const response = await fetch(`/api/books?${params}`);
			if (!response.ok) {
				throw new Error('Failed to load books');
			}

			const data = await response.json();
			userBooks.set(data.books);
		} catch (error) {
			console.error('Error loading books:', error);
			throw error;
		} finally {
			isLoadingBooks.set(false);
		}
	},

	// Add a book to user's library
	async addBook(bookData: any, userBookData: any) {
		try {
			const response = await fetch('/api/books', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ bookData, userBookData })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to add book');
			}

			const result = await response.json();
			
			// Reload books to get updated list
			await this.loadBooks();
			
			return result;
		} catch (error) {
			console.error('Error adding book:', error);
			throw error;
		}
	},

	// Update book filters
	updateFilters(newFilters: Partial<BookFilters>) {
		bookFilters.update(current => ({ ...current, ...newFilters }));
	},

	// Clear all filters
	clearFilters() {
		bookFilters.set({
			status: 'all',
			genre: 'all',
			rating: 'all',
			search: '',
			author: '',
			year: undefined
		});
	},

	// Load reading statistics
	async loadStats() {
		isLoadingStats.set(true);
		try {
			const response = await fetch('/api/stats');
			if (!response.ok) {
				throw new Error('Failed to load statistics');
			}

			const data = await response.json();
			readingStats.set(data.stats);
		} catch (error) {
			console.error('Error loading stats:', error);
			throw error;
		} finally {
			isLoadingStats.set(false);
		}
	}
}; 