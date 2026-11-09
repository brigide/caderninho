import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';
import {
	consume,
	createSession,
	safeNext,
	setSessionCookie,
	verifyPassword
} from '#lib/server/auth/index.js';
import { errs, fieldErrors, loginSchema } from '#lib/validation.js';

const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const raw = {
			usuario: String(form.get('usuario') ?? ''),
			senha: String(form.get('senha') ?? '')
		};
		const parsed = loginSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { usuario: raw.usuario, errors: fieldErrors(parsed.error) });
		}

		const db = createDb();
		const rl = await consume(db, `login:${getClientAddress()}`, LIMIT, WINDOW_MS);
		if (!rl.allowed) {
			const min = Math.ceil(rl.retryAfterMs / 60000);
			return fail(429, {
				usuario: raw.usuario,
				errors: errs({ _: `Muitas tentativas. Tente de novo em ${min} min.` })
			});
		}

		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.username, parsed.data.usuario))
			.limit(1);
		const ok =
			user &&
			(await verifyPassword(parsed.data.senha, {
				hash: user.passwordHash,
				salt: user.passwordSalt,
				iters: user.hashIters
			}));
		if (!ok) {
			return fail(400, {
				usuario: raw.usuario,
				errors: errs({ _: 'Usuário ou senha não conferem.' })
			});
		}

		const sid = await createSession(db, user.id);
		setSessionCookie(cookies, sid);
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
