<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { debounce } from '$lib/utils/debounce';

	export let placeholder = 'Buscar libros...';
	export let value = '';
	export let loading = false;
	export let suggestions: string[] = [];
	export let showSuggestions = false;

	const dispatch = createEventDispatcher<{
		search: { query: string };
		input: { query: string };
		select: { suggestion: string };
	}>();

	let inputElement: HTMLInputElement;
	let suggestionIndex = -1;

	// Debounced input handler
	const debouncedInput = debounce((query: string) => {
		dispatch('input', { query });
	}, 300);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		suggestionIndex = -1;
		debouncedInput(value);
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (value.trim()) {
			dispatch('search', { query: value.trim() });
			showSuggestions = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				suggestionIndex = Math.min(suggestionIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				suggestionIndex = Math.max(suggestionIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (suggestionIndex >= 0) {
					selectSuggestion(suggestions[suggestionIndex]);
				} else {
					handleSubmit(event);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				suggestionIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion: string) {
		value = suggestion;
		showSuggestions = false;
		suggestionIndex = -1;
		dispatch('select', { suggestion });
		dispatch('search', { query: suggestion });
	}

	function handleFocus() {
		if (suggestions.length > 0) {
			showSuggestions = true;
		}
	}

	function handleBlur() {
		// Delay hiding suggestions to allow clicking on them
		setTimeout(() => {
			showSuggestions = false;
			suggestionIndex = -1;
		}, 200);
	}

	export function focus() {
		inputElement?.focus();
	}

	export function clear() {
		value = '';
		showSuggestions = false;
		suggestionIndex = -1;
	}
</script>

<div class="relative">
	<form on:submit={handleSubmit} class="relative">
		<div class="relative">
			<input
				bind:this={inputElement}
				bind:value
				type="text"
				{placeholder}
				class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
				on:input={handleInput}
				on:keydown={handleKeydown}
				on:focus={handleFocus}
				on:blur={handleBlur}
				disabled={loading}
			/>
			
			<!-- Search Icon -->
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>

			<!-- Loading Spinner or Clear Button -->
			<div class="absolute inset-y-0 right-0 pr-3 flex items-center">
				{#if loading}
					<svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{:else if value}
					<button
						type="button"
						class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
						on:click={clear}
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Hidden submit button for form submission -->
		<button type="submit" class="sr-only">Buscar</button>
	</form>

	<!-- Suggestions Dropdown -->
	{#if showSuggestions && suggestions.length > 0}
		<div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
			{#each suggestions as suggestion, index}
				<button
					type="button"
					class="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 transition-colors duration-200 {index === suggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}"
					on:click={() => selectSuggestion(suggestion)}
				>
					<div class="flex items-center">
						<svg class="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<span class="truncate">{suggestion}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div> 