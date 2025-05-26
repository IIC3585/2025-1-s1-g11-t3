import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { readingGoals, userBooks, books } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import type { ReadingGoal, ReadingGoalFormData } from '$lib/types';

// GET - Obtener metas del usuario
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const year = url.searchParams.get('year');
		const currentYear = year ? parseInt(year) : new Date().getFullYear();

		// Obtener meta del año especificado
		const goals = await db
			.select()
			.from(readingGoals)
			.where(
				and(
					eq(readingGoals.userId, locals.user.id),
					eq(readingGoals.year, currentYear)
				)
			);

		if (goals.length === 0) {
			return json({ goal: null });
		}

		const goal = goals[0];

		// Calcular progreso actual
		const currentStats = await db
			.select({
				booksRead: sql<number>`count(*)`,
				totalPages: sql<number>`coalesce(sum(${books.pages}), 0)`
			})
			.from(userBooks)
			.leftJoin(books, eq(userBooks.bookId, books.id))
			.where(
				and(
					eq(userBooks.userId, locals.user.id),
					eq(userBooks.status, 'read'),
					sql`extract(year from ${userBooks.finishDate}) = ${currentYear}`
				)
			);

		const stats = currentStats[0];
		
		// Actualizar progreso en la meta
		await db
			.update(readingGoals)
			.set({
				currentBooks: stats.booksRead,
				currentPages: stats.totalPages,
				updatedAt: new Date()
			})
			.where(eq(readingGoals.id, goal.id));

		// Calcular métricas de progreso
		const now = new Date();
		const yearStart = new Date(currentYear, 0, 1);
		const yearEnd = new Date(currentYear, 11, 31);
		const daysInYear = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
		const daysPassed = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
		const daysRemaining = Math.max(0, daysInYear - daysPassed);

		const booksProgress = Math.min(100, (stats.booksRead / goal.targetBooks) * 100);
		const pagesProgress = goal.targetPages ? Math.min(100, (stats.totalPages / goal.targetPages) * 100) : 0;
		
		const expectedBooksAtThisPoint = (goal.targetBooks * daysPassed) / daysInYear;
		const isOnTrack = stats.booksRead >= expectedBooksAtThisPoint;

		const progress = {
			goal: {
				...goal,
				currentBooks: stats.booksRead,
				currentPages: stats.totalPages
			},
			booksProgress,
			pagesProgress,
			booksRemaining: Math.max(0, goal.targetBooks - stats.booksRead),
			pagesRemaining: goal.targetPages ? Math.max(0, goal.targetPages - stats.totalPages) : 0,
			averageBooksPerMonth: stats.booksRead / (daysPassed / 30.44), // promedio días por mes
			averagePagesPerMonth: stats.totalPages / (daysPassed / 30.44),
			isOnTrack,
			daysRemaining
		};

		return json({ progress });

	} catch (error) {
		console.error('Error fetching reading goals:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// POST - Crear nueva meta
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const data: ReadingGoalFormData = await request.json();

		// Validar datos
		if (!data.year || !data.targetBooks || data.targetBooks < 1) {
			return json({ error: 'Datos inválidos' }, { status: 400 });
		}

		// Verificar si ya existe una meta para ese año
		const existingGoal = await db
			.select()
			.from(readingGoals)
			.where(
				and(
					eq(readingGoals.userId, locals.user.id),
					eq(readingGoals.year, data.year)
				)
			);

		if (existingGoal.length > 0) {
			return json({ error: 'Ya existe una meta para este año' }, { status: 409 });
		}

		// Crear nueva meta
		const goalId = generateIdFromEntropySize(10);
		const newGoal = {
			id: goalId,
			userId: locals.user.id,
			year: data.year,
			targetBooks: data.targetBooks,
			targetPages: data.targetPages || null,
			description: data.description || null,
			currentBooks: 0,
			currentPages: 0,
			isActive: 1
		};

		await db.insert(readingGoals).values(newGoal);

		return json({ 
			success: true, 
			goal: newGoal,
			message: 'Meta de lectura creada exitosamente' 
		});

	} catch (error) {
		console.error('Error creating reading goal:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// PUT - Actualizar meta existente
export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const { id, ...data }: { id: string } & Partial<ReadingGoalFormData> = await request.json();

		if (!id) {
			return json({ error: 'ID de meta requerido' }, { status: 400 });
		}

		// Verificar que la meta pertenece al usuario
		const existingGoal = await db
			.select()
			.from(readingGoals)
			.where(
				and(
					eq(readingGoals.id, id),
					eq(readingGoals.userId, locals.user.id)
				)
			);

		if (existingGoal.length === 0) {
			return json({ error: 'Meta no encontrada' }, { status: 404 });
		}

		// Actualizar meta
		const updateData: any = {
			updatedAt: new Date()
		};

		if (data.targetBooks !== undefined) updateData.targetBooks = data.targetBooks;
		if (data.targetPages !== undefined) updateData.targetPages = data.targetPages;
		if (data.description !== undefined) updateData.description = data.description;

		await db
			.update(readingGoals)
			.set(updateData)
			.where(eq(readingGoals.id, id));

		return json({ 
			success: true, 
			message: 'Meta actualizada exitosamente' 
		});

	} catch (error) {
		console.error('Error updating reading goal:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// DELETE - Eliminar meta
export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const id = url.searchParams.get('id');

		if (!id) {
			return json({ error: 'ID de meta requerido' }, { status: 400 });
		}

		// Verificar que la meta pertenece al usuario
		const existingGoal = await db
			.select()
			.from(readingGoals)
			.where(
				and(
					eq(readingGoals.id, id),
					eq(readingGoals.userId, locals.user.id)
				)
			);

		if (existingGoal.length === 0) {
			return json({ error: 'Meta no encontrada' }, { status: 404 });
		}

		// Eliminar meta
		await db
			.delete(readingGoals)
			.where(eq(readingGoals.id, id));

		return json({ 
			success: true, 
			message: 'Meta eliminada exitosamente' 
		});

	} catch (error) {
		console.error('Error deleting reading goal:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}; 