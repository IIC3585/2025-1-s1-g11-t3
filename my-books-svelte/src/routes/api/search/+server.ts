import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import type { GoogleBooksResponse } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const maxResults = url.searchParams.get('maxResults') || '10';
	const startIndex = url.searchParams.get('startIndex') || '0';

	if (!query) {
		return json({ error: 'Query parameter is required' }, { status: 400 });
	}

	try {
		// Construir URL de Google Books API
		const googleBooksUrl = new URL('https://www.googleapis.com/books/v1/volumes');
		googleBooksUrl.searchParams.set('q', query);
		googleBooksUrl.searchParams.set('maxResults', maxResults);
		googleBooksUrl.searchParams.set('startIndex', startIndex);
		googleBooksUrl.searchParams.set('printType', 'books');
		googleBooksUrl.searchParams.set('orderBy', 'relevance');

		// Agregar API key si está disponible
		if (env.GOOGLE_BOOKS_API_KEY) {
			googleBooksUrl.searchParams.set('key', env.GOOGLE_BOOKS_API_KEY);
		}

		console.log('Searching Google Books:', googleBooksUrl.toString());

		const response = await fetch(googleBooksUrl.toString());
		
		if (!response.ok) {
			console.error('Google Books API error:', response.status, response.statusText);
			return json(
				{ error: 'Error searching books', details: response.statusText },
				{ status: response.status }
			);
		}

		const data: GoogleBooksResponse = await response.json();

		// Transformar los datos para que sean más fáciles de usar
		const transformedData = {
			totalItems: data.totalItems || 0,
			items: data.items?.map(item => ({
				id: item.id,
				title: item.volumeInfo.title || 'Sin título',
				authors: item.volumeInfo.authors || ['Autor desconocido'],
				publishedDate: item.volumeInfo.publishedDate || '',
				description: item.volumeInfo.description || '',
				isbn: item.volumeInfo.industryIdentifiers?.find(
					id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
				)?.identifier || '',
				pageCount: item.volumeInfo.pageCount || 0,
				categories: item.volumeInfo.categories || [],
				imageLinks: {
					thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
					smallThumbnail: item.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || ''
				},
				language: item.volumeInfo.language || 'es',
				publisher: item.volumeInfo.publisher || ''
			})) || []
		};

		return json(transformedData);

	} catch (error) {
		console.error('Error searching books:', error);
		return json(
			{ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}; 