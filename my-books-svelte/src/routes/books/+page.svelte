<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: books = data.books;
	$: stats = data.stats;
	$: filters = data.filters;
	$: hasMore = data.hasMore;

	let searchQuery = filters?.search || '';
	let selectedStatus = filters?.status || '';
	let isLoading = false;

	// Status options
	const statusOptions = [
		{ value: '', label: 'Todos los libros' },
		{ value: 'want_to_read', label: 'Por leer' },
		{ value: 'reading', label: 'Leyendo' },
		{ value: 'read', label: 'Leídos' },
		{ value: 'recommended', label: 'Recomendados' },
		{ value: 'abandoned', label: 'Abandonados' }
	];

	function getStatusLabel(status: string): string {
		const option = statusOptions.find(opt => opt.value === status);
		return option ? option.label : status;
	}

	function getStatusColor(status: string): string {
		const colors = {
			'want_to_read': 'bg-blue-100 text-blue-800',
			'reading': 'bg-yellow-100 text-yellow-800',
			'read': 'bg-green-100 text-green-800',
			'recommended': 'bg-purple-100 text-purple-800',
			'abandoned': 'bg-gray-100 text-gray-800'
		};
		return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

	function applyFilters() {
		const url = new URL(window.location.href);
		
		// Update URL parameters
		if (searchQuery.trim()) {
			url.searchParams.set('search', searchQuery.trim());
		} else {
			url.searchParams.delete('search');
		}

		if (selectedStatus) {
			url.searchParams.set('status', selectedStatus);
		} else {
			url.searchParams.delete('status');
		}

		// Reset offset when applying new filters
		url.searchParams.delete('offset');

		// Navigate to updated URL
		goto(url.toString());
	}

	function clearFilters() {
		searchQuery = '';
		selectedStatus = '';
		goto('/books');
	}

	function viewBookDetails(bookId: string, googleBooksId: string) {
		// Prefer Google Books ID for details page
		goto(`/books/${googleBooksId || bookId}`);
	}

	async function updateBookStatus(userBookId: string, newStatus: string) {
		isLoading = true;
		try {
			const response = await fetch(`/api/books/${userBookId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (response.ok) {
				// Reload the page to reflect changes
				window.location.reload();
			} else {
				alert('Error al actualizar el estado del libro');
			}
		} catch (error) {
			console.error('Error updating book status:', error);
			alert('Error de conexión');
		} finally {
			isLoading = false;
		}
	}

	function getRatingStars(rating: number | null): string {
		if (!rating) return '';
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}

	function getProgressPercentage(currentPage: number | null, totalPages: number | null): number {
		if (!currentPage || !totalPages || totalPages === 0) return 0;
		return Math.min(Math.round((currentPage / totalPages) * 100), 100);
	}
</script>

<svelte:head>
	<title>Mi Biblioteca - MyBooks</title>
	<meta name="description" content="Gestiona tu biblioteca personal de libros" />
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">
				📚 Mi Biblioteca
			</h1>
			<p class="text-gray-600 mt-1">
				{stats.total} {stats.total === 1 ? 'libro' : 'libros'} en tu biblioteca
			</p>
		</div>
		
		<div class="flex gap-2">
			<Button variant="outline" on:click={() => goto('/search')}>
				🔍 Buscar más libros
			</Button>
		</div>
	</div>

	<!-- Statistics Cards -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-blue-600">{stats.want_to_read}</div>
			<div class="text-sm text-blue-700">Por leer</div>
		</div>
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-yellow-600">{stats.reading}</div>
			<div class="text-sm text-yellow-700">Leyendo</div>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-green-600">{stats.read}</div>
			<div class="text-sm text-green-700">Leídos</div>
		</div>
		<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-purple-600">{stats.recommended}</div>
			<div class="text-sm text-purple-700">Recomendados</div>
		</div>
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
			<div class="text-2xl font-bold text-gray-600">{stats.abandoned}</div>
			<div class="text-sm text-gray-700">Abandonados</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg border border-gray-200 p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1">
				<Input
					bind:value={searchQuery}
					placeholder="Buscar en mi biblioteca..."
					on:keydown={(e) => e.key === 'Enter' && applyFilters()}
				/>
			</div>
			
			<div class="sm:w-48">
				<select
					bind:value={selectedStatus}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				>
					{#each statusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-2">
				<Button variant="primary" on:click={applyFilters}>
					Filtrar
				</Button>
				{#if filters?.search || filters?.status}
					<Button variant="outline" on:click={clearFilters}>
						Limpiar
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Books Grid -->
	{#if books.length === 0}
		<div class="text-center py-12">
			{#if filters?.search || filters?.status}
				<!-- No results with filters -->
				<svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-5.657-2.109C5.482 17.431 5.482 17.431 5.482 17.431L12 12l6.518 5.431s0 0-.001 0A7.962 7.962 0 0112 20.4z" />
				</svg>
				<h3 class="text-lg font-medium text-gray-900 mb-2">
					No se encontraron libros
				</h3>
				<p class="text-gray-600 mb-4">
					No hay libros que coincidan con los filtros aplicados.
				</p>
				<Button variant="outline" on:click={clearFilters}>
					Limpiar filtros
				</Button>
			{:else}
				<!-- Empty library -->
				<svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				<h3 class="text-lg font-medium text-gray-900 mb-2">
					Tu biblioteca está vacía
				</h3>
				<p class="text-gray-600 mb-4">
					¡Comienza agregando algunos libros a tu biblioteca personal!
				</p>
				<Button variant="primary" on:click={() => goto('/search')}>
					🔍 Buscar libros
				</Button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each books as book (book.userBookId)}
				<div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
					<!-- Book Cover -->
					<div class="aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
						{#if book.coverUrl}
							<img 
								src={book.coverUrl} 
								alt="Portada de {book.title}"
								class="w-full h-full object-cover cursor-pointer"
								on:click={() => viewBookDetails(book.bookId, book.googleBooksId)}
							/>
						{:else}
							<div 
								class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 cursor-pointer"
								on:click={() => viewBookDetails(book.bookId, book.googleBooksId)}
							>
								<svg class="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
						{/if}
					</div>

					<!-- Book Info -->
					<div class="p-4 space-y-3">
						<!-- Title and Author -->
						<div>
							<h3 
								class="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
								on:click={() => viewBookDetails(book.bookId, book.googleBooksId)}
							>
								{book.title}
							</h3>
							<p class="text-sm text-gray-600 line-clamp-1">
								{book.author}
							</p>
						</div>

						<!-- Status Badge -->
						<div class="flex items-center justify-between">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(book.status)}">
								{getStatusLabel(book.status)}
							</span>
							
							{#if book.rating}
								<div class="text-sm text-yellow-500" title="Tu calificación: {book.rating}/5">
									{getRatingStars(book.rating)}
								</div>
							{/if}
						</div>

						<!-- Progress Bar (for reading books) -->
						{#if book.status === 'reading' && book.currentPage && book.pages}
							{@const progress = getProgressPercentage(book.currentPage, book.pages)}
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
								<div class="text-xs text-gray-500">
									Página {book.currentPage} de {book.pages}
								</div>
							</div>
						{/if}

						<!-- Dates -->
						<div class="text-xs text-gray-500 space-y-1">
							{#if book.startDate}
								<div>Iniciado: {formatDate(book.startDate)}</div>
							{/if}
							{#if book.finishDate}
								<div>Terminado: {formatDate(book.finishDate)}</div>
							{/if}
							<div>Agregado: {formatDate(book.createdAt)}</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 pt-2">
							<Button 
								variant="outline" 
								size="sm" 
								class="flex-1"
								on:click={() => viewBookDetails(book.bookId, book.googleBooksId)}
							>
								Ver detalles
							</Button>
							
							<!-- Quick status change -->
							<div class="relative">
								<select
									value={book.status}
									on:change={(e) => updateBookStatus(book.userBookId, e.target.value)}
									disabled={isLoading}
									class="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
								>
									<option value="want_to_read">Por leer</option>
									<option value="reading">Leyendo</option>
									<option value="read">Leído</option>
									<option value="recommended">Recomendado</option>
									<option value="abandoned">Abandonado</option>
								</select>
							</div>
						</div>

						<!-- Personal Notes Preview -->
						{#if book.personalNotes}
							<div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
								<strong>Notas:</strong> 
								<span class="line-clamp-2">{book.personalNotes}</span>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Load More -->
		{#if hasMore}
			<div class="text-center">
				<Button variant="outline" on:click={() => {
					const url = new URL(window.location.href);
					url.searchParams.set('offset', String(books.length));
					goto(url.toString());
				}}>
					Cargar más libros
				</Button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style> 