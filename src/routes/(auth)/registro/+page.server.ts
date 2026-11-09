import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import type { Actions } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';
import {
	consume,
	createSession,
	hashPassword,
	safeNext,
	setSessionCookie
} from '#lib/server/auth/index.js';
import { errs, fieldErrors, registroSchema } from '#lib/validation.js';

const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const raw = {
			nome: String(form.get('nome') ?? ''),
			usuario: String(form.get('usuario') ?? ''),
			senha: String(form.get('senha') ?? '')
		};
		const values = { nome: raw.nome, usuario: raw.usuario };
		const parsed = registroSchema.safeParse(raw);
		if (!parsed.success) return fail(400, { ...values, errors: fieldErrors(parsed.error) });

		const db = createDb();
		const rl = await consume(db, `registro:${getClientAddress()}`, LIMIT, WINDOW_MS);
		if (!rl.allowed) {
			return fail(429, {
				...values,
				errors: errs({ _: 'Muitas contas criadas daqui. Tente mais tarde.' })
			});
		}

		const taken = await db
			.select({ id: schema.users.id })
			.from(schema.users)
			.where(eq(schema.users.username, parsed.data.usuario))
			.limit(1);
		if (taken.length)
			return fail(400, { ...values, errors: errs({ usuario: 'Esse usuário já existe.' }) });

		const pw = await hashPassword(parsed.data.senha);
		const id = createId();
		await db.insert(schema.users).values({
			id,
			username: parsed.data.usuario,
			displayName: parsed.data.nome,
			passwordHash: pw.hash,
			passwordSalt: pw.salt,
			hashIters: pw.iters,
			createdAt: Date.now()
		});

		const sid = await createSession(db, id);
		setSessionCookie(cookies, sid);
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
