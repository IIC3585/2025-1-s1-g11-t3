<script lang="ts">
	export let rating: number = 0;
	export let maxRating: number = 5;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let readonly: boolean = false;
	export let showLabel: boolean = false;

	let hoveredRating: number = 0;

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};

	function handleStarClick(starRating: number) {
		if (!readonly) {
			rating = starRating;
		}
	}

	function handleStarHover(starRating: number) {
		if (!readonly) {
			hoveredRating = starRating;
		}
	}

	function handleMouseLeave() {
		if (!readonly) {
			hoveredRating = 0;
		}
	}

	function getStarClass(starIndex: number): string {
		const currentRating = hoveredRating || rating;
		const baseClass = `${sizeClasses[size]} transition-colors duration-150`;
		
		if (readonly) {
			return `${baseClass} ${starIndex <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`;
		}
		
		return `${baseClass} cursor-pointer hover:scale-110 transition-transform ${
			starIndex <= currentRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
		}`;
	}

	function getRatingText(rating: number): string {
		const texts = {
			1: 'Muy malo',
			2: 'Malo',
			3: 'Regular',
			4: 'Bueno',
			5: 'Excelente'
		};
		return texts[rating as keyof typeof texts] || '';
	}
</script>

<div class="flex items-center gap-1">
	<!-- Stars -->
	<div 
		class="flex items-center gap-0.5"
		on:mouseleave={handleMouseLeave}
		role="radiogroup"
		aria-label="Calificación de {rating} de {maxRating} estrellas"
	>
		{#each Array(maxRating) as _, index}
			{@const starRating = index + 1}
			<button
				type="button"
				class={getStarClass(starRating)}
				disabled={readonly}
				on:click={() => handleStarClick(starRating)}
				on:mouseenter={() => handleStarHover(starRating)}
				aria-label="Calificar con {starRating} estrella{starRating > 1 ? 's' : ''}"
				role="radio"
				aria-checked={starRating <= rating}
			>
				<svg
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
					/>
				</svg>
			</button>
		{/each}
	</div>

	<!-- Rating Label -->
	{#if showLabel && rating > 0}
		<span class="text-sm text-gray-600 ml-2">
			{rating}/{maxRating} - {getRatingText(rating)}
		</span>
	{/if}

	<!-- Numeric Rating (for screen readers) -->
	<span class="sr-only">
		Calificación: {rating} de {maxRating} estrellas
	</span>
</div> 