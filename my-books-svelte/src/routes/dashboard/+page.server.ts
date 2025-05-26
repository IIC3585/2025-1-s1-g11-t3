import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userBooks, books } from '$lib/server/db/schema';
import { eq, and, count, avg, sum } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Get basic book statistics
		const [totalBooksResult] = await db
			.select({ count: count() })
			.from(userBooks)
			.where(eq(userBooks.userId, locals.user.id));

		const [booksReadResult] = await db
			.select({ count: count() })
			.from(userBooks)
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, 'read')
			));

		const [booksReadingResult] = await db
			.select({ count: count() })
			.from(userBooks)
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, 'reading')
			));

		const [booksWantToReadResult] = await db
			.select({ count: count() })
			.from(userBooks)
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, 'want_to_read')
			));

		// Get average rating
		const [avgRatingResult] = await db
			.select({ avg: avg(userBooks.rating) })
			.from(userBooks)
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, 'read')
			));

		// Get total pages read
		const totalPagesResult = await db
			.select({ pages: books.pages })
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, 'read')
			));

		const totalPages = totalPagesResult.reduce((sum, book) => sum + (book.pages || 0), 0);

		// Get recent books (last 5)
		const recentBooks = await db
			.select({
				id: userBooks.id,
				status: userBooks.status,
				rating: userBooks.rating,
				updatedAt: userBooks.updatedAt,
				book: {
					id: books.id,
					title: books.title,
					author: books.author,
					coverUrl: books.coverUrl,
					pages: books.pages
				}
			})
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(eq(userBooks.userId, locals.user.id))
			.orderBy(userBooks.updatedAt)
			.limit(5);

		const stats = {
			totalBooks: totalBooksResult.count,
			booksRead: booksReadResult.count,
			booksReading: booksReadingResult.count,
			booksWantToRead: booksWantToReadResult.count,
			averageRating: Number(avgRatingResult.avg) || 0,
			totalPages
		};

		return {
			user: locals.user,
			stats,
			recentBooks
		};

	} catch (error) {
		console.error('Error loading dashboard data:', error);
		return {
			user: locals.user,
			stats: {
				totalBooks: 0,
				booksRead: 0,
				booksReading: 0,
				booksWantToRead: 0,
				averageRating: 0,
				totalPages: 0
			},
			recentBooks: []
		};
	}
}; 