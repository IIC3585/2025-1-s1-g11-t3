// Book status enum
export type BookStatus = 'reading' | 'read' | 'want_to_read' | 'recommended' | 'abandoned';

// Book genres
export type BookGenre = 
	| 'fiction'
	| 'non_fiction'
	| 'biography'
	| 'science'
	| 'history'
	| 'fantasy'
	| 'mystery'
	| 'romance'
	| 'thriller'
	| 'self_help'
	| 'business'
	| 'philosophy'
	| 'poetry'
	| 'children'
	| 'young_adult'
	| 'other';

// Google Books API response types
export interface GoogleBooksVolume {
	id: string;
	volumeInfo: {
		title: string;
		authors?: string[];
		publishedDate?: string;
		description?: string;
		industryIdentifiers?: Array<{
			type: string;
			identifier: string;
		}>;
		pageCount?: number;
		categories?: string[];
		imageLinks?: {
			thumbnail?: string;
			smallThumbnail?: string;
			small?: string;
			medium?: string;
			large?: string;
		};
		language?: string;
		publisher?: string;
	};
}

export interface GoogleBooksResponse {
	totalItems: number;
	items?: GoogleBooksVolume[];
}

// Book search result for internal use
export interface BookSearchResult {
	id: string;
	title: string;
	author: string;
	isbn?: string;
	publishedDate?: string;
	description?: string;
	coverUrl?: string;
	pages?: number;
	genre?: string;
	publisher?: string;
	language?: string;
	googleBooksId: string;
}

// Book details for forms
export interface BookFormData {
	title: string;
	author: string;
	isbn?: string;
	publishedDate?: string;
	genre?: BookGenre;
	description?: string;
	coverUrl?: string;
	pages?: number;
	publisher?: string;
	language?: string;
	googleBooksId?: string;
}

// User book form data
export interface UserBookFormData {
	status: BookStatus;
	rating?: number;
	currentPage?: number;
	startDate?: string;
	finishDate?: string;
	personalNotes?: string;
	favoriteQuotes?: string;
	recommendedBy?: string;
	isPrivate?: boolean;
}

// Combined book with user data
export interface BookWithUserData {
	id: string;
	title: string;
	author: string;
	isbn?: string;
	publishedDate?: string;
	genre?: string;
	description?: string;
	coverUrl?: string;
	pages?: number;
	publisher?: string;
	language?: string;
	googleBooksId?: string;
	createdAt: Date;
	updatedAt: Date;
	// User-specific data
	userBookId?: string;
	status?: BookStatus;
	rating?: number;
	currentPage?: number;
	startDate?: Date;
	finishDate?: Date;
	personalNotes?: string;
	favoriteQuotes?: string;
	recommendedBy?: string;
	isPrivate?: boolean;
	userCreatedAt?: Date;
	userUpdatedAt?: Date;
}

// Filters for book lists
export interface BookFilters {
	status?: BookStatus | 'all';
	genre?: BookGenre | 'all';
	rating?: number | 'all';
	author?: string;
	search?: string;
	year?: number;
}

// Statistics types
export interface ReadingStats {
	totalBooks: number;
	booksRead: number;
	booksReading: number;
	booksWantToRead: number;
	booksRecommended: number;
	booksAbandoned: number;
	averageRating: number;
	totalPages: number;
	booksThisYear: number;
	favoriteGenres: Array<{ genre: string; count: number }>;
	monthlyReading: Array<{ month: string; count: number }>;
}

// Reading goal types
export interface ReadingGoalData {
	year: number;
	targetBooks: number;
	currentBooks: number;
	progress: number; // percentage
} 