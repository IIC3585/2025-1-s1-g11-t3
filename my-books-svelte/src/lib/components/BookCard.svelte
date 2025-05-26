<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './ui/Button.svelte';

	export let book: {
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
	};

	export let showAddButton = true;
	export let isAdding = false;

	const dispatch = createEventDispatcher<{
		add: { book: typeof book };
		view: { book: typeof book };
	}>();

	function handleAdd() {
		dispatch('add', { book });
	}

	function handleView() {
		dispatch('view', { book });
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	function formatAuthors(authors: string[]): string {
		if (authors.length === 0) return 'Autor desconocido';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return authors.join(' y ');
		return `${authors[0]} y ${authors.length - 1} más`;
	}

	function getYear(dateString?: string): string {
		if (!dateString) return '';
		return dateString.split('-')[0];
	}

	$: coverUrl = book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail;
	$: hasDescription = book.description && book.description.length > 0;
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
	<div class="p-4">
		<div class="flex space-x-4">
			<!-- Book Cover -->
			<div class="flex-shrink-0">
				<div class="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
					{#if coverUrl}
						<img 
							src={coverUrl} 
							alt="Portada de {book.title}"
							class="w-full h-full object-cover"
							loading="lazy"
						/>
					{:else}
						<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
							<svg class="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
					{/if}
				</div>
			</div>

			<!-- Book Information -->
			<div class="flex-1 min-w-0">
				<div class="space-y-2">
					<!-- Title -->
					<h3 class="text-lg font-semibold text-gray-900 leading-tight">
						{truncateText(book.title, 80)}
					</h3>

					<!-- Authors -->
					<p class="text-sm text-gray-600">
						{formatAuthors(book.authors)}
					</p>

					<!-- Metadata -->
					<div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
						{#if book.publishedDate}
							<span class="flex items-center">
								<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
								</svg>
								{getYear(book.publishedDate)}
							</span>
						{/if}

						{#if book.pageCount}
							<span class="flex items-center">
								<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
								</svg>
								{book.pageCount}p
							</span>
						{/if}

						{#if book.publisher}
							<span class="truncate max-w-32">
								{book.publisher}
							</span>
						{/if}

						{#if book.language && book.language !== 'es'}
							<span class="uppercase font-medium">
								{book.language}
							</span>
						{/if}
					</div>

					<!-- Categories -->
					{#if book.categories && book.categories.length > 0}
						<div class="flex flex-wrap gap-1">
							{#each book.categories.slice(0, 3) as category}
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{category}
								</span>
							{/each}
							{#if book.categories.length > 3}
								<span class="text-xs text-gray-500">
									+{book.categories.length - 3} más
								</span>
							{/if}
						</div>
					{/if}

					<!-- Description Preview -->
					{#if hasDescription}
						<p class="text-sm text-gray-600 leading-relaxed">
							{truncateText(book.description || '', 150)}
						</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="mt-4 flex items-center justify-between">
			<div class="flex space-x-2">
				{#if showAddButton}
					<Button
						variant="primary"
						size="sm"
						loading={isAdding}
						on:click={handleAdd}
					>
						{#if isAdding}
							Agregando...
						{:else}
							Agregar a mi biblioteca
						{/if}
					</Button>
				{/if}

				<Button
					variant="outline"
					size="sm"
					on:click={handleView}
				>
					Ver detalles
				</Button>
			</div>

			<!-- ISBN -->
			{#if book.isbn}
				<div class="text-xs text-gray-500 font-mono">
					ISBN: {book.isbn}
				</div>
			{/if}
		</div>
	</div>
</div> 