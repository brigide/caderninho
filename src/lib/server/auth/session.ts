import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { schema, type Db } from '../db/index.js';

export const SESSION_COOKIE = 'caderninho_sessao';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
/** Renova a sessão quando faltar menos que isso para expirar. */
export const RENEW_BEFORE_MS = 15 * 24 * 60 * 60 * 1000;

export type SessionUser = { id: string; username: string; displayName: string };

export function randomToken(bytes = 32): string {
	const u8 = crypto.getRandomValues(new Uint8Array(bytes));
	let s = '';
	for (const b of u8) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isExpired(expiresAt: number, now = Date.now()): boolean {
	return expiresAt <= now;
}

export function shouldRenew(expiresAt: number, now = Date.now()): boolean {
	return expiresAt - now < RENEW_BEFORE_MS;
}

export async function createSession(db: Db, userId: string, now = Date.now()): Promise<string> {
	const id = randomToken(32);
	await db.insert(schema.sessions).values({ id, userId, expiresAt: now + SESSION_TTL_MS });
	return id;
}

export async function validateSession(
	db: Db,
	sessionId: string,
	now = Date.now()
): Promise<{ user: SessionUser; renewed: boolean } | null> {
	const rows = await db
		.select({
			expiresAt: schema.sessions.expiresAt,
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName
		})
		.from(schema.sessions)
		.innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
		.where(eq(schema.sessions.id, sessionId))
		.limit(1);
	const row = rows[0];
	if (!row) return null;
	if (isExpired(row.expiresAt, now)) {
		await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
		return null;
	}
	let renewed = false;
	if (shouldRenew(row.expiresAt, now)) {
		await db
			.update(schema.sessions)
			.set({ expiresAt: now + SESSION_TTL_MS })
			.where(eq(schema.sessions.id, sessionId));
		renewed = true;
	}
	return { user: { id: row.id, username: row.username, displayName: row.displayName }, renewed };
}

export async function deleteSession(db: Db, sessionId: string): Promise<void> {
	await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: SESSION_TTL_MS / 1000
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
