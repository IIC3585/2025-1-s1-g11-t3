import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Obtener meta del año actual
		const currentYear = new Date().getFullYear();
		const response = await fetch(`/api/goals?year=${currentYear}`);
		const data = await response.json();

		return {
			user: locals.user,
			currentYear,
			goalProgress: data.progress || null
		};
	} catch (error) {
		console.error('Error loading goals page:', error);
		return {
			user: locals.user,
			currentYear: new Date().getFullYear(),
			goalProgress: null
		};
	}
}; 