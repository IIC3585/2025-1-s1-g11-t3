import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL environment variable is not set');
	console.log('💡 Make sure you have a .env file with DATABASE_URL configured');
	process.exit(1);
}

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema }; 