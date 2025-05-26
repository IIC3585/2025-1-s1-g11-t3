// User types
export interface User {
	id: string;
	username: string;
	age?: number;
}

// Form types
export interface LoginForm {
	username: string;
	password: string;
}

export interface RegisterForm {
	username: string;
	password: string;
	confirmPassword: string;
	age?: number;
}

// Form validation types
export interface FormError {
	field: string;
	message: string;
}

export interface FormResult {
	success: boolean;
	errors?: FormError[];
	message?: string;
}

// Auth result types
export interface AuthResult {
	success: boolean;
	user?: User;
	error?: string;
	redirect?: string;
}

// Book types
export type BookStatus = 'reading' | 'read' | 'want_to_read' | 'recommended' | 'abandoned';

export type BookGenre = 
	| 'fiction'
	| 'non_fiction'
	| 'biography'
	| 'science'
	| 'history'
	| 'philosophy'
	| 'technology'
	| 'business'
	| 'self_help'
	| 'romance'
	| 'mystery'
	| 'fantasy'
	| 'science_fiction'
	| 'horror'
	| 'thriller'
	| 'poetry'
	| 'drama'
	| 'children'
	| 'young_adult'
	| 'other';

export interface Book {
	id: string;
	title: string;
	author: string;
	isbn?: string;
	publishedDate?: string;
	genre?: string;
	description?: string;
	coverUrl?: string;
	pages?: number;
	googleBooksId?: string;
	publisher?: string;
	language?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface UserBook {
	id: string;
	userId: string;
	bookId: string;
	status: BookStatus;
	rating?: number;
	currentPage?: number;
	startDate?: Date;
	finishDate?: Date;
	personalNotes?: string;
	favoriteQuotes?: string;
	recommendedBy?: string;
	isPrivate?: number;
	createdAt?: Date;
	updatedAt?: Date;
	// Joined book data
	book?: Book;
}

export interface ReadingGoal {
	id: string;
	userId: string;
	year: number;
	targetBooks: number;
	currentBooks: number;
	createdAt?: Date;
	updatedAt?: Date;
}

// Google Books API types
export interface GoogleBooksVolume {
	id: string;
	volumeInfo: {
		title: string;
		subtitle?: string;
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
		};
		language?: string;
		publisher?: string;
		printType?: string;
		maturityRating?: string;
		averageRating?: number;
		ratingsCount?: number;
		previewLink?: string;
		infoLink?: string;
	};
}

export interface GoogleBooksResponse {
	totalItems: number;
	items?: GoogleBooksVolume[];
}

// Form data types
export interface BookFormData {
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
}

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

// Statistics types
export interface ReadingStats {
	totalBooks: number;
	booksRead: number;
	booksReading: number;
	booksWantToRead: number;
	booksRecommended: number;
	booksAbandoned: number;
	booksThisYear: number;
	averageRating: number;
	totalPages: number;
	favoriteGenres: Array<{ genre: string; count: number }>;
	monthlyProgress: Array<{ month: string; books: number }>;
}

// Filter types
export interface BookFilters {
	status?: BookStatus;
	genre?: string;
	rating?: number;
	search?: string;
	sortBy?: 'title' | 'author' | 'rating' | 'dateAdded' | 'dateRead';
	sortOrder?: 'asc' | 'desc';
} 