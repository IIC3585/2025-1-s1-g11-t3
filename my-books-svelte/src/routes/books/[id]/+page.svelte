<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: book = data.book;
	$: coverUrl = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail;

	let isAddingToLibrary = false;

	function formatAuthors(authors: string[]): string {
		if (authors.length === 0) return 'Autor desconocido';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return authors.join(' y ');
		return `${authors.slice(0, -1).join(', ')} y ${authors[authors.length - 1]}`;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		
		// Handle different date formats from Google Books
		if (dateString.length === 4) {
			return dateString; // Just year
		}
		
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateString; // Return as-is if parsing fails
		}
	}

	function getLanguageName(code: string): string {
		const languages: Record<string, string> = {
			'es': 'Español',
			'en': 'Inglés',
			'fr': 'Francés',
			'de': 'Alemán',
			'it': 'Italiano',
			'pt': 'Portugués',
			'ca': 'Catalán',
			'eu': 'Euskera',
			'gl': 'Gallego'
		};
		return languages[code] || code.toUpperCase();
	}

	function stripHtmlTags(html: string): string {
		return html.replace(/<[^>]*>/g, '');
	}

	async function addToLibrary() {
		isAddingToLibrary = true;
		
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
					coverUrl: coverUrl,
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
				
				// Optionally redirect to library or show success state
				// goto('/books');
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
			isAddingToLibrary = false;
		}
	}

	function goBack() {
		// Check if we came from search
		if (document.referrer.includes('/search')) {
			goto('/search');
		} else {
			// Go back in history or to dashboard
			window.history.back();
		}
	}

	function openPreview() {
		if (book.previewLink) {
			window.open(book.previewLink, '_blank');
		}
	}

	function openGoogleBooks() {
		if (book.infoLink) {
			window.open(book.infoLink, '_blank');
		}
	}
</script>

<svelte:head>
	<title>{book.title} - MyBooks</title>
	<meta name="description" content="Detalles de {book.title} por {formatAuthors(book.authors)}" />
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6">
	<!-- Back Button -->
	<div class="flex items-center space-x-4">
		<Button variant="outline" size="sm" on:click={goBack}>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Volver
		</Button>
		
		<nav class="text-sm text-gray-500">
			<a href="/search" class="hover:text-gray-700">Búsqueda</a>
			<span class="mx-2">›</span>
			<span class="text-gray-900 font-medium">Detalles del libro</span>
		</nav>
	</div>

	<!-- Main Content -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
		<div class="p-6 lg:p-8">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Book Cover -->
				<div class="lg:col-span-1">
					<div class="sticky top-6">
						<div class="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg mb-4">
							{#if coverUrl}
								<img 
									src={coverUrl} 
									alt="Portada de {book.title}"
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
									<svg class="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								</div>
							{/if}
						</div>

						<!-- Action Buttons -->
						<div class="space-y-3">
							<Button 
								variant="primary" 
								size="lg" 
								class="w-full"
								loading={isAddingToLibrary}
								on:click={addToLibrary}
							>
								{#if isAddingToLibrary}
									Agregando a biblioteca...
								{:else}
									📚 Agregar a mi biblioteca
								{/if}
							</Button>

							{#if book.previewLink}
								<Button 
									variant="outline" 
									size="lg" 
									class="w-full"
									on:click={openPreview}
								>
									👁️ Vista previa
								</Button>
							{/if}

							{#if book.infoLink}
								<Button 
									variant="outline" 
									size="lg" 
									class="w-full"
									on:click={openGoogleBooks}
								>
									🔗 Ver en Google Books
								</Button>
							{/if}
						</div>
					</div>
				</div>

				<!-- Book Information -->
				<div class="lg:col-span-2 space-y-6">
					<!-- Title and Authors -->
					<div>
						<h1 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
							{book.title}
						</h1>
						
						{#if book.subtitle}
							<h2 class="text-xl text-gray-600 mb-4">
								{book.subtitle}
							</h2>
						{/if}

						<p class="text-lg text-gray-700 font-medium">
							por {formatAuthors(book.authors)}
						</p>
					</div>

					<!-- Rating -->
					{#if book.averageRating > 0}
						<div class="flex items-center space-x-2">
							<div class="flex items-center">
								{#each Array(5) as _, i}
									<svg 
										class="w-5 h-5 {i < Math.floor(book.averageRating) ? 'text-yellow-400' : 'text-gray-300'}" 
										fill="currentColor" 
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								{/each}
							</div>
							<span class="text-gray-600">
								{book.averageRating.toFixed(1)} ({book.ratingsCount.toLocaleString()} reseñas)
							</span>
						</div>
					{/if}

					<!-- Book Details Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
						{#if book.publishedDate}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">Fecha de publicación</span>
									<p class="font-medium">{formatDate(book.publishedDate)}</p>
								</div>
							</div>
						{/if}

						{#if book.pageCount > 0}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">Páginas</span>
									<p class="font-medium">{book.pageCount.toLocaleString()}</p>
								</div>
							</div>
						{/if}

						{#if book.publisher}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">Editorial</span>
									<p class="font-medium">{book.publisher}</p>
								</div>
							</div>
						{/if}

						{#if book.language}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clip-rule="evenodd" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">Idioma</span>
									<p class="font-medium">{getLanguageName(book.language)}</p>
								</div>
							</div>
						{/if}

						{#if book.isbn}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">ISBN</span>
									<p class="font-medium font-mono">{book.isbn}</p>
								</div>
							</div>
						{/if}

						{#if book.printType}
							<div class="flex items-center space-x-2">
								<svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 01-1 1H8a1 1 0 110-2h4a1 1 0 011 1zm-1 4a1 1 0 100-2H8a1 1 0 100 2h4z" clip-rule="evenodd" />
								</svg>
								<div>
									<span class="text-sm text-gray-500">Tipo</span>
									<p class="font-medium">{book.printType === 'BOOK' ? 'Libro' : book.printType}</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Categories -->
					{#if book.categories && book.categories.length > 0}
						<div>
							<h3 class="text-lg font-semibold text-gray-900 mb-3">Categorías</h3>
							<div class="flex flex-wrap gap-2">
								{#each book.categories as category}
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
										{category}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Description -->
					{#if book.description}
						<div>
							<h3 class="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
							<div class="prose prose-gray max-w-none">
								{#if book.description.includes('<')}
									{@html book.description}
								{:else}
									<p class="text-gray-700 leading-relaxed whitespace-pre-line">{book.description}</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.7;
	}
	
	:global(.prose strong) {
		font-weight: 600;
	}
	
	:global(.prose em) {
		font-style: italic;
	}
</style> 