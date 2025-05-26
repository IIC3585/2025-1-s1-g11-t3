<script lang="ts">
	import type { PageData } from './$types';
	import type { ReadingGoalProgress, ReadingGoalFormData } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;

	let goalProgress: ReadingGoalProgress | null = data.goalProgress;
	let showCreateForm = false;
	let showEditForm = false;
	let loading = false;
	let toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

	// Form data
	let formData: ReadingGoalFormData = {
		year: data.currentYear,
		targetBooks: 12,
		targetPages: undefined,
		description: ''
	};

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { show: true, message, type };
		setTimeout(() => {
			toast.show = false;
		}, 3000);
	}

	async function createGoal() {
		loading = true;
		try {
			const response = await fetch('/api/goals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (response.ok) {
				showToast('Meta de lectura creada exitosamente');
				showCreateForm = false;
				await invalidateAll();
				// Recargar datos
				const goalResponse = await fetch(`/api/goals?year=${formData.year}`);
				const goalData = await goalResponse.json();
				goalProgress = goalData.progress;
			} else {
				showToast(result.error || 'Error al crear la meta', 'error');
			}
		} catch (error) {
			showToast('Error de conexión', 'error');
		} finally {
			loading = false;
		}
	}

	async function updateGoal() {
		if (!goalProgress) return;
		
		loading = true;
		try {
			const response = await fetch('/api/goals', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: goalProgress.goal.id,
					...formData
				})
			});

			const result = await response.json();

			if (response.ok) {
				showToast('Meta actualizada exitosamente');
				showEditForm = false;
				await invalidateAll();
				// Recargar datos
				const goalResponse = await fetch(`/api/goals?year=${formData.year}`);
				const goalData = await goalResponse.json();
				goalProgress = goalData.progress;
			} else {
				showToast(result.error || 'Error al actualizar la meta', 'error');
			}
		} catch (error) {
			showToast('Error de conexión', 'error');
		} finally {
			loading = false;
		}
	}

	async function deleteGoal() {
		if (!goalProgress || !confirm('¿Estás seguro de que quieres eliminar esta meta?')) return;
		
		loading = true;
		try {
			const response = await fetch(`/api/goals?id=${goalProgress.goal.id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (response.ok) {
				showToast('Meta eliminada exitosamente');
				goalProgress = null;
				await invalidateAll();
			} else {
				showToast(result.error || 'Error al eliminar la meta', 'error');
			}
		} catch (error) {
			showToast('Error de conexión', 'error');
		} finally {
			loading = false;
		}
	}

	function startEdit() {
		if (!goalProgress) return;
		formData = {
			year: goalProgress.goal.year,
			targetBooks: goalProgress.goal.targetBooks,
			targetPages: goalProgress.goal.targetPages || undefined,
			description: goalProgress.goal.description || ''
		};
		showEditForm = true;
	}

	function getProgressColor(progress: number): string {
		if (progress >= 100) return 'bg-green-500';
		if (progress >= 75) return 'bg-blue-500';
		if (progress >= 50) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	function getStatusMessage(progress: ReadingGoalProgress): string {
		if (progress.isOnTrack) {
			return '🎯 ¡Vas por buen camino!';
		} else {
			const booksNeeded = Math.ceil(progress.booksRemaining / (progress.daysRemaining / 30.44));
			return `📈 Necesitas leer ${booksNeeded} libros por mes para alcanzar tu meta`;
		}
	}
</script>

<svelte:head>
	<title>Metas de Lectura - MyBooks</title>
	<meta name="description" content="Establece y sigue tus metas de lectura anuales" />
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">🎯 Metas de Lectura</h1>
				<p class="text-gray-600 mt-1">
					Establece objetivos y sigue tu progreso de lectura
				</p>
			</div>
			{#if !goalProgress && !showCreateForm}
				<Button 
					on:click={() => showCreateForm = true}
					variant="primary"
				>
					📝 Crear Meta {data.currentYear}
				</Button>
			{/if}
		</div>
	</div>

	<!-- Create Goal Form -->
	{#if showCreateForm}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Crear Meta de Lectura {data.currentYear}</h2>
			
			<form on:submit|preventDefault={createGoal} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="Meta de libros"
						type="number"
						bind:value={formData.targetBooks}
						min="1"
						max="365"
						required
						placeholder="ej: 24"
					/>
					<Input
						label="Meta de páginas (opcional)"
						type="number"
						bind:value={formData.targetPages}
						min="1"
						placeholder="ej: 8000"
					/>
				</div>
				
				<Input
					label="Descripción (opcional)"
					bind:value={formData.description}
					placeholder="ej: Leer más clásicos de la literatura"
				/>

				<div class="flex space-x-3">
					<Button type="submit" variant="primary" {loading}>
						{loading ? 'Creando...' : 'Crear Meta'}
					</Button>
					<Button 
						type="button" 
						variant="secondary" 
						on:click={() => showCreateForm = false}
					>
						Cancelar
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Edit Goal Form -->
	{#if showEditForm && goalProgress}
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Editar Meta de Lectura</h2>
			
			<form on:submit|preventDefault={updateGoal} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="Meta de libros"
						type="number"
						bind:value={formData.targetBooks}
						min="1"
						max="365"
						required
					/>
					<Input
						label="Meta de páginas (opcional)"
						type="number"
						bind:value={formData.targetPages}
						min="1"
					/>
				</div>
				
				<Input
					label="Descripción (opcional)"
					bind:value={formData.description}
				/>

				<div class="flex space-x-3">
					<Button type="submit" variant="primary" {loading}>
						{loading ? 'Actualizando...' : 'Actualizar Meta'}
					</Button>
					<Button 
						type="button" 
						variant="secondary" 
						on:click={() => showEditForm = false}
					>
						Cancelar
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Goal Progress -->
	{#if goalProgress}
		<div class="space-y-6">
			<!-- Status Card -->
			<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-blue-900">
						Meta {goalProgress.goal.year}
					</h2>
					<div class="flex space-x-2">
						<Button variant="secondary" size="sm" on:click={startEdit}>
							✏️ Editar
						</Button>
						<Button variant="danger" size="sm" on:click={deleteGoal}>
							🗑️ Eliminar
						</Button>
					</div>
				</div>

				{#if goalProgress.goal.description}
					<p class="text-blue-800 mb-4">"{goalProgress.goal.description}"</p>
				{/if}

				<div class="text-center mb-4">
					<p class="text-2xl font-bold text-blue-900">
						{getStatusMessage(goalProgress)}
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
					<div>
						<div class="text-2xl font-bold text-blue-600">
							{goalProgress.daysRemaining}
						</div>
						<div class="text-sm text-blue-700">días restantes</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-green-600">
							{goalProgress.averageBooksPerMonth.toFixed(1)}
						</div>
						<div class="text-sm text-green-700">libros/mes actual</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-purple-600">
							{goalProgress.goal.targetPages ? goalProgress.averagePagesPerMonth.toFixed(0) : 'N/A'}
						</div>
						<div class="text-sm text-purple-700">páginas/mes actual</div>
					</div>
				</div>
			</div>

			<!-- Progress Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Books Progress -->
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold text-gray-900">📚 Progreso de Libros</h3>
						<span class="text-2xl font-bold text-blue-600">
							{goalProgress.booksProgress.toFixed(1)}%
						</span>
					</div>

					<!-- Progress Bar -->
					<div class="w-full bg-gray-200 rounded-full h-4 mb-4">
						<div 
							class="h-4 rounded-full transition-all duration-500 {getProgressColor(goalProgress.booksProgress)}"
							style="width: {Math.min(100, goalProgress.booksProgress)}%"
						></div>
					</div>

					<div class="grid grid-cols-2 gap-4 text-center">
						<div>
							<div class="text-xl font-bold text-green-600">
								{goalProgress.goal.currentBooks}
							</div>
							<div class="text-sm text-gray-600">leídos</div>
						</div>
						<div>
							<div class="text-xl font-bold text-gray-600">
								{goalProgress.goal.targetBooks}
							</div>
							<div class="text-sm text-gray-600">objetivo</div>
						</div>
					</div>

					{#if goalProgress.booksRemaining > 0}
						<div class="mt-4 text-center">
							<span class="text-sm text-gray-600">
								Faltan <strong>{goalProgress.booksRemaining}</strong> libros
							</span>
						</div>
					{:else}
						<div class="mt-4 text-center">
							<span class="text-sm text-green-600 font-medium">
								🎉 ¡Meta alcanzada!
							</span>
						</div>
					{/if}
				</div>

				<!-- Pages Progress -->
				{#if goalProgress.goal.targetPages}
					<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-gray-900">📄 Progreso de Páginas</h3>
							<span class="text-2xl font-bold text-purple-600">
								{goalProgress.pagesProgress.toFixed(1)}%
							</span>
						</div>

						<!-- Progress Bar -->
						<div class="w-full bg-gray-200 rounded-full h-4 mb-4">
							<div 
								class="h-4 rounded-full transition-all duration-500 {getProgressColor(goalProgress.pagesProgress)}"
								style="width: {Math.min(100, goalProgress.pagesProgress)}%"
							></div>
						</div>

						<div class="grid grid-cols-2 gap-4 text-center">
							<div>
								<div class="text-xl font-bold text-green-600">
									{goalProgress.goal.currentPages.toLocaleString()}
								</div>
								<div class="text-sm text-gray-600">leídas</div>
							</div>
							<div>
								<div class="text-xl font-bold text-gray-600">
									{goalProgress.goal.targetPages.toLocaleString()}
								</div>
								<div class="text-sm text-gray-600">objetivo</div>
							</div>
						</div>

						{#if goalProgress.pagesRemaining > 0}
							<div class="mt-4 text-center">
								<span class="text-sm text-gray-600">
									Faltan <strong>{goalProgress.pagesRemaining.toLocaleString()}</strong> páginas
								</span>
							</div>
						{:else}
							<div class="mt-4 text-center">
								<span class="text-sm text-green-600 font-medium">
									🎉 ¡Meta alcanzada!
								</span>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Motivational Card -->
					<div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
						<h3 class="text-lg font-semibold text-green-900 mb-4">💡 Consejos para alcanzar tu meta</h3>
						<div class="space-y-3 text-sm text-green-800">
							<div class="flex items-center space-x-2">
								<span>📖</span>
								<span>Lee al menos 15-20 minutos diarios</span>
							</div>
							<div class="flex items-center space-x-2">
								<span>🎧</span>
								<span>Prueba audiolibros durante viajes</span>
							</div>
							<div class="flex items-center space-x-2">
								<span>📱</span>
								<span>Lleva siempre un libro o e-reader</span>
							</div>
							<div class="flex items-center space-x-2">
								<span>⏰</span>
								<span>Establece horarios fijos de lectura</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else if !showCreateForm}
		<!-- No Goal State -->
		<div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 p-8 text-center">
			<div class="text-6xl mb-4">🎯</div>
			<h2 class="text-xl font-semibold text-gray-900 mb-2">
				No tienes una meta para {data.currentYear}
			</h2>
			<p class="text-gray-600 mb-6">
				Establece una meta de lectura para mantenerte motivado y seguir tu progreso durante el año.
			</p>
			<Button 
				variant="primary" 
				on:click={() => showCreateForm = true}
			>
				📝 Crear Meta {data.currentYear}
			</Button>
		</div>
	{/if}
</div>

{#if toast.show}
	<Toast message={toast.message} type={toast.type} />
{/if} 