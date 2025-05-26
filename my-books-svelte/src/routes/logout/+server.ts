import { json } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	// Si no hay sesión, devolver éxito de todas formas
	if (!event.locals.session) {
		return json({ success: true, message: 'No hay sesión activa' });
	}

	try {
		// Invalidar la sesión en la base de datos
		await lucia.invalidateSession(event.locals.session.id);
		
		// Crear cookie en blanco para limpiar la sesión del navegador
		const sessionCookie = lucia.createBlankSessionCookie();
		
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ success: true, message: 'Sesión cerrada exitosamente' });
	} catch (error) {
		console.error('Error during logout:', error);
		return json({ success: false, error: 'Error al cerrar sesión' }, { status: 500 });
	}
}; 