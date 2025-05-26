<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let loading = false;
	let formData = {
		username: '',
		password: '',
		confirmPassword: '',
		age: ''
	};

	// Get field-specific errors
	function getFieldError(field: string): string | null {
		return form?.errors?.find(error => error.field === field)?.message || null;
	}

	$: hasErrors = form?.errors && form.errors.length > 0;
</script>

<svelte:head>
	<title>Registrarse - MyBooks</title>
	<meta name="description" content="Crea tu cuenta en MyBooks para gestionar tu biblioteca personal" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
				<span class="text-white text-2xl">📖</span>
			</div>
			<h2 class="mt-6 text-3xl font-bold text-gray-900">Crear cuenta</h2>
			<p class="mt-2 text-sm text-gray-600">
				¿Ya tienes una cuenta?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					Inicia sesión aquí
				</a>
			</p>
		</div>

		<!-- Registration Form -->
		<form 
			method="POST" 
			class="mt-8 space-y-6"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'redirect') {
						// Invalidar todos los datos para forzar recarga del layout
						await invalidateAll();
						// Usar window.location.href para forzar recarga completa y actualizar navbar
						window.location.href = result.location;
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
					autocomplete="new-password"
					error={getFieldError('password')}
				/>

				<!-- Confirm Password -->
				<Input
					type="password"
					name="confirmPassword"
					label="Confirmar contraseña"
					bind:value={formData.confirmPassword}
					placeholder="Confirma tu contraseña"
					required
					autocomplete="new-password"
					error={getFieldError('confirmPassword')}
				/>

				<!-- Age (Optional) -->
				<Input
					type="number"
					name="age"
					label="Edad (opcional)"
					bind:value={formData.age}
					placeholder="Ingresa tu edad"
					error={getFieldError('age')}
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
							<h3 class="text-sm font-medium text-red-800">Error al crear la cuenta</h3>
							<p class="mt-1 text-sm text-red-700">{form.error}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Success Message -->
			{#if form?.success}
				<div class="rounded-md bg-green-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-green-800">¡Cuenta creada exitosamente!</h3>
							<p class="mt-1 text-sm text-green-700">Redirigiendo al dashboard...</p>
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
				{loading ? 'Creando cuenta...' : 'Crear cuenta'}
			</Button>

			<!-- Terms and Privacy -->
			<p class="text-xs text-gray-500 text-center">
				Al crear una cuenta, aceptas nuestros
				<a href="/terms" class="text-blue-600 hover:text-blue-500">Términos de Servicio</a>
				y
				<a href="/privacy" class="text-blue-600 hover:text-blue-500">Política de Privacidad</a>
			</p>
		</form>
	</div>
</div> 