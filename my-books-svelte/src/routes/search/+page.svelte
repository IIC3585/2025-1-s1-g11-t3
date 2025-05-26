<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import BookCard from '$lib/components/BookCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface SearchResult {
		id: string;
		title: string;
		authors: string[];
		publishedDate?: string;
		description?: string;
		isbn?: string;
		pageCount?: number;
		categories?: string[];
		imageLinks?: {
			thumbnail?: string;
			smallThumbnail?: string;
		};
		language?: string;
		publisher?: string;
	}

	interface SearchResponse {
		totalItems: number;
		items: SearchResult[];
	}

	let searchQuery = '';
	let searchResults: SearchResult[] = [];
	let isLoading = false;
	let hasSearched = false;
	let totalResults = 0;
	let currentPage = 0;
	let resultsPerPage = 10;
	let addingBooks: Set<string> = new Set();

	// Popular search suggestions
	const popularSearches = [
		'Gabriel García Márquez',
		'Cien años de soledad',
		'Isabel Allende',
		'Mario Vargas Llosa',
		'Julio Cortázar',
		'Jorge Luis Borges',
		'Paulo Coelho',
		'Laura Esquivel',
		'Carlos Ruiz Zafón'
	];

	let searchSuggestions: string[] = [];
	let showSuggestions = false;

	onMount(() => {
		// Check if there's a query parameter
		const urlQuery = $page.url.searchParams.get('q');
		if (urlQuery) {
			searchQuery = urlQuery;
			performSearch(urlQuery);
		}
	});

	async function performSearch(query: string, startIndex = 0) {
		if (!query.trim()) return;

		isLoading = true;
		hasSearched = true;

		try {
			const response = await fetch(
				`/api/search?q=${encodeURIComponent(query)}&maxResults=${resultsPerPage}&startIndex=${startIndex}`
			);

			if (response.ok) {
				const data: SearchResponse = await response.json();
				
				if (startIndex === 0) {
					searchResults = data.items || [];
				} else {
					searchResults = [...searchResults, ...(data.items || [])];
				}
				
				totalResults = data.totalItems;
				currentPage = Math.floor(startIndex / resultsPerPage);
				
				// Update URL with search query
				const url = new URL(window.location.href);
				url.searchParams.set('q', query);
				window.history.replaceState({}, '', url.toString());
			} else {
				console.error('Search failed:', response.statusText);
				searchResults = [];
				totalResults = 0;
			}
		} catch (error) {
			console.error('Search error:', error);
			searchResults = [];
			totalResults = 0;
		} finally {
			isLoading = false;
		}
	}

	function handleSearch(event: CustomEvent<{ query: string }>) {
		const query = event.detail.query;
		searchQuery = query;
		currentPage = 0;
		performSearch(query);
	}

	function handleInput(event: CustomEvent<{ query: string }>) {
		const query = event.detail.query;
		
		// Generate suggestions based on popular searches
		if (query.length > 0) {
			searchSuggestions = popularSearches.filter(search =>
				search.toLowerCase().includes(query.toLowerCase())
			).slice(0, 5);
			showSuggestions = searchSuggestions.length > 0;
		} else {
			searchSuggestions = [];
			showSuggestions = false;
		}
	}

	function handleSuggestionSelect(event: CustomEvent<{ suggestion: string }>) {
		searchQuery = event.detail.suggestion;
		showSuggestions = false;
		performSearch(searchQuery);
	}

	function loadMore() {
		const nextStartIndex = (currentPage + 1) * resultsPerPage;
		performSearch(searchQuery, nextStartIndex);
	}

	async function addBookToLibrary(event: CustomEvent<{ book: SearchResult }>) {
		const book = event.detail.book;
		
		// Add to loading set
		addingBooks.add(book.id);
		addingBooks = addingBooks;

		try {
			const response = await fetch('/api/books', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					googleBooksId: book.id,
					title: book.title,
					authors: book.authors,
					isbn: book.isbn,
					publishedDate: book.publishedDate,
					description: book.description,
					coverUrl: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail,
					pageCount: book.pageCount,
					categories: book.categories,
					language: book.language,
					publisher: book.publisher,
					status: 'want_to_read'
				})
			});

			const result = await response.json();

			if (response.ok && result.success) {
				// Show success message
				alert(`¡"${book.title}" ha sido agregado a tu biblioteca!`);
			} else {
				// Handle specific errors
				if (response.status === 409) {
					alert(`"${book.title}" ya está en tu biblioteca.`);
				} else if (response.status === 401) {
					alert('Debes iniciar sesión para agregar libros a tu biblioteca.');
					goto('/login');
				} else {
					alert(result.error || 'Error al agregar el libro. Inténtalo de nuevo.');
				}
			}
			
		} catch (error) {
			console.error('Error adding book:', error);
			alert('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
		} finally {
			// Remove from loading set
			addingBooks.delete(book.id);
			addingBooks = addingBooks;
		}
	}

	function viewBookDetails(event: CustomEvent<{ book: SearchResult }>) {
		const book = event.detail.book;
		// Navigate to book details page
		goto(`/books/${book.id}`);
	}

	$: hasMoreResults = searchResults.length < totalResults;
	$: showLoadMore = hasMoreResults && !isLoading && searchResults.length > 0;
</script>

<svelte:head>
	<title>Buscar Libros - MyBooks</title>
	<meta name="description" content="Busca y descubre nuevos libros para tu biblioteca personal" />
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">
			🔍 Buscar Libros
		</h1>
		<p class="text-gray-600 max-w-2xl mx-auto">
			Descubre nuevos libros y agrégalos a tu biblioteca personal. 
			Busca por título, autor, ISBN o cualquier palabra clave.
		</p>
	</div>

	<!-- Search Box -->
	<div class="max-w-2xl mx-auto">
		<SearchBox
			bind:value={searchQuery}
			bind:suggestions={searchSuggestions}
			bind:showSuggestions
			placeholder="Buscar por título, autor, ISBN..."
			loading={isLoading}
			on:search={handleSearch}
			on:input={handleInput}
			on:select={handleSuggestionSelect}
		/>
	</div>

	<!-- Popular Searches -->
	{#if !hasSearched}
		<div class="max-w-4xl mx-auto">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Búsquedas populares</h2>
			<div class="flex flex-wrap gap-2">
				{#each popularSearches as search}
					<button
						class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
						on:click={() => {
							searchQuery = search;
							performSearch(search);
						}}
					>
						{search}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Search Results -->
	{#if hasSearched}
		<div class="max-w-6xl mx-auto">
			<!-- Results Header -->
			<div class="flex items-center justify-between mb-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">
						Resultados de búsqueda
					</h2>
					{#if totalResults > 0}
						<p class="text-gray-600 text-sm">
							{totalResults.toLocaleString()} libros encontrados para "{searchQuery}"
						</p>
					{/if}
				</div>

				{#if searchResults.length > 0}
					<div class="text-sm text-gray-500">
						Mostrando {searchResults.length} de {totalResults.toLocaleString()}
					</div>
				{/if}
			</div>

			<!-- Loading State -->
			{#if isLoading && searchResults.length === 0}
				<div class="text-center py-12">
					<svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p class="text-gray-600">Buscando libros...</p>
				</div>
			{/if}

			<!-- No Results -->
			{#if !isLoading && searchResults.length === 0 && hasSearched}
				<div class="text-center py-12">
					<svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-5.657-2.109C5.482 17.431 5.482 17.431 5.482 17.431L12 12l6.518 5.431s0 0-.001 0A7.962 7.962 0 0112 20.4z" />
					</svg>
					<h3 class="text-lg font-medium text-gray-900 mb-2">
						No se encontraron resultados
					</h3>
					<p class="text-gray-600 mb-4">
						No encontramos libros que coincidan con "{searchQuery}". 
						Intenta con otros términos de búsqueda.
					</p>
					<div class="space-y-2 text-sm text-gray-500">
						<p>💡 <strong>Consejos:</strong></p>
						<ul class="list-disc list-inside space-y-1">
							<li>Verifica la ortografía</li>
							<li>Usa términos más generales</li>
							<li>Prueba con el nombre del autor</li>
							<li>Busca por género o tema</li>
						</ul>
					</div>
				</div>
			{/if}

			<!-- Results Grid -->
			{#if searchResults.length > 0}
				<div class="space-y-4">
					{#each searchResults as book (book.id)}
						<BookCard
							{book}
							showAddButton={true}
							isAdding={addingBooks.has(book.id)}
							on:add={addBookToLibrary}
							on:view={viewBookDetails}
						/>
					{/each}
				</div>

				<!-- Load More Button -->
				{#if showLoadMore}
					<div class="text-center mt-8">
						<Button
							variant="outline"
							size="lg"
							loading={isLoading}
							on:click={loadMore}
						>
							{#if isLoading}
								Cargando más...
							{:else}
								Cargar más resultados
							{/if}
						</Button>
					</div>
				{/if}

				<!-- End of Results -->
				{#if !hasMoreResults && searchResults.length > 0}
					<div class="text-center mt-8 py-4 border-t border-gray-200">
						<p class="text-gray-500 text-sm">
							Has visto todos los resultados para "{searchQuery}"
						</p>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div> 