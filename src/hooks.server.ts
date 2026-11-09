import type { Handle } from '@sveltejs/kit/hooks';

// Fase 0: sem auth ainda. Fase 1 carrega a sessão a partir do cookie aqui.
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.sessionId = null;
	return resolve(event);
};
