<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: overview = data.overview;
	$: distributions = data.distributions;
	$: activity = data.activity;
	$: achievements = data.achievements;
	$: recentBooks = data.recentBooks;
	$: currentlyReading = data.currentlyReading;

	function getStatusColor(status: string): string {
		const colors = {
			'want_to_read': 'bg-blue-500',
			'reading': 'bg-yellow-500',
			'read': 'bg-green-500',
			'recommended': 'bg-purple-500',
			'abandoned': 'bg-gray-500'
		};
		return colors[status as keyof typeof colors] || 'bg-gray-500';
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return '';
		}
	}

	function getProgressPercentage(currentPage: number | null, totalPages: number | null): number {
		if (!currentPage || !totalPages || totalPages === 0) return 0;
		return Math.min(Math.round((currentPage / totalPages) * 100), 100);
	}

	function getRatingStars(rating: number | null): string {
		if (!rating) return '';
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}

	// Calculate percentages for status distribution
	$: statusDistribution = [
		{ status: 'read', count: overview.readBooks, label: 'Leídos', color: 'bg-green-500' },
		{ status: 'reading', count: overview.readingBooks, label: 'Leyendo', color: 'bg-yellow-500' },
		{ status: 'want_to_read', count: overview.wantToReadBooks, label: 'Por leer', color: 'bg-blue-500' },
		{ status: 'recommended', count: overview.recommendedBooks, label: 'Recomendados', color: 'bg-purple-500' },
		{ status: 'abandoned', count: overview.abandonedBooks, label: 'Abandonados', color: 'bg-gray-500' }
	].filter(item => item.count > 0);

	$: maxRatingCount = Math.max(...distributions.ratingDistribution.map(r => r.count), 1);
	$: maxGenreCount = Math.max(...distributions.topGenres.map(g => g.count), 1);
	$: maxAuthorCount = Math.max(...distributions.topAuthors.map(a => a.count), 1);
	$: maxMonthlyActivity = Math.max(...activity.monthlyActivity.map(m => Math.max(m.booksFinished, m.booksAdded)), 1);
</script>

<svelte:head>
	<title>Estadísticas - MyBooks</title>
	<meta name="description" content="Estadísticas detalladas de tu actividad de lectura" />
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">
			📊 Estadísticas de Lectura
		</h1>
		<p class="text-gray-600 max-w-2xl mx-auto">
			Descubre patrones en tu actividad de lectura y celebra tus logros literarios
		</p>
	</div>

	<!-- Overview Cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-blue-600">{overview.totalBooks}</div>
			<div class="text-sm text-gray-600">Total libros</div>
		</div>
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-green-600">{overview.readBooks}</div>
			<div class="text-sm text-gray-600">Leídos</div>
		</div>
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-yellow-600">{overview.readingBooks}</div>
			<div class="text-sm text-gray-600">Leyendo</div>
		</div>
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-purple-600">{overview.totalPagesRead.toLocaleString()}</div>
			<div class="text-sm text-gray-600">Páginas leídas</div>
		</div>
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-indigo-600">{overview.averagePagesPerBook}</div>
			<div class="text-sm text-gray-600">Páginas promedio</div>
		</div>
		<div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
			<div class="text-2xl font-bold text-yellow-500">{overview.averageRating}⭐</div>
			<div class="text-sm text-gray-600">Calificación promedio</div>
		</div>
	</div>

	<!-- Status Distribution -->
	{#if statusDistribution.length > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Distribución por Estado</h2>
			<div class="space-y-3">
				{#each statusDistribution as item}
					{@const percentage = overview.totalBooks > 0 ? Math.round((item.count / overview.totalBooks) * 100) : 0}
					<div class="flex items-center space-x-3">
						<div class="w-24 text-sm text-gray-600">{item.label}</div>
						<div class="flex-1 bg-gray-200 rounded-full h-4 relative">
							<div 
								class="{item.color} h-4 rounded-full transition-all duration-500" 
								style="width: {percentage}%"
							></div>
							<div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
								{item.count} ({percentage}%)
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Charts Row -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Rating Distribution -->
		{#if distributions.ratingDistribution.some(r => r.count > 0)}
			<div class="bg-white rounded-lg border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Distribución de Calificaciones</h2>
				<div class="space-y-3">
					{#each distributions.ratingDistribution as rating}
						{@const percentage = maxRatingCount > 0 ? (rating.count / maxRatingCount) * 100 : 0}
						<div class="flex items-center space-x-3">
							<div class="w-8 text-sm text-gray-600">{rating.rating}⭐</div>
							<div class="flex-1 bg-gray-200 rounded-full h-3">
								<div 
									class="bg-yellow-500 h-3 rounded-full transition-all duration-500" 
									style="width: {percentage}%"
								></div>
							</div>
							<div class="w-8 text-sm text-gray-600 text-right">{rating.count}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Top Genres -->
		{#if distributions.topGenres.length > 0}
			<div class="bg-white rounded-lg border border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Géneros Favoritos</h2>
				<div class="space-y-3">
					{#each distributions.topGenres as genre}
						{@const percentage = maxGenreCount > 0 ? (genre.count / maxGenreCount) * 100 : 0}
						<div class="flex items-center space-x-3">
							<div class="w-20 text-sm text-gray-600 truncate" title={genre.genre}>{genre.genre}</div>
							<div class="flex-1 bg-gray-200 rounded-full h-3">
								<div 
									class="bg-blue-500 h-3 rounded-full transition-all duration-500" 
									style="width: {percentage}%"
								></div>
							</div>
							<div class="w-8 text-sm text-gray-600 text-right">{genre.count}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Top Authors -->
	{#if distributions.topAuthors.length > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Autores Favoritos</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each distributions.topAuthors as author}
					<div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
						<div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
							<span class="text-purple-600 font-semibold">✍️</span>
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-medium text-gray-900 truncate" title={author.author}>
								{author.author}
							</div>
							<div class="text-sm text-gray-600">
								{author.count} {author.count === 1 ? 'libro' : 'libros'}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Monthly Activity -->
	{#if activity.monthlyActivity.some(m => m.booksFinished > 0 || m.booksAdded > 0)}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Actividad Mensual (Últimos 12 meses)</h2>
			<div class="space-y-4">
				<div class="flex space-x-4 text-sm">
					<div class="flex items-center space-x-2">
						<div class="w-3 h-3 bg-green-500 rounded"></div>
						<span>Libros terminados</span>
					</div>
					<div class="flex items-center space-x-2">
						<div class="w-3 h-3 bg-blue-500 rounded"></div>
						<span>Libros agregados</span>
					</div>
				</div>
				<div class="grid grid-cols-12 gap-2">
					{#each activity.monthlyActivity as month}
						<div class="text-center">
							<div class="text-xs text-gray-600 mb-2 transform -rotate-45 origin-bottom-left">
								{month.month}
							</div>
							<div class="space-y-1">
								<div 
									class="bg-green-500 rounded-t" 
									style="height: {maxMonthlyActivity > 0 ? Math.max((month.booksFinished / maxMonthlyActivity) * 60, 2) : 2}px"
									title="Terminados: {month.booksFinished}"
								></div>
								<div 
									class="bg-blue-500 rounded-b" 
									style="height: {maxMonthlyActivity > 0 ? Math.max((month.booksAdded / maxMonthlyActivity) * 60, 2) : 2}px"
									title="Agregados: {month.booksAdded}"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Reading Streaks -->
	{#if activity.longestStreak > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Rachas de Lectura</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="text-center p-4 bg-orange-50 rounded-lg">
					<div class="text-3xl font-bold text-orange-600">{activity.currentStreak}</div>
					<div class="text-sm text-orange-700">Racha actual</div>
					<div class="text-xs text-gray-600 mt-1">días consecutivos</div>
				</div>
				<div class="text-center p-4 bg-red-50 rounded-lg">
					<div class="text-3xl font-bold text-red-600">{activity.longestStreak}</div>
					<div class="text-sm text-red-700">Racha más larga</div>
					<div class="text-xs text-gray-600 mt-1">días consecutivos</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Achievements -->
	{#if achievements.length > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">🏆 Logros Desbloqueados</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each achievements as achievement}
					<div class="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
						<div class="text-2xl">{achievement.icon}</div>
						<div>
							<div class="font-semibold text-gray-900">{achievement.title}</div>
							<div class="text-sm text-gray-600">{achievement.description}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Currently Reading -->
	{#if currentlyReading.length > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">📖 Leyendo Actualmente</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each currentlyReading as book}
					{@const progress = getProgressPercentage(book.currentPage, book.pages)}
					<div class="border border-gray-200 rounded-lg p-4">
						<h3 class="font-medium text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
						<p class="text-sm text-gray-600 mb-3">{book.author}</p>
						{#if progress > 0}
							<div class="space-y-1">
								<div class="flex justify-between text-xs text-gray-600">
									<span>Progreso</span>
									<span>{progress}%</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div 
										class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
										style="width: {progress}%"
									></div>
								</div>
								{#if book.currentPage && book.pages}
									<div class="text-xs text-gray-500">
										Página {book.currentPage} de {book.pages}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent Books -->
	{#if recentBooks.length > 0}
		<div class="bg-white rounded-lg border border-gray-200 p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">📚 Libros Recientes</h2>
			<div class="space-y-3">
				{#each recentBooks as book}
					<div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
						<div class="flex-1">
							<h3 class="font-medium text-gray-900">{book.title}</h3>
							<p class="text-sm text-gray-600">{book.author}</p>
						</div>
						<div class="text-right">
							{#if book.rating}
								<div class="text-sm text-yellow-500 mb-1">
									{getRatingStars(book.rating)}
								</div>
							{/if}
							<div class="text-xs text-gray-500">
								{formatDate(book.finishDate)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Empty State -->
	{#if overview.totalBooks === 0}
		<div class="text-center py-12">
			<svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
			<h3 class="text-lg font-medium text-gray-900 mb-2">
				No hay estadísticas disponibles
			</h3>
			<p class="text-gray-600 mb-4">
				Comienza agregando libros a tu biblioteca para ver estadísticas detalladas de tu actividad de lectura.
			</p>
			<Button variant="primary" on:click={() => goto('/search')}>
				🔍 Buscar libros
			</Button>
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="flex justify-center space-x-4">
		<Button variant="outline" on:click={() => goto('/books')}>
			📚 Ver Mi Biblioteca
		</Button>
		<Button variant="outline" on:click={() => goto('/search')}>
			🔍 Buscar Más Libros
		</Button>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style> 