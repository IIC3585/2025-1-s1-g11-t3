import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { books, userBooks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { 
			googleBooksId, 
			title, 
			authors, 
			isbn, 
			publishedDate, 
			description, 
			coverUrl, 
			pageCount, 
			categories, 
			language, 
			publisher,
			status = 'want_to_read' // Default status
		} = body;

		// Validate required fields
		if (!googleBooksId || !title || !authors) {
			return json({ 
				error: 'Missing required fields: googleBooksId, title, authors' 
			}, { status: 400 });
		}

		// Check if book already exists in user's library
		const existingUserBook = await db
			.select()
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(books.googleBooksId, googleBooksId)
			))
			.limit(1);

		if (existingUserBook.length > 0) {
			return json({ 
				error: 'Book already exists in your library',
				bookId: existingUserBook[0].books.id,
				userBookId: existingUserBook[0].user_books.id
			}, { status: 409 });
		}

		// Check if book exists in books table
		let bookRecord = await db
			.select()
			.from(books)
			.where(eq(books.googleBooksId, googleBooksId))
			.limit(1);

		let bookId: string;

		if (bookRecord.length === 0) {
			// Create new book record
			bookId = randomUUID();
			
			await db.insert(books).values({
				id: bookId,
				title,
				author: Array.isArray(authors) ? authors.join(', ') : authors,
				isbn: isbn || null,
				publishedDate: publishedDate || null,
				genre: categories && categories.length > 0 ? categories[0] : null,
				description: description || null,
				coverUrl: coverUrl || null,
				pages: pageCount || null,
				googleBooksId,
				publisher: publisher || null,
				language: language || 'es'
			});
		} else {
			bookId = bookRecord[0].id;
		}

		// Create user book record
		const userBookId = randomUUID();
		
		await db.insert(userBooks).values({
			id: userBookId,
			userId: locals.user.id,
			bookId,
			status,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Fetch the complete book data to return
		const completeBookData = await db
			.select({
				userBookId: userBooks.id,
				bookId: books.id,
				title: books.title,
				author: books.author,
				coverUrl: books.coverUrl,
				status: userBooks.status,
				createdAt: userBooks.createdAt
			})
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(eq(userBooks.id, userBookId))
			.limit(1);

		return json({
			success: true,
			message: 'Book added to library successfully',
			data: completeBookData[0]
		});

	} catch (error) {
		console.error('Error adding book to library:', error);
		return json({ 
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	try {
		const status = url.searchParams.get('status');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		let query = db
			.select({
				userBookId: userBooks.id,
				bookId: books.id,
				title: books.title,
				author: books.author,
				coverUrl: books.coverUrl,
				pages: books.pages,
				genre: books.genre,
				status: userBooks.status,
				rating: userBooks.rating,
				currentPage: userBooks.currentPage,
				startDate: userBooks.startDate,
				finishDate: userBooks.finishDate,
				personalNotes: userBooks.personalNotes,
				createdAt: userBooks.createdAt,
				updatedAt: userBooks.updatedAt
			})
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(eq(userBooks.userId, locals.user.id))
			.limit(limit)
			.offset(offset)
			.orderBy(userBooks.updatedAt);

		// Filter by status if provided
		if (status) {
			query = query.where(and(
				eq(userBooks.userId, locals.user.id),
				eq(userBooks.status, status)
			));
		}

		const userBooksData = await query;

		return json({
			success: true,
			data: userBooksData,
			pagination: {
				limit,
				offset,
				hasMore: userBooksData.length === limit
			}
		});

	} catch (error) {
		console.error('Error fetching user books:', error);
		return json({ 
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 