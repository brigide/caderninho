import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';
import { hashPassword, verifyPassword } from '#lib/server/auth/index.js';
import { displayNameSchema, errs, passwordSchema } from '#lib/validation.js';

export const load: PageServerLoad = async ({ locals }) => {
	const db = createDb();
	const [n] = await db
		.select({ coladas: schema.userStickers.copias })
		.from(schema.userStickers)
		.where(eq(schema.userStickers.userId, locals.user!.id));
	return { temDados: Boolean(n) };
};

export const actions: Actions = {
	nome: async ({ request, locals }) => {
		const nome = String((await request.formData()).get('nome') ?? '');
		const parsed = displayNameSchema.safeParse(nome);
		if (!parsed.success)
			return fail(400, { nome, errors: errs({ nome: parsed.error.issues[0].message }) });
		await createDb()
			.update(schema.users)
			.set({ displayName: parsed.data })
			.where(eq(schema.users.id, locals.user!.id));
		return { ok: 'nome' as const };
	},
	senha: async ({ request, locals }) => {
		const form = await request.formData();
		const atual = String(form.get('atual') ?? '');
		const nova = String(form.get('nova') ?? '');
		const parsed = passwordSchema.safeParse(nova);
		if (!parsed.success)
			return fail(400, { errors: errs({ nova: parsed.error.issues[0].message }) });
		const db = createDb();
		const [u] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, locals.user!.id))
			.limit(1);
		const ok =
			u &&
			(await verifyPassword(atual, {
				hash: u.passwordHash,
				salt: u.passwordSalt,
				iters: u.hashIters
			}));
		if (!ok) return fail(400, { errors: errs({ atual: 'Senha atual não confere.' }) });
		const pw = await hashPassword(parsed.data);
		await db
			.update(schema.users)
			.set({ passwordHash: pw.hash, passwordSalt: pw.salt, hashIters: pw.iters })
			.where(eq(schema.users.id, u.id));
		return { ok: 'senha' as const };
	},
	zerar: async ({ request, locals }) => {
		const confirma = String((await request.formData()).get('confirma') ?? '');
		if (confirma.trim().toUpperCase() !== 'ZERAR')
			return fail(400, { errors: errs({ confirma: 'Digite ZERAR para confirmar.' }) });
		const db = createDb();
		await db.batch([
			db.delete(schema.userStickers).where(eq(schema.userStickers.userId, locals.user!.id)),
			db.delete(schema.stickerEvents).where(eq(schema.stickerEvents.userId, locals.user!.id))
		]);
		return { ok: 'zerado' as const };
	}
};
