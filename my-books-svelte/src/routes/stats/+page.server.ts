import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { books, userBooks } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check authentication
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Get all user books with book details
		const allUserBooks = await db
			.select({
				userBookId: userBooks.id,
				bookId: books.id,
				title: books.title,
				author: books.author,
				pages: books.pages,
				genre: books.genre,
				status: userBooks.status,
				rating: userBooks.rating,
				currentPage: userBooks.currentPage,
				startDate: userBooks.startDate,
				finishDate: userBooks.finishDate,
				createdAt: userBooks.createdAt,
				updatedAt: userBooks.updatedAt
			})
			.from(userBooks)
			.innerJoin(books, eq(userBooks.bookId, books.id))
			.where(eq(userBooks.userId, locals.user.id));

		// Calculate basic statistics
		const totalBooks = allUserBooks.length;
		const readBooks = allUserBooks.filter(book => book.status === 'read');
		const readingBooks = allUserBooks.filter(book => book.status === 'reading');
		const wantToReadBooks = allUserBooks.filter(book => book.status === 'want_to_read');
		const recommendedBooks = allUserBooks.filter(book => book.status === 'recommended');
		const abandonedBooks = allUserBooks.filter(book => book.status === 'abandoned');

		// Calculate pages statistics
		const totalPagesRead = readBooks.reduce((sum, book) => sum + (book.pages || 0), 0);
		const averagePagesPerBook = readBooks.length > 0 ? Math.round(totalPagesRead / readBooks.length) : 0;

		// Calculate reading progress for current books
		const currentProgress = readingBooks.reduce((sum, book) => {
			if (book.currentPage && book.pages) {
				return sum + (book.currentPage / book.pages);
			}
			return sum;
		}, 0);
		const averageProgress = readingBooks.length > 0 ? Math.round((currentProgress / readingBooks.length) * 100) : 0;

		// Calculate ratings statistics
		const ratedBooks = allUserBooks.filter(book => book.rating && book.rating > 0);
		const averageRating = ratedBooks.length > 0 
			? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length 
			: 0;

		// Rating distribution
		const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
			rating,
			count: ratedBooks.filter(book => book.rating === rating).length
		}));

		// Genre statistics
		const genreStats = allUserBooks.reduce((acc, book) => {
			const genre = book.genre || 'Sin género';
			acc[genre] = (acc[genre] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const topGenres = Object.entries(genreStats)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5)
			.map(([genre, count]) => ({ genre, count }));

		// Author statistics
		const authorStats = allUserBooks.reduce((acc, book) => {
			const author = book.author || 'Autor desconocido';
			acc[author] = (acc[author] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const topAuthors = Object.entries(authorStats)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5)
			.map(([author, count]) => ({ author, count }));

		// Monthly reading activity (last 12 months)
		const currentDate = new Date();
		const monthlyActivity = [];
		
		for (let i = 11; i >= 0; i--) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
			const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
			
			const booksFinishedThisMonth = readBooks.filter(book => {
				if (!book.finishDate) return false;
				const finishDate = new Date(book.finishDate);
				return finishDate >= date && finishDate < nextMonth;
			}).length;

			const booksAddedThisMonth = allUserBooks.filter(book => {
				const createdDate = new Date(book.createdAt);
				return createdDate >= date && createdDate < nextMonth;
			}).length;

			monthlyActivity.push({
				month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
				booksFinished: booksFinishedThisMonth,
				booksAdded: booksAddedThisMonth
			});
		}

		// Reading streak (consecutive days with reading activity)
		const readingDates = readBooks
			.filter(book => book.finishDate)
			.map(book => new Date(book.finishDate!))
			.sort((a, b) => b.getTime() - a.getTime());

		let currentStreak = 0;
		let longestStreak = 0;
		let lastDate: Date | null = null;

		for (const date of readingDates) {
			if (!lastDate) {
				currentStreak = 1;
				longestStreak = 1;
			} else {
				const daysDiff = Math.floor((lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
				if (daysDiff === 1) {
					currentStreak++;
					longestStreak = Math.max(longestStreak, currentStreak);
				} else {
					currentStreak = 1;
				}
			}
			lastDate = date;
		}

		// Recent achievements
		const achievements = [];
		
		if (readBooks.length >= 10) achievements.push({ title: 'Lector Dedicado', description: 'Has leído 10 libros', icon: '📚' });
		if (readBooks.length >= 25) achievements.push({ title: 'Bibliófilo', description: 'Has leído 25 libros', icon: '📖' });
		if (readBooks.length >= 50) achievements.push({ title: 'Maestro Lector', description: 'Has leído 50 libros', icon: '🎓' });
		if (totalPagesRead >= 10000) achievements.push({ title: 'Devorador de Páginas', description: 'Has leído más de 10,000 páginas', icon: '📄' });
		if (longestStreak >= 7) achievements.push({ title: 'Racha de Lectura', description: `Racha de ${longestStreak} días leyendo`, icon: '🔥' });
		if (ratedBooks.length >= 10) achievements.push({ title: 'Crítico Literario', description: 'Has calificado 10 libros', icon: '⭐' });

		return {
			overview: {
				totalBooks,
				readBooks: readBooks.length,
				readingBooks: readingBooks.length,
				wantToReadBooks: wantToReadBooks.length,
				recommendedBooks: recommendedBooks.length,
				abandonedBooks: abandonedBooks.length,
				totalPagesRead,
				averagePagesPerBook,
				averageProgress,
				averageRating: Math.round(averageRating * 10) / 10,
				ratedBooks: ratedBooks.length
			},
			distributions: {
				ratingDistribution,
				topGenres,
				topAuthors
			},
			activity: {
				monthlyActivity,
				currentStreak,
				longestStreak
			},
			achievements,
			recentBooks: readBooks
				.sort((a, b) => new Date(b.finishDate || 0).getTime() - new Date(a.finishDate || 0).getTime())
				.slice(0, 5),
			currentlyReading: readingBooks.slice(0, 3)
		};

	} catch (error) {
		console.error('Error loading statistics:', error);
		return {
			overview: {
				totalBooks: 0,
				readBooks: 0,
				readingBooks: 0,
				wantToReadBooks: 0,
				recommendedBooks: 0,
				abandonedBooks: 0,
				totalPagesRead: 0,
				averagePagesPerBook: 0,
				averageProgress: 0,
				averageRating: 0,
				ratedBooks: 0
			},
			distributions: {
				ratingDistribution: [],
				topGenres: [],
				topAuthors: []
			},
			activity: {
				monthlyActivity: [],
				currentStreak: 0,
				longestStreak: 0
			},
			achievements: [],
			recentBooks: [],
			currentlyReading: [],
			error: 'Error al cargar las estadísticas'
		};
	}
}; 