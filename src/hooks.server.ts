import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { createDb } from '#lib/server/db/index.js';
import {
	SESSION_COOKIE,
	clearSessionCookie,
	setSessionCookie,
	validateSession
} from '#lib/server/auth/index.js';

const PUBLIC = [/^\/login$/, /^\/registro$/, /^\/convite\//, /^\/creditos$/];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.sessionId = null;

	const sid = event.cookies.get(SESSION_COOKIE);
	if (sid) {
		const db = createDb();
		const result = await validateSession(db, sid);
		if (result) {
			event.locals.user = result.user;
			event.locals.sessionId = sid;
			if (result.renewed) setSessionCookie(event.cookies, sid);
		} else {
			clearSessionCookie(event.cookies);
		}
	}

	const { pathname } = event.url;
	const isPublic = PUBLIC.some((re) => re.test(pathname));
	if (!event.locals.user && !isPublic) {
		const next = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + event.url.search)}`;
		redirect(303, `/login${next}`);
	}
	if (event.locals.user && (pathname === '/login' || pathname === '/registro')) {
		redirect(303, '/album');
	}

	return resolve(event);
};
