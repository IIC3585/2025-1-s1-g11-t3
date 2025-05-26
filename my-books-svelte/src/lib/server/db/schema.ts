import { pgTable, text, integer, timestamp, real } from 'drizzle-orm/pg-core';

// User table for authentication
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	age: integer('age')
});

// Session table for Lucia auth
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

// Books table - stores book information
export const books = pgTable('books', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	author: text('author').notNull(),
	isbn: text('isbn'),
	publishedDate: text('published_date'),
	genre: text('genre'),
	description: text('description'),
	coverUrl: text('cover_url'),
	pages: integer('pages'),
	googleBooksId: text('google_books_id'),
	publisher: text('publisher'),
	language: text('language').default('es'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// User books table - stores user's personal book data and reading status
export const userBooks = pgTable('user_books', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	bookId: text('book_id')
		.notNull()
		.references(() => books.id, { onDelete: 'cascade' }),
	status: text('status').notNull(), // 'reading', 'read', 'want_to_read', 'recommended', 'abandoned'
	rating: integer('rating'), // 1-5
	currentPage: integer('current_page').default(0),
	startDate: timestamp('start_date', { withTimezone: true, mode: 'date' }),
	finishDate: timestamp('finish_date', { withTimezone: true, mode: 'date' }),
	personalNotes: text('personal_notes'),
	favoriteQuotes: text('favorite_quotes'),
	recommendedBy: text('recommended_by'),
	isPrivate: integer('is_private').default(0), // 0 = public, 1 = private
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Reading goals table - for annual reading goals
export const readingGoals = pgTable('reading_goals', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	year: integer('year').notNull(),
	targetBooks: integer('target_books').notNull(),
	currentBooks: integer('current_books').default(0),
	targetPages: integer('target_pages'),
	currentPages: integer('current_pages').default(0),
	description: text('description'), // Optional description like "Leer más clásicos"
	isActive: integer('is_active').default(1), // 1 = active, 0 = inactive
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Export types for authentication
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

// Export types for books functionality
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type UserBook = typeof userBooks.$inferSelect;
export type NewUserBook = typeof userBooks.$inferInsert;
export type ReadingGoal = typeof readingGoals.$inferSelect;
export type NewReadingGoal = typeof readingGoals.$inferInsert;
