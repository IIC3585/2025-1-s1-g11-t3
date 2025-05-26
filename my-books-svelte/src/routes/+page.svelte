<script lang="ts">
	import { onMount } from 'svelte';
	import { booksStore, userBooks, readingStats, recentBooks } from '$lib/stores/books';
	import BookCard from '$lib/components/BookCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let isLoading = true;

	$: user = data.user;

	// Auto-redirect authenticated users to dashboard
	onMount(() => {
		if (user) {
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 2000);
		}
	});

	onMount(async () => {
		try {
			await Promise.all([
				booksStore.loadBooks(),
				booksStore.loadStats()
			]);
		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			isLoading = false;
		}
	});

	$: stats = $readingStats;
	$: recent = $recentBooks;
</script>

<svelte:head>
	<title>MyBooks - Tu biblioteca personal</title>
	<meta name="description" content="Gestiona tu biblioteca personal con MyBooks. Organiza, califica y descubre nuevos libros." />
</svelte:head>

{#if user}
	<!-- Authenticated user - redirect to dashboard -->
	<div class="text-center py-12">
		<div class="max-w-md mx-auto">
			<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
				<span class="text-white text-2xl">📖</span>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">
				¡Hola de nuevo, {user.username}!
			</h1>
			<p class="text-gray-600 mb-6">
				Redirigiendo a tu dashboard...
			</p>
			<a
				href="/dashboard"
				class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
			>
				Ir al Dashboard
			</a>
		</div>
	</div>
{:else}
	<!-- Non-authenticated user - landing page -->
	<div class="space-y-16">
		<!-- Hero Section -->
		<div class="text-center py-12">
			<div class="max-w-4xl mx-auto">
				<div class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
					<span class="text-white text-4xl">📖</span>
				</div>
				<h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
					Tu biblioteca personal
					<span class="text-blue-600">inteligente</span>
				</h1>
				<p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
					Organiza, califica y descubre nuevos libros. Lleva un registro de tu progreso de lectura y encuentra tu próxima gran aventura literaria.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="/register"
						class="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
					>
						Comenzar gratis
					</a>
					<a
						href="/login"
						class="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
					>
						Iniciar sesión
					</a>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div class="py-12">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
					Todo lo que necesitas para gestionar tu biblioteca
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<!-- Feature 1 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">📚</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Organiza tu biblioteca</h3>
						<p class="text-gray-600">
							Mantén todos tus libros organizados por estado: leyendo, leído, por leer, recomendado o abandonado.
						</p>
					</div>

					<!-- Feature 2 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">⭐</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Califica y comenta</h3>
						<p class="text-gray-600">
							Asigna calificaciones a tus libros y escribe notas personales para recordar tus pensamientos.
						</p>
					</div>

					<!-- Feature 3 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">🔍</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Descubre nuevos libros</h3>
						<p class="text-gray-600">
							Busca libros usando la API de Google Books y añádelos fácilmente a tu biblioteca personal.
						</p>
					</div>

					<!-- Feature 4 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">📊</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Estadísticas detalladas</h3>
						<p class="text-gray-600">
							Ve tu progreso de lectura, libros por mes, géneros favoritos y mucho más.
						</p>
					</div>

					<!-- Feature 5 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">🎯</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Metas de lectura</h3>
						<p class="text-gray-600">
							Establece metas anuales de lectura y sigue tu progreso para mantenerte motivado.
						</p>
					</div>

					<!-- Feature 6 -->
					<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
							<span class="text-2xl">📱</span>
						</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-2">Diseño responsive</h3>
						<p class="text-gray-600">
							Accede a tu biblioteca desde cualquier dispositivo con una interfaz moderna y fácil de usar.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- CTA Section -->
		<div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl py-16 px-8">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
					¿Listo para organizar tu biblioteca?
				</h2>
				<p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
					Únete a miles de lectores que ya están usando MyBooks para gestionar su biblioteca personal.
				</p>
				<a
					href="/register"
					class="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
				>
					Crear cuenta gratis
				</a>
			</div>
		</div>

		<!-- Demo Section -->
		<div class="bg-gray-50 rounded-2xl py-12 px-8">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">
					¿Quieres probar antes de registrarte?
				</h2>
				<p class="text-gray-600 mb-6">
					Usa nuestra cuenta de demostración para explorar todas las funcionalidades.
				</p>
				<div class="bg-white rounded-lg p-6 max-w-md mx-auto">
					<h3 class="font-semibold text-gray-900 mb-3">Credenciales de demo:</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Usuario:</span>
							<span class="font-mono bg-gray-100 px-2 py-1 rounded">demo</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Contraseña:</span>
							<span class="font-mono bg-gray-100 px-2 py-1 rounded">demo123</span>
						</div>
					</div>
					<a
						href="/login"
						class="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
					>
						Probar demo
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
