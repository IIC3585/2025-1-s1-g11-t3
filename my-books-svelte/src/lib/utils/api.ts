import type { GoogleBooksResponse, GoogleBooksVolume, BookSearchResult } from '$lib/types/book';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search books using Google Books API
 */
export async function searchGoogleBooks(
	query: string,
	apiKey?: string,
	maxResults: number = 10
): Promise<BookSearchResult[]> {
	try {
		const params = new URLSearchParams({
			q: query,
			maxResults: maxResults.toString(),
			printType: 'books',
			langRestrict: 'es,en'
		});

		if (apiKey) {
			params.append('key', apiKey);
		}

		const response = await fetch(`${GOOGLE_BOOKS_API_BASE}?${params}`);
		
		if (!response.ok) {
			throw new Error(`Google Books API error: ${response.status}`);
		}

		const data: GoogleBooksResponse = await response.json();
		
		return data.items?.map(transformGoogleBookToSearchResult) || [];
	} catch (error) {
		console.error('Error searching Google Books:', error);
		return [];
	}
}

/**
 * Get book details by Google Books ID
 */
export async function getGoogleBookDetails(
	googleBooksId: string,
	apiKey?: string
): Promise<BookSearchResult | null> {
	try {
		const params = new URLSearchParams();
		if (apiKey) {
			params.append('key', apiKey);
		}

		const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/${googleBooksId}?${params}`);
		
		if (!response.ok) {
			throw new Error(`Google Books API error: ${response.status}`);
		}

		const data: GoogleBooksVolume = await response.json();
		
		return transformGoogleBookToSearchResult(data);
	} catch (error) {
		console.error('Error getting Google Book details:', error);
		return null;
	}
}

/**
 * Search books by ISBN
 */
export async function searchBooksByISBN(
	isbn: string,
	apiKey?: string
): Promise<BookSearchResult[]> {
	const cleanISBN = isbn.replace(/[-\s]/g, '');
	return searchGoogleBooks(`isbn:${cleanISBN}`, apiKey, 5);
}

/**
 * Transform Google Books API response to our internal format
 */
function transformGoogleBookToSearchResult(volume: GoogleBooksVolume): BookSearchResult {
	const { volumeInfo } = volume;
	
	// Get the best available cover image
	const coverUrl = volumeInfo.imageLinks?.medium ||
		volumeInfo.imageLinks?.large ||
		volumeInfo.imageLinks?.small ||
		volumeInfo.imageLinks?.thumbnail ||
		volumeInfo.imageLinks?.smallThumbnail;

	// Get ISBN (prefer ISBN_13, fallback to ISBN_10)
	const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
		volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

	// Get primary genre from categories
	const genre = volumeInfo.categories?.[0]?.toLowerCase().replace(/\s+/g, '_');

	return {
		id: volume.id,
		title: volumeInfo.title || 'Título desconocido',
		author: volumeInfo.authors?.join(', ') || 'Autor desconocido',
		isbn,
		publishedDate: volumeInfo.publishedDate,
		description: volumeInfo.description,
		coverUrl: coverUrl?.replace('http:', 'https:'), // Ensure HTTPS
		pages: volumeInfo.pageCount,
		genre,
		publisher: volumeInfo.publisher,
		language: volumeInfo.language || 'es',
		googleBooksId: volume.id
	};
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Format book authors for display
 */
export function formatAuthors(authors: string | string[]): string {
	if (typeof authors === 'string') {
		return authors;
	}
	
	if (Array.isArray(authors)) {
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return authors.join(' y ');
		return `${authors.slice(0, -1).join(', ')} y ${authors[authors.length - 1]}`;
	}
	
	return 'Autor desconocido';
}

/**
 * Generate a unique ID for books
 */
export function generateBookId(): string {
	return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for user books
 */
export function generateUserBookId(): string {
	return `user_book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 