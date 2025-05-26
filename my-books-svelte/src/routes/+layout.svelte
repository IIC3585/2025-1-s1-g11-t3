<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: user = data.user;

	// Navigation items for authenticated users
	const authNavItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/books', label: 'Mi Biblioteca', icon: '📚' },
		{ href: '/search', label: 'Buscar Libros', icon: '🔍' },
		{ href: '/goals', label: 'Metas', icon: '🎯' },
		{ href: '/stats', label: 'Estadísticas', icon: '📈' }
	];

	// Navigation items for non-authenticated users
	const publicNavItems = [
		{ href: '/', label: 'Inicio', icon: '🏠' },
		{ href: '/login', label: 'Iniciar Sesión', icon: '🔑' },
		{ href: '/register', label: 'Registrarse', icon: '📝' }
	];

	$: navItems = user ? authNavItems : publicNavItems;

	function isActive(href: string): boolean {
		if (!$page?.url?.pathname) return false;
		
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

	let isLoggingOut = false;

	async function handleLogout() {
		if (isLoggingOut) return; // Prevenir múltiples clics
		
		isLoggingOut = true;
		
		try {
			const response = await fetch('/logout', { 
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (response.ok) {
				const result = await response.json();
				console.log('Logout successful:', result.message);
				
				// Forzar recarga completa de la página para limpiar el estado
				window.location.href = '/';
			} else {
				const error = await response.json();
				console.error('Logout failed:', error.error);
				alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
			}
		} catch (error) {
			console.error('Logout error:', error);
			alert('Error de conexión. Por favor, intenta de nuevo.');
		} finally {
			isLoggingOut = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation Header -->
	<nav class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<!-- Logo and Brand -->
				<div class="flex items-center">
					<a href={user ? '/dashboard' : '/'} class="flex items-center space-x-2">
						<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span class="text-white font-bold text-lg">📖</span>
						</div>
						<span class="text-xl font-bold text-gray-900">MyBooks</span>
					</a>
				</div>

				<!-- Navigation Links -->
				<div class="hidden md:flex items-center space-x-8">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {isActive(item.href)
								? 'bg-blue-100 text-blue-700'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
						>
							<span>{item.icon}</span>
							<span>{item.label}</span>
						</a>
					{/each}
				</div>

				<!-- User Menu -->
				<div class="flex items-center space-x-4">
					{#if user}
						<!-- User Profile Menu -->
						<div class="relative flex items-center space-x-3">
							<span class="text-sm text-gray-700">Hola, {user.username}</span>
							<button
								on:click={handleLogout}
								disabled={isLoggingOut}
								class="text-gray-600 hover:text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
							>
								{#if isLoggingOut}
									<span class="flex items-center space-x-1">
										<svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>Cerrando...</span>
									</span>
								{:else}
									Cerrar Sesión
								{/if}
							</button>
						</div>
					{:else}
						<!-- Login/Register buttons for non-authenticated users -->
						<div class="flex items-center space-x-2">
							<a
								href="/login"
								class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
							>
								Iniciar Sesión
							</a>
							<a
								href="/register"
								class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
							>
								Registrarse
							</a>
						</div>
					{/if}
				</div>

				<!-- Mobile menu button -->
				<div class="md:hidden flex items-center">
					<button
						type="button"
						class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
						aria-label="Abrir menú"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Navigation -->
		<div class="md:hidden border-t border-gray-200 bg-white">
			<div class="px-2 pt-2 pb-3 space-y-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {isActive(item.href)
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}"
					>
						<span>{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
				
				{#if user}
					<button
						on:click={handleLogout}
						disabled={isLoggingOut}
						class="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
					>
						{#if isLoggingOut}
							<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Cerrando sesión...</span>
						{:else}
							<span>🚪</span>
							<span>Cerrar Sesión</span>
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-12">
		<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<div class="text-center text-sm text-gray-500">
				<p>&copy; 2025 MyBooks. Gestiona tu biblioteca personal con estilo.</p>
			</div>
		</div>
	</footer>
</div>
