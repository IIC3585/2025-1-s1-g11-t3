import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import type { FormError } from '$lib/types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		const errors: FormError[] = [];

		// Basic validation
		if (typeof username !== 'string' || username.length < 1) {
			errors.push({
				field: 'username',
				message: 'El nombre de usuario es requerido'
			});
		}

		if (typeof password !== 'string' || password.length < 1) {
			errors.push({
				field: 'password',
				message: 'La contraseña es requerida'
			});
		}

		if (errors.length > 0) {
			return fail(400, { errors });
		}

		try {
			// Find user by username
			const existingUser = await db
				.select()
				.from(user)
				.where(eq(user.username, username as string))
				.limit(1);

			if (existingUser.length === 0) {
				return fail(400, {
					error: 'Nombre de usuario o contraseña incorrectos'
				});
			}

			const foundUser = existingUser[0];

			// Verify password
			const validPassword = await verify(foundUser.passwordHash, password as string, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return fail(400, {
					error: 'Nombre de usuario o contraseña incorrectos'
				});
			}

			// Create session
			const session = await lucia.createSession(foundUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

		} catch (error) {
			console.error('Login error:', error);
			return fail(500, {
				error: 'Error interno del servidor. Por favor, inténtalo de nuevo.'
			});
		}

		throw redirect(302, '/dashboard');
	}
}; 