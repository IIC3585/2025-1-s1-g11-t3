<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: user = data.user;
	$: stats = data.stats;
	$: recentBooks = data.recentBooks;
</script>

<svelte:head>
	<title>Dashboard - MyBooks</title>
	<meta name="description" content="Tu dashboard personal de MyBooks" />
</svelte:head>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<div class="flex items-center space-x-4">
			<div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
				<span class="text-white text-2xl">👤</span>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">
					¡Bienvenido, {user.username}! 🎉
				</h1>
				<p class="text-gray-600">
					Tu biblioteca personal te está esperando
				</p>
			</div>
		</div>
	</div>

	<!-- User Info Card -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Información de tu cuenta</h2>
		<div class="space-y-3">
			<div class="flex justify-between">
				<span class="text-gray-600">ID de usuario:</span>
				<span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">Nombre de usuario:</span>
				<span class="font-medium">{user.username}</span>
			</div>
			{#if user.age}
				<div class="flex justify-between">
					<span class="text-gray-600">Edad:</span>
					<span class="font-medium">{user.age} años</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Stats Preview -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas de tu biblioteca</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div class="text-center">
				<div class="text-2xl font-bold text-blue-600">{stats.totalBooks}</div>
				<div class="text-sm text-gray-600">Libros totales</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-green-600">{stats.booksRead}</div>
				<div class="text-sm text-gray-600">Libros leídos</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-yellow-600">{stats.booksReading}</div>
				<div class="text-sm text-gray-600">Leyendo ahora</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-purple-600">{stats.booksWantToRead}</div>
				<div class="text-sm text-gray-600">Por leer</div>
			</div>
		</div>
		
		{#if stats.averageRating > 0 || stats.totalPages > 0}
			<div class="mt-6 pt-6 border-t border-gray-200">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#if stats.averageRating > 0}
						<div class="text-center">
							<div class="text-2xl font-bold text-yellow-500">{stats.averageRating.toFixed(1)} ⭐</div>
							<div class="text-sm text-gray-600">Calificación promedio</div>
						</div>
					{/if}
					{#if stats.totalPages > 0}
						<div class="text-center">
							<div class="text-2xl font-bold text-indigo-600">{stats.totalPages.toLocaleString()}</div>
							<div class="text-sm text-gray-600">Páginas leídas</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		
		<div class="mt-4 text-center">
			<a href="/stats" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
				Ver estadísticas completas →
			</a>
		</div>
	</div>

	<!-- Recent Books -->
	{#if recentBooks.length > 0}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Libros recientes</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each recentBooks as userBook}
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
						<div class="flex space-x-3">
							{#if userBook.book.coverUrl}
								<img 
									src={userBook.book.coverUrl} 
									alt={userBook.book.title}
									class="w-12 h-16 object-cover rounded"
								/>
							{:else}
								<div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
									<span class="text-gray-400 text-xs">📖</span>
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<h3 class="font-medium text-gray-900 truncate">{userBook.book.title}</h3>
								<p class="text-sm text-gray-600 truncate">{userBook.book.author}</p>
								<div class="mt-1 flex items-center space-x-2">
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
										{userBook.status === 'read' ? 'bg-green-100 text-green-800' :
										 userBook.status === 'reading' ? 'bg-yellow-100 text-yellow-800' :
										 userBook.status === 'want_to_read' ? 'bg-blue-100 text-blue-800' :
										 userBook.status === 'recommended' ? 'bg-purple-100 text-purple-800' :
										 'bg-gray-100 text-gray-800'}">
										{userBook.status === 'read' ? 'Leído' :
										 userBook.status === 'reading' ? 'Leyendo' :
										 userBook.status === 'want_to_read' ? 'Por leer' :
										 userBook.status === 'recommended' ? 'Recomendado' :
										 'Abandonado'}
									</span>
									{#if userBook.rating}
										<span class="text-yellow-500 text-sm">
											{'⭐'.repeat(userBook.rating)}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-4 text-center">
				<a href="/books" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
					Ver toda la biblioteca →
				</a>
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Search Books -->
		<a
			href="/search"
			class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
		>
			<div class="flex items-center space-x-4">
				<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
					<span class="text-2xl">🔍</span>
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">Buscar Libros</h3>
					<p class="text-sm text-gray-600">Encuentra nuevos libros para leer</p>
				</div>
			</div>
		</a>

		<!-- My Library -->
		<a
			href="/books"
			class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
		>
			<div class="flex items-center space-x-4">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
					<span class="text-2xl">📚</span>
				</div>
				<div>
					<h3 class="font-semibold text-gray-900">Mi Biblioteca</h3>
					<p class="text-sm text-gray-600">Ve todos tus libros guardados</p>
				</div>
			</div>
		</a>
	</div>

	<!-- Getting Started -->
	{#if stats.totalBooks === 0}
		<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
			<h2 class="text-lg font-semibold text-blue-900 mb-2">🚀 ¡Comienza tu viaje literario!</h2>
			<p class="text-blue-800 mb-4">
				Tu biblioteca está vacía, pero eso está a punto de cambiar. Aquí tienes algunas ideas para empezar:
			</p>
			<div class="space-y-2 text-sm text-blue-700">
				<div class="flex items-center space-x-2">
					<span>🔍</span>
					<span>Busca tu libro favorito de todos los tiempos</span>
				</div>
				<div class="flex items-center space-x-2">
					<span>📖</span>
					<span>Encuentra ese libro que siempre quisiste leer</span>
				</div>
				<div class="flex items-center space-x-2">
					<span>⭐</span>
					<span>Califica los libros que ya has leído</span>
				</div>
				<div class="flex items-center space-x-2">
					<span>📝</span>
					<span>Escribe notas sobre tus lecturas</span>
				</div>
			</div>
			<div class="mt-4">
				<a 
					href="/search" 
					class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
				>
					🔍 Buscar libros
				</a>
			</div>
		</div>
	{/if}
</div> 