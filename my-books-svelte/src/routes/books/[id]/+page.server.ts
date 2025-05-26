import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import type { GoogleBooksVolume } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	if (!id) {
		throw error(400, 'Book ID is required');
	}

	try {
		// Construir URL para obtener detalles específicos del libro
		const googleBooksUrl = new URL(`https://www.googleapis.com/books/v1/volumes/${id}`);
		
		// Agregar API key si está disponible
		if (env.GOOGLE_BOOKS_API_KEY) {
			googleBooksUrl.searchParams.set('key', env.GOOGLE_BOOKS_API_KEY);
		}

		console.log('Fetching book details:', googleBooksUrl.toString());

		const response = await fetch(googleBooksUrl.toString());
		
		if (!response.ok) {
			if (response.status === 404) {
				throw error(404, 'Book not found');
			}
			console.error('Google Books API error:', response.status, response.statusText);
			throw error(500, 'Error fetching book details');
		}

		const bookData: GoogleBooksVolume = await response.json();

		// Transformar los datos para que sean más fáciles de usar
		const book = {
			id: bookData.id,
			title: bookData.volumeInfo.title || 'Sin título',
			authors: bookData.volumeInfo.authors || ['Autor desconocido'],
			publishedDate: bookData.volumeInfo.publishedDate || '',
			description: bookData.volumeInfo.description || '',
			isbn: bookData.volumeInfo.industryIdentifiers?.find(
				id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
			)?.identifier || '',
			pageCount: bookData.volumeInfo.pageCount || 0,
			categories: bookData.volumeInfo.categories || [],
			imageLinks: {
				thumbnail: bookData.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
				smallThumbnail: bookData.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || ''
			},
			language: bookData.volumeInfo.language || 'es',
			publisher: bookData.volumeInfo.publisher || '',
			// Información adicional disponible en la vista detallada
			subtitle: bookData.volumeInfo.subtitle || '',
			printType: bookData.volumeInfo.printType || '',
			maturityRating: bookData.volumeInfo.maturityRating || '',
			averageRating: bookData.volumeInfo.averageRating || 0,
			ratingsCount: bookData.volumeInfo.ratingsCount || 0,
			previewLink: bookData.volumeInfo.previewLink || '',
			infoLink: bookData.volumeInfo.infoLink || ''
		};

		return {
			book
		};

	} catch (err) {
		console.error('Error loading book details:', err);
		
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		
		throw error(500, 'Failed to load book details');
	}
}; 