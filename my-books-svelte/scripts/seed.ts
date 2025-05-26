import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { db, schema } from './db-connection';
import { eq } from 'drizzle-orm';

const { user, books, userBooks } = schema;

async function seedDatabase() {
	console.log('🌱 Starting database seeding...');
	
	try {
		// 1. Create demo user
		await createDemoUser();
		
		// 2. Create sample books for demo user
		await createSampleBooks();
		
		console.log('');
		console.log('🎉 Database seeding completed successfully!');
		console.log('');
		console.log('📚 Demo account details:');
		console.log('   Username: demo');
		console.log('   Password: demo123');
		console.log('');
		console.log('✨ The demo user now has sample books in their library!');
		
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		process.exit(1);
	}
}

async function createDemoUser() {
	console.log('👤 Creating demo user...');
	
	// Check if demo user already exists
	const existingUser = await db
		.select()
		.from(user)
		.where(eq(user.username, 'demo'))
		.limit(1);

	if (existingUser.length > 0) {
		console.log('✅ Demo user already exists!');
		return existingUser[0].id;
	}

	// Hash password
	const passwordHash = await hash('demo123', {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	// Generate user ID
	const userId = generateIdFromEntropySize(10);

	// Create demo user
	await db.insert(user).values({
		id: userId,
		username: 'demo',
		passwordHash,
		age: 25
	});

	console.log('✅ Demo user created successfully!');
	return userId;
}

async function createSampleBooks() {
	console.log('📚 Creating sample books...');
	
	// Get demo user
	const demoUser = await db
		.select()
		.from(user)
		.where(eq(user.username, 'demo'))
		.limit(1);

	if (demoUser.length === 0) {
		console.log('❌ Demo user not found, skipping sample books');
		return;
	}

	const userId = demoUser[0].id;

	// Sample books data
	const sampleBooks = [
		{
			id: crypto.randomUUID(),
			title: 'Cien años de soledad',
			author: 'Gabriel García Márquez',
			isbn: '9780060883287',
			genre: 'Realismo mágico',
			description: 'La obra maestra de García Márquez que narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.',
			coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg',
			pages: 417,
			publishedDate: '1967-05-30',
			publisher: 'Editorial Sudamericana',
			language: 'es'
		},
		{
			id: crypto.randomUUID(),
			title: 'Don Quijote de la Mancha',
			author: 'Miguel de Cervantes',
			isbn: '9788424116682',
			genre: 'Novela',
			description: 'La obra cumbre de la literatura española que narra las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.',
			coverUrl: 'https://covers.openlibrary.org/b/isbn/9788424116682-L.jpg',
			pages: 863,
			publishedDate: '1605-01-16',
			publisher: 'Francisco de Robles',
			language: 'es'
		},
		{
			id: crypto.randomUUID(),
			title: 'La casa de los espíritus',
			author: 'Isabel Allende',
			isbn: '9788401242144',
			genre: 'Realismo mágico',
			description: 'La primera novela de Isabel Allende que cuenta la historia de cuatro generaciones de la familia del Trueba.',
			coverUrl: 'https://covers.openlibrary.org/b/isbn/9788401242144-L.jpg',
			pages: 433,
			publishedDate: '1982-10-01',
			publisher: 'Plaza & Janés',
			language: 'es'
		},
		{
			id: crypto.randomUUID(),
			title: 'Rayuela',
			author: 'Julio Cortázar',
			isbn: '9788437604572',
			genre: 'Novela experimental',
			description: 'Una novela revolucionaria que puede leerse de múltiples maneras, siguiendo diferentes órdenes de capítulos.',
			coverUrl: 'https://covers.openlibrary.org/b/isbn/9788437604572-L.jpg',
			pages: 635,
			publishedDate: '1963-06-28',
			publisher: 'Editorial Sudamericana',
			language: 'es'
		},
		{
			id: crypto.randomUUID(),
			title: 'El amor en los tiempos del cólera',
			author: 'Gabriel García Márquez',
			isbn: '9780307389732',
			genre: 'Romance',
			description: 'Una historia de amor que transcurre a lo largo de más de cincuenta años, explorando la naturaleza del amor en todas sus formas.',
			coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307389732-L.jpg',
			pages: 348,
			publishedDate: '1985-09-05',
			publisher: 'Editorial Oveja Negra',
			language: 'es'
		}
	];

	// Insert books
	for (const book of sampleBooks) {
		// Check if book already exists
		const existingBook = await db
			.select()
			.from(books)
			.where(eq(books.isbn, book.isbn))
			.limit(1);

		let bookId = book.id;
		
		if (existingBook.length === 0) {
			await db.insert(books).values(book);
			console.log(`📖 Created book: ${book.title}`);
		} else {
			bookId = existingBook[0].id;
			console.log(`📖 Book already exists: ${book.title}`);
		}

		// Check if user-book relationship exists
		const existingUserBook = await db
			.select()
			.from(userBooks)
			.where(eq(userBooks.userId, userId))
			.where(eq(userBooks.bookId, bookId))
			.limit(1);

		if (existingUserBook.length === 0) {
			// Create user-book relationship with different statuses
			const statuses = ['read', 'reading', 'want_to_read', 'recommended'];
			const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
			
			const userBookData: any = {
				id: crypto.randomUUID(),
				userId,
				bookId,
				status: randomStatus,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Add additional data based on status
			if (randomStatus === 'read') {
				userBookData.rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
				userBookData.finishDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Random date in last year
				userBookData.notes = 'Una lectura fascinante que recomiendo ampliamente.';
			} else if (randomStatus === 'reading') {
				userBookData.startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Started in last 30 days
				userBookData.currentPage = Math.floor(Math.random() * (book.pages * 0.8)); // 0-80% progress
			}

			await db.insert(userBooks).values(userBookData);
			console.log(`📚 Added "${book.title}" to demo user's library with status: ${randomStatus}`);
		}
	}

	console.log('✅ Sample books created successfully!');
}

// Run the script
seedDatabase(); 