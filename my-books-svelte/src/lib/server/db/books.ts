import { db } from './index';
import { books, userBooks, readingGoals } from './schema';
import type { Book, UserBook, NewBook, NewUserBook, ReadingGoal, NewReadingGoal } from './schema';
import type { BookWithUserData, BookFilters, ReadingStats, BookStatus } from '$lib/types/book';
import { eq, and, desc, asc, sql, count, avg, like, or } from 'drizzle-orm';

/**
 * Create a new book in the database
 */
export async function createBook(bookData: NewBook): Promise<Book> {
	const [book] = await db.insert(books).values(bookData).returning();
	return book;
}

/**
 * Get a book by ID
 */
export async function getBookById(bookId: string): Promise<Book | null> {
	const [book] = await db.select().from(books).where(eq(books.id, bookId));
	return book || null;
}

/**
 * Get a book by Google Books ID
 */
export async function getBookByGoogleId(googleBooksId: string): Promise<Book | null> {
	const [book] = await db.select().from(books).where(eq(books.googleBooksId, googleBooksId));
	return book || null;
}

/**
 * Update a book
 */
export async function updateBook(bookId: string, updates: Partial<NewBook>): Promise<Book | null> {
	const [book] = await db
		.update(books)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(books.id, bookId))
		.returning();
	return book || null;
}

/**
 * Delete a book
 */
export async function deleteBook(bookId: string): Promise<boolean> {
	const result = await db.delete(books).where(eq(books.id, bookId));
	return result.rowCount > 0;
}

/**
 * Add a book to user's library
 */
export async function addBookToUserLibrary(userBookData: NewUserBook): Promise<UserBook> {
	const [userBook] = await db.insert(userBooks).values(userBookData).returning();
	return userBook;
}

/**
 * Get user's book entry
 */
export async function getUserBook(userId: string, bookId: string): Promise<UserBook | null> {
	const [userBook] = await db
		.select()
		.from(userBooks)
		.where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));
	return userBook || null;
}

/**
 * Update user's book data
 */
export async function updateUserBook(
	userBookId: string,
	updates: Partial<NewUserBook>
): Promise<UserBook | null> {
	const [userBook] = await db
		.update(userBooks)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(userBooks.id, userBookId))
		.returning();
	return userBook || null;
}

/**
 * Remove book from user's library
 */
export async function removeBookFromUserLibrary(userId: string, bookId: string): Promise<boolean> {
	const result = await db
		.delete(userBooks)
		.where(and(eq(userBooks.userId, userId), eq(userBooks.bookId, bookId)));
	return result.rowCount > 0;
}

/**
 * Get user's books with filters
 */
export async function getUserBooks(
	userId: string,
	filters: BookFilters = {},
	limit: number = 50,
	offset: number = 0
): Promise<BookWithUserData[]> {
	let query = db
		.select({
			// Book data
			id: books.id,
			title: books.title,
			author: books.author,
			isbn: books.isbn,
			publishedDate: books.publishedDate,
			genre: books.genre,
			description: books.description,
			coverUrl: books.coverUrl,
			pages: books.pages,
			publisher: books.publisher,
			language: books.language,
			googleBooksId: books.googleBooksId,
			createdAt: books.createdAt,
			updatedAt: books.updatedAt,
			// User book data
			userBookId: userBooks.id,
			status: userBooks.status,
			rating: userBooks.rating,
			currentPage: userBooks.currentPage,
			startDate: userBooks.startDate,
			finishDate: userBooks.finishDate,
			personalNotes: userBooks.personalNotes,
			favoriteQuotes: userBooks.favoriteQuotes,
			recommendedBy: userBooks.recommendedBy,
			isPrivate: userBooks.isPrivate,
			userCreatedAt: userBooks.createdAt,
			userUpdatedAt: userBooks.updatedAt
		})
		.from(userBooks)
		.innerJoin(books, eq(userBooks.bookId, books.id))
		.where(eq(userBooks.userId, userId));

	// Apply filters
	const conditions = [eq(userBooks.userId, userId)];

	if (filters.status && filters.status !== 'all') {
		conditions.push(eq(userBooks.status, filters.status));
	}

	if (filters.genre && filters.genre !== 'all') {
		conditions.push(eq(books.genre, filters.genre));
	}

	if (filters.rating && filters.rating !== 'all') {
		conditions.push(eq(userBooks.rating, filters.rating));
	}

	if (filters.search) {
		conditions.push(
			or(
				like(books.title, `%${filters.search}%`),
				like(books.author, `%${filters.search}%`)
			)
		);
	}

	if (filters.author) {
		conditions.push(like(books.author, `%${filters.author}%`));
	}

	if (filters.year) {
		conditions.push(like(books.publishedDate, `${filters.year}%`));
	}

	query = query.where(and(...conditions));

	// Add ordering
	query = query.orderBy(desc(userBooks.updatedAt));

	// Add pagination
	query = query.limit(limit).offset(offset);

	const results = await query;

	return results.map(row => ({
		id: row.id,
		title: row.title,
		author: row.author,
		isbn: row.isbn,
		publishedDate: row.publishedDate,
		genre: row.genre,
		description: row.description,
		coverUrl: row.coverUrl,
		pages: row.pages,
		publisher: row.publisher,
		language: row.language,
		googleBooksId: row.googleBooksId,
		createdAt: row.createdAt!,
		updatedAt: row.updatedAt!,
		userBookId: row.userBookId,
		status: row.status as BookStatus,
		rating: row.rating,
		currentPage: row.currentPage,
		startDate: row.startDate,
		finishDate: row.finishDate,
		personalNotes: row.personalNotes,
		favoriteQuotes: row.favoriteQuotes,
		recommendedBy: row.recommendedBy,
		isPrivate: Boolean(row.isPrivate),
		userCreatedAt: row.userCreatedAt!,
		userUpdatedAt: row.userUpdatedAt!
	}));
}

/**
 * Get reading statistics for a user
 */
export async function getUserReadingStats(userId: string): Promise<ReadingStats> {
	// Get basic counts
	const statusCounts = await db
		.select({
			status: userBooks.status,
			count: count()
		})
		.from(userBooks)
		.where(eq(userBooks.userId, userId))
		.groupBy(userBooks.status);

	// Get average rating
	const [avgRating] = await db
		.select({
			avg: avg(userBooks.rating)
		})
		.from(userBooks)
		.where(and(eq(userBooks.userId, userId), eq(userBooks.status, 'read')));

	// Get total pages read
	const [totalPagesResult] = await db
		.select({
			total: sql<number>`sum(${books.pages})`
		})
		.from(userBooks)
		.innerJoin(books, eq(userBooks.bookId, books.id))
		.where(and(eq(userBooks.userId, userId), eq(userBooks.status, 'read')));

	// Get books read this year
	const currentYear = new Date().getFullYear();
	const [booksThisYearResult] = await db
		.select({
			count: count()
		})
		.from(userBooks)
		.where(
			and(
				eq(userBooks.userId, userId),
				eq(userBooks.status, 'read'),
				sql`EXTRACT(YEAR FROM ${userBooks.finishDate}) = ${currentYear}`
			)
		);

	// Get favorite genres
	const genreCounts = await db
		.select({
			genre: books.genre,
			count: count()
		})
		.from(userBooks)
		.innerJoin(books, eq(userBooks.bookId, books.id))
		.where(and(eq(userBooks.userId, userId), eq(userBooks.status, 'read')))
		.groupBy(books.genre)
		.orderBy(desc(count()))
		.limit(5);

	// Get monthly reading data for current year
	const monthlyReading = await db
		.select({
			month: sql<string>`TO_CHAR(${userBooks.finishDate}, 'YYYY-MM')`,
			count: count()
		})
		.from(userBooks)
		.where(
			and(
				eq(userBooks.userId, userId),
				eq(userBooks.status, 'read'),
				sql`EXTRACT(YEAR FROM ${userBooks.finishDate}) = ${currentYear}`
			)
		)
		.groupBy(sql`TO_CHAR(${userBooks.finishDate}, 'YYYY-MM')`)
		.orderBy(sql`TO_CHAR(${userBooks.finishDate}, 'YYYY-MM')`);

	// Process status counts
	const statusMap = statusCounts.reduce((acc, { status, count }) => {
		acc[status] = count;
		return acc;
	}, {} as Record<string, number>);

	return {
		totalBooks: statusCounts.reduce((sum, { count }) => sum + count, 0),
		booksRead: statusMap.read || 0,
		booksReading: statusMap.reading || 0,
		booksWantToRead: statusMap.want_to_read || 0,
		booksRecommended: statusMap.recommended || 0,
		booksAbandoned: statusMap.abandoned || 0,
		averageRating: Number(avgRating?.avg) || 0,
		totalPages: totalPagesResult?.total || 0,
		booksThisYear: booksThisYearResult?.count || 0,
		favoriteGenres: genreCounts.map(({ genre, count }) => ({
			genre: genre || 'Sin género',
			count
		})),
		monthlyReading: monthlyReading.map(({ month, count }) => ({
			month,
			count
		}))
	};
}

/**
 * Create or update reading goal
 */
export async function setReadingGoal(goalData: NewReadingGoal): Promise<ReadingGoal> {
	// Check if goal already exists for this year
	const [existingGoal] = await db
		.select()
		.from(readingGoals)
		.where(and(eq(readingGoals.userId, goalData.userId), eq(readingGoals.year, goalData.year)));

	if (existingGoal) {
		// Update existing goal
		const [updatedGoal] = await db
			.update(readingGoals)
			.set({ ...goalData, updatedAt: new Date() })
			.where(eq(readingGoals.id, existingGoal.id))
			.returning();
		return updatedGoal;
	} else {
		// Create new goal
		const [newGoal] = await db.insert(readingGoals).values(goalData).returning();
		return newGoal;
	}
}

/**
 * Get reading goal for a specific year
 */
export async function getReadingGoal(userId: string, year: number): Promise<ReadingGoal | null> {
	const [goal] = await db
		.select()
		.from(readingGoals)
		.where(and(eq(readingGoals.userId, userId), eq(readingGoals.year, year)));
	return goal || null;
}

/**
 * Update reading goal progress
 */
export async function updateReadingGoalProgress(userId: string, year: number): Promise<void> {
	// Count books read this year
	const [booksReadResult] = await db
		.select({
			count: count()
		})
		.from(userBooks)
		.where(
			and(
				eq(userBooks.userId, userId),
				eq(userBooks.status, 'read'),
				sql`EXTRACT(YEAR FROM ${userBooks.finishDate}) = ${year}`
			)
		);

	const booksRead = booksReadResult?.count || 0;

	// Update the goal
	await db
		.update(readingGoals)
		.set({ currentBooks: booksRead, updatedAt: new Date() })
		.where(and(eq(readingGoals.userId, userId), eq(readingGoals.year, year)));
} 