import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { books, userBooks } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Check authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Get filter parameters
		const status = url.searchParams.get('status');
		const search = url.searchParams.get('search');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Build query
		let query = db
			.select({
				userBookId: userBooks.id,
				bookId: books.id,
				title: books.title,
				author: books.author,
				coverUrl: books.coverUrl,
				pages: books.pages,
				genre: books.genre,
				description: books.description,
				isbn: books.isbn,
				publishedDate: books.publishedDate,
				publisher: books.publisher,
				language: books.language,
				googleBooksId: books.googleBooksId,
				status: userBooks.status,
				rating: userBooks.rating,
				currentPage: userBooks.currentPage,
				startDate: userBooks.startDate,
				finishDate: userBooks.finishDate,
				personalNotes: userBooks.personalNotes,
				favoriteQuotes: userBooks.favoriteQuotes,
				createdAt: userBooks.createdAt,
				updatedAt: userBooks.updatedAt
			})
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(eq(userBooks.userId, locals.user.id))
			.limit(limit)
			.offset(offset)
			.orderBy(userBooks.updatedAt);

		// Apply status filter if provided
		if (status) {
			query = db
				.select({
					userBookId: userBooks.id,
					bookId: books.id,
					title: books.title,
					author: books.author,
					coverUrl: books.coverUrl,
					pages: books.pages,
					genre: books.genre,
					description: books.description,
					isbn: books.isbn,
					publishedDate: books.publishedDate,
					publisher: books.publisher,
					language: books.language,
					googleBooksId: books.googleBooksId,
					status: userBooks.status,
					rating: userBooks.rating,
					currentPage: userBooks.currentPage,
					startDate: userBooks.startDate,
					finishDate: userBooks.finishDate,
					personalNotes: userBooks.personalNotes,
					favoriteQuotes: userBooks.favoriteQuotes,
					createdAt: userBooks.createdAt,
					updatedAt: userBooks.updatedAt
				})
				.from(userBooks)
				.innerJoin(books, eq(userBooks.bookId, books.id))
				.where(and(
					eq(userBooks.userId, locals.user.id),
					eq(userBooks.status, status)
				))
				.limit(limit)
				.offset(offset)
				.orderBy(userBooks.updatedAt);
		}

		// Execute query
		const userBooksData = await query;

		// Filter by search term if provided (client-side for simplicity)
		let filteredBooks = userBooksData;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredBooks = userBooksData.filter(book => 
				book.title.toLowerCase().includes(searchLower) ||
				book.author.toLowerCase().includes(searchLower) ||
				(book.genre && book.genre.toLowerCase().includes(searchLower))
			);
		}

		// Get statistics - simplified approach
		const allUserBooks = await db
			.select({ status: userBooks.status })
			.from(userBooks)
			.where(eq(userBooks.userId, locals.user.id));

		const statsMap = allUserBooks.reduce((acc, book) => {
			acc[book.status] = (acc[book.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return {
			books: filteredBooks,
			stats: {
				total: allUserBooks.length,
				read: statsMap.read || 0,
				reading: statsMap.reading || 0,
				want_to_read: statsMap.want_to_read || 0,
				recommended: statsMap.recommended || 0,
				abandoned: statsMap.abandoned || 0
			},
			filters: {
				status: status || null,
				search: search || null,
				limit,
				offset
			},
			hasMore: userBooksData.length === limit
		};

	} catch (error) {
		console.error('Error loading user books:', error);
		return {
			books: [],
			stats: {
				total: 0,
				read: 0,
				reading: 0,
				want_to_read: 0,
				recommended: 0,
				abandoned: 0
			},
			filters: {
				status: null,
				search: null,
				limit: 20,
				offset: 0
			},
			hasMore: false,
			error: 'Error al cargar los libros'
		};
	}
}; 