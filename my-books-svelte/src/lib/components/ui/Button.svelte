<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let loading = false;
	export let fullWidth = false;

	const variants = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
		secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
		danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
		ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	$: classes = [
		'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
		variants[variant],
		sizes[size],
		fullWidth ? 'w-full' : '',
		disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
		$$props.class || ''
	].filter(Boolean).join(' ');
</script>

<button
	{type}
	class={classes}
	disabled={disabled || loading}
	on:click
	{...$$restProps}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	{/if}
	<slot />
</button> 