import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '#lib/server/db/index.js';
import {
	codigosDoCatalogo,
	conviteAtivo,
	copiasDosMembros,
	gerarConvite,
	membrosDaTurma,
	removerMembro,
	sairDaTurma,
	totalTrocas,
	turmaDoUsuario
} from '#lib/server/turmas.js';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const db = createDb();
	const me = locals.user!.id;
	const turma = await turmaDoUsuario(db, params.id, me);
	if (!turma) error(404, 'Turma não encontrada');
	const codes = await codigosDoCatalogo(db);
	const [membros, convite] = await Promise.all([
		membrosDaTurma(db, turma.id, codes.length),
		conviteAtivo(db, turma.id)
	]);
	const copias = await copiasDosMembros(
		db,
		membros.map((m) => m.id)
	);
	return {
		turma,
		membros,
		trocas: totalTrocas(me, copias, codes),
		convite: convite
			? {
					token: convite.token,
					expiresAt: convite.expiresAt,
					url: `${url.origin}/convite/${convite.token}`
				}
			: null
	};
};

export const actions: Actions = {
	convidar: async ({ params, locals }) => {
		const db = createDb();
		const turma = await turmaDoUsuario(db, params.id, locals.user!.id);
		if (!turma) return fail(404);
		await gerarConvite(db, turma.id, locals.user!.id);
		return { convidado: true };
	},
	remover: async ({ params, locals, request }) => {
		const db = createDb();
		const turma = await turmaDoUsuario(db, params.id, locals.user!.id);
		if (!turma || turma.role !== 'owner')
			return fail(403, { erro: 'Só quem criou a turma pode remover membros.' });
		const alvo = String((await request.formData()).get('userId') ?? '');
		if (!alvo || alvo === locals.user!.id) return fail(400, { erro: 'Membro inválido.' });
		await removerMembro(db, turma.id, alvo);
		return { removido: true };
	},
	sair: async ({ params, locals }) => {
		const db = createDb();
		const turma = await turmaDoUsuario(db, params.id, locals.user!.id);
		if (!turma) return fail(404);
		await sairDaTurma(db, turma.id, locals.user!.id);
		redirect(303, '/turmas');
	}
};
