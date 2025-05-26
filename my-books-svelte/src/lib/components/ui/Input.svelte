<script lang="ts">
	export let type: 'text' | 'email' | 'password' | 'number' = 'text';
	export let name: string;
	export let label: string;
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let error: string | null = null;
	export let autocomplete: string | undefined = undefined;

	let inputElement: HTMLInputElement;

	export function focus() {
		inputElement?.focus();
	}

	$: hasError = !!error;
	$: inputClasses = [
		'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors duration-200',
		hasError 
			? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
			: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
		disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'
	].join(' ');
</script>

<div class="space-y-1">
	<label for={name} class="block text-sm font-medium text-gray-700">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>
	
	<input
		bind:this={inputElement}
		bind:value
		{type}
		{name}
		id={name}
		class={inputClasses}
		{placeholder}
		{required}
		{disabled}
		{autocomplete}
		aria-invalid={hasError}
		aria-describedby={hasError ? `${name}-error` : undefined}
		on:input
		on:blur
		on:focus
		{...$$restProps}
	/>
	
	{#if error}
		<p id="{name}-error" class="text-sm text-red-600" role="alert">
			{error}
		</p>
	{/if}
</div> 