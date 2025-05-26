import { fail, redirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
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
		const confirmPassword = formData.get('confirmPassword');
		const ageStr = formData.get('age');

		const errors: FormError[] = [];

		// Validation
		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			errors.push({
				field: 'username',
				message: 'El nombre de usuario debe tener entre 3 y 31 caracteres'
			});
		}

		if (typeof username === 'string' && !/^[a-zA-Z0-9_-]+$/.test(username)) {
			errors.push({
				field: 'username',
				message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
			});
		}

		if (typeof password !== 'string' || password.length < 6) {
			errors.push({
				field: 'password',
				message: 'La contraseña debe tener al menos 6 caracteres'
			});
		}

		if (password !== confirmPassword) {
			errors.push({
				field: 'confirmPassword',
				message: 'Las contraseñas no coinciden'
			});
		}

		let age: number | undefined;
		if (ageStr && typeof ageStr === 'string') {
			age = parseInt(ageStr);
			if (isNaN(age) || age < 1 || age > 120) {
				errors.push({
					field: 'age',
					message: 'La edad debe ser un número válido entre 1 y 120'
				});
			}
		}

		if (errors.length > 0) {
			return fail(400, { errors });
		}

		try {
			// Check if username already exists
			const existingUser = await db
				.select()
				.from(user)
				.where(eq(user.username, username as string))
				.limit(1);

			if (existingUser.length > 0) {
				return fail(400, {
					errors: [{
						field: 'username',
						message: 'Este nombre de usuario ya está en uso'
					}]
				});
			}

			// Hash password
			const passwordHash = await hash(password as string, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Generate user ID
			const userId = generateIdFromEntropySize(10);

			// Create user
			await db.insert(user).values({
				id: userId,
				username: username as string,
				passwordHash,
				age
			});

			// Create session
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, {
				error: 'Error interno del servidor. Por favor, inténtalo de nuevo.'
			});
		}

		throw redirect(302, '/dashboard');
	}
}; 