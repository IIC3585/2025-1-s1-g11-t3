import { execSync } from 'child_process';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { db, schema } from './db-connection';
import { eq } from 'drizzle-orm';

const { user } = schema;

async function setupDatabase() {
	console.log('🚀 Setting up MyBooks database...');
	console.log('');

	try {
		// 1. Push database schema
		console.log('📋 Pushing database schema...');
		execSync('npm run db:push', { stdio: 'inherit' });
		console.log('✅ Database schema pushed successfully!');
		console.log('');

		// 2. Create demo user
		await createDemoUser();
		
		console.log('');
		console.log('🎉 Database setup completed successfully!');
		console.log('');
		console.log('📚 Demo account details:');
		console.log('   Username: demo');
		console.log('   Password: demo123');
		console.log('');
		console.log('🚀 You can now start the development server with: npm run dev');
		console.log('');
		console.log('💡 To add sample books to the demo user, run: npm run seed');
		
	} catch (error) {
		console.error('❌ Error setting up database:', error);
		process.exit(1);
	}
}

async function createDemoUser() {
	console.log('👤 Creating demo user...');
	
	try {
		// Check if demo user already exists
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.username, 'demo'))
			.limit(1);

		if (existingUser.length > 0) {
			console.log('✅ Demo user already exists!');
			return;
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
		
	} catch (error) {
		console.error('❌ Error creating demo user:', error);
		throw error;
	}
}

// Run the script
setupDatabase(); 