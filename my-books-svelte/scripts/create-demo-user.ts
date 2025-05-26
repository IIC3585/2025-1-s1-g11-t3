import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { db, schema } from './db-connection';
import { eq } from 'drizzle-orm';

const { user } = schema;

async function createDemoUser() {
	try {
		console.log('🔍 Checking if demo user already exists...');
		
		// Check if demo user already exists
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.username, 'demo'))
			.limit(1);

		if (existingUser.length > 0) {
			console.log('✅ Demo user already exists!');
			console.log('Username: demo');
			console.log('Password: demo123');
			return;
		}

		console.log('👤 Creating demo user...');

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
		console.log('Username: demo');
		console.log('Password: demo123');
		console.log('Age: 25');
		console.log('');
		console.log('🎉 You can now test the authentication system!');

	} catch (error) {
		console.error('❌ Error creating demo user:', error);
		process.exit(1);
	}
}

// Run the script
createDemoUser(); 