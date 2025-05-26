import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userBooks } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const userBookId = params.id;
	if (!userBookId) {
		return json({ error: 'Book ID is required' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const { 
			status, 
			rating, 
			currentPage, 
			startDate, 
			finishDate, 
			personalNotes, 
			favoriteQuotes 
		} = body;

		// Validate status if provided
		const validStatuses = ['want_to_read', 'reading', 'read', 'recommended', 'abandoned'];
		if (status && !validStatuses.includes(status)) {
			return json({ 
				error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
			}, { status: 400 });
		}

		// Validate rating if provided
		if (rating !== undefined && (rating < 1 || rating > 5)) {
			return json({ 
				error: 'Rating must be between 1 and 5' 
			}, { status: 400 });
		}

		// Check if the user book exists and belongs to the user
		const existingUserBook = await db
			.select()
			.from(userBooks)
			.where(and(
				eq(userBooks.id, userBookId),
				eq(userBooks.userId, locals.user.id)
			))
			.limit(1);

		if (existingUserBook.length === 0) {
			return json({ 
				error: 'Book not found in your library' 
			}, { status: 404 });
		}

		// Prepare update data
		const updateData: any = {
			updatedAt: new Date()
		};

		if (status !== undefined) updateData.status = status;
		if (rating !== undefined) updateData.rating = rating;
		if (currentPage !== undefined) updateData.currentPage = currentPage;
		if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
		if (finishDate !== undefined) updateData.finishDate = finishDate ? new Date(finishDate) : null;
		if (personalNotes !== undefined) updateData.personalNotes = personalNotes;
		if (favoriteQuotes !== undefined) updateData.favoriteQuotes = favoriteQuotes;

		// Auto-set dates based on status changes
		if (status === 'reading' && !existingUserBook[0].startDate && !startDate) {
			updateData.startDate = new Date();
		}
		if (status === 'read' && !existingUserBook[0].finishDate && !finishDate) {
			updateData.finishDate = new Date();
		}

		// Update the user book record
		await db
			.update(userBooks)
			.set(updateData)
			.where(and(
				eq(userBooks.id, userBookId),
				eq(userBooks.userId, locals.user.id)
			));

		// Fetch the updated record to return
		const updatedUserBook = await db
			.select()
			.from(userBooks)
			.where(and(
				eq(userBooks.id, userBookId),
				eq(userBooks.userId, locals.user.id)
			))
			.limit(1);

		return json({
			success: true,
			message: 'Book updated successfully',
			data: updatedUserBook[0]
		});

	} catch (error) {
		console.error('Error updating user book:', error);
		return json({ 
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	// Check authentication
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const userBookId = params.id;
	if (!userBookId) {
		return json({ error: 'Book ID is required' }, { status: 400 });
	}

	try {
		// Check if the user book exists and belongs to the user
		const existingUserBook = await db
			.select()
			.from(userBooks)
			.where(and(
				eq(userBooks.id, userBookId),
				eq(userBooks.userId, locals.user.id)
			))
			.limit(1);

		if (existingUserBook.length === 0) {
			return json({ 
				error: 'Book not found in your library' 
			}, { status: 404 });
		}

		// Delete the user book record
		await db
			.delete(userBooks)
			.where(and(
				eq(userBooks.id, userBookId),
				eq(userBooks.userId, locals.user.id)
			));

		return json({
			success: true,
			message: 'Book removed from library successfully'
		});

	} catch (error) {
		console.error('Error removing user book:', error);
		return json({ 
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 