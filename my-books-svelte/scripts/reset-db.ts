import { execSync } from 'child_process';

async function resetDatabase() {
	console.log('🔄 Resetting MyBooks database...');
	console.log('');
	console.log('⚠️  WARNING: This will delete ALL data in the database!');
	console.log('');

	try {
		// 1. Drop and recreate database schema
		console.log('🗑️  Dropping existing database schema...');
		execSync('drizzle-kit drop', { stdio: 'inherit' });
		console.log('✅ Database schema dropped!');
		console.log('');

		// 2. Push new schema
		console.log('📋 Pushing fresh database schema...');
		execSync('npm run db:push', { stdio: 'inherit' });
		console.log('✅ Fresh database schema created!');
		console.log('');

		// 3. Run seeding
		console.log('🌱 Seeding database with demo data...');
		execSync('npm run seed', { stdio: 'inherit' });
		console.log('');

		console.log('🎉 Database reset and seeding completed successfully!');
		console.log('');
		console.log('📚 Demo account details:');
		console.log('   Username: demo');
		console.log('   Password: demo123');
		console.log('');
		console.log('🚀 You can now start the development server with: npm run dev');
		
	} catch (error) {
		console.error('❌ Error resetting database:', error);
		process.exit(1);
	}
}

// Run the script
resetDatabase(); 