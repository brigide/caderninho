import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '#lib/server/db/index.js';
import {
	codigosDoCatalogo,
	copiasDosMembros,
	criarTurma,
	membrosDaTurma,
	minhasTurmas,
	totalTrocas
} from '#lib/server/turmas.js';
import { errs } from '#lib/validation.js';

export const load: PageServerLoad = async ({ locals }) => {
	const db = createDb();
	const me = locals.user!.id;
	const [turmas, codes] = await Promise.all([minhasTurmas(db, me), codigosDoCatalogo(db)]);
	const detalhes = await Promise.all(
		turmas.map(async (t) => {
			const membros = await membrosDaTurma(db, t.id, codes.length);
			const copias = await copiasDosMembros(
				db,
				membros.map((m) => m.id)
			);
			return { ...t, membros, trocas: totalTrocas(me, copias, codes) };
		})
	);
	return { turmas: detalhes };
};

const nomeSchema = z
	.string()
	.trim()
	.min(1, 'Dê um nome para a turma')
	.max(40, 'Nome pode ter no máximo 40 caracteres');

export const actions: Actions = {
	criar: async ({ request, locals }) => {
		const form = await request.formData();
		const nome = String(form.get('nome') ?? '');
		const parsed = nomeSchema.safeParse(nome);
		if (!parsed.success)
			return fail(400, { nome, errors: errs({ nome: parsed.error.issues[0].message }) });
		const id = await criarTurma(createDb(), locals.user!.id, parsed.data);
		redirect(303, `/turmas/${id}`);
	}
};
