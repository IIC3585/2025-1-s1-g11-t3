import { execSync } from 'child_process';

async function dockerInit() {
	console.log('🐳 Inicializando MyBooks con Docker...');
	console.log('');

	try {
		// Esperar a que la base de datos esté lista
		console.log('⏳ Esperando a que PostgreSQL esté listo...');
		await waitForDatabase();

		// Ejecutar setup completo
		console.log('📋 Configurando esquema de base de datos...');
		execSync('npm run db:push', { stdio: 'inherit' });

		console.log('🌱 Creando datos iniciales...');
		execSync('npm run seed', { stdio: 'inherit' });

		console.log('');
		console.log('🎉 ¡MyBooks está listo!');
		console.log('');
		console.log('📚 Credenciales del usuario demo:');
		console.log('   Username: demo');
		console.log('   Password: demo123');
		console.log('');
		console.log('🚀 Inicia la aplicación con: npm run dev');
		console.log('');

	} catch (error) {
		console.error('❌ Error durante la inicialización:', error);
		process.exit(1);
	}
}

async function waitForDatabase() {
	const maxAttempts = 30;
	let attempts = 0;

	while (attempts < maxAttempts) {
		try {
			execSync('pg_isready -h localhost -p 5432 -U postgres', { stdio: 'pipe' });
			console.log('✅ PostgreSQL está listo!');
			return;
		} catch (error) {
			attempts++;
			console.log(`⏳ Intento ${attempts}/${maxAttempts} - Esperando PostgreSQL...`);
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}

	throw new Error('PostgreSQL no está disponible después de 60 segundos');
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
	dockerInit();
} 