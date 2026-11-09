import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDb } from '#lib/server/db/index.js';
import { clearSessionCookie, deleteSession } from '#lib/server/auth/index.js';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.sessionId) await deleteSession(createDb(), locals.sessionId);
	clearSessionCookie(cookies);
	redirect(303, '/login');
};
