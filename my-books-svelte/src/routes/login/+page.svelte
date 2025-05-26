<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let loading = false;
	let formData = {
		username: '',
		password: ''
	};

	// Get field-specific errors
	function getFieldError(field: string): string | null {
		return form?.errors?.find(error => error.field === field)?.message || null;
	}
</script>

<svelte:head>
	<title>Iniciar Sesión - MyBooks</title>
	<meta name="description" content="Inicia sesión en MyBooks para acceder a tu biblioteca personal" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
				<span class="text-white text-2xl">📖</span>
			</div>
			<h2 class="mt-6 text-3xl font-bold text-gray-900">Iniciar sesión</h2>
			<p class="mt-2 text-sm text-gray-600">
				¿No tienes una cuenta?
				<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
					Regístrate aquí
				</a>
			</p>
		</div>

		<!-- Login Form -->
		<form 
			method="POST" 
			class="mt-8 space-y-6"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'redirect') {
						goto(result.location);
					}
				};
			}}
		>
			<div class="space-y-4">
				<!-- Username -->
				<Input
					type="text"
					name="username"
					label="Nombre de usuario"
					bind:value={formData.username}
					placeholder="Ingresa tu nombre de usuario"
					required
					autocomplete="username"
					error={getFieldError('username')}
				/>

				<!-- Password -->
				<Input
					type="password"
					name="password"
					label="Contraseña"
					bind:value={formData.password}
					placeholder="Ingresa tu contraseña"
					required
					autocomplete="current-password"
					error={getFieldError('password')}
				/>
			</div>

			<!-- General Error Message -->
			{#if form?.error}
				<div class="rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">Error al iniciar sesión</h3>
							<p class="mt-1 text-sm text-red-700">{form.error}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Submit Button -->
			<Button
				type="submit"
				variant="primary"
				size="lg"
				fullWidth
				{loading}
				disabled={loading}
			>
				{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
			</Button>

			<!-- Forgot Password Link -->
			<div class="text-center">
				<a href="/forgot-password" class="text-sm text-blue-600 hover:text-blue-500">
					¿Olvidaste tu contraseña?
				</a>
			</div>
		</form>

		<!-- Demo Account Info -->
		<div class="mt-6 p-4 bg-blue-50 rounded-lg">
			<h3 class="text-sm font-medium text-blue-800 mb-2">Cuenta de demostración</h3>
			<p class="text-xs text-blue-700 mb-2">
				Puedes usar esta cuenta para probar la aplicación:
			</p>
			<div class="text-xs text-blue-600 space-y-1">
				<p><strong>Usuario:</strong> demo</p>
				<p><strong>Contraseña:</strong> demo123</p>
			</div>
		</div>
	</div>
</div> 