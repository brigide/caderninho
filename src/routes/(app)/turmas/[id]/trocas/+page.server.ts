import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '#lib/server/db/index.js';
import { turmaDoUsuario } from '#lib/server/turmas.js';
import { aplicarTroca, painelTrocas } from '#lib/server/trocas.js';

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = createDb();
	const me = locals.user!.id;
	const turma = await turmaDoUsuario(db, params.id, me);
	if (!turma) error(404, 'Turma não encontrada');
	const painel = await painelTrocas(db, turma.id, me);
	const tipos = Object.fromEntries([...painel.porCodigo.values()].map((f) => [f.code, f.kind]));
	return {
		turma,
		cards: painel.cards,
		procuradas: painel.procuradas,
		tamanho: painel.tamanho,
		tipos
	};
};

const lista = (v: FormDataEntryValue | null) =>
	String(v ?? '')
		.split(',')
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean);

export const actions: Actions = {
	trocar: async ({ params, locals, request }) => {
		const form = await request.formData();
		const outro = String(form.get('membro') ?? '');
		const dar = lista(form.get('dar'));
		const receber = lista(form.get('receber'));
		if (!outro || (!dar.length && !receber.length)) return fail(400, { erro: 'Nada para trocar.' });
		const r = await aplicarTroca(createDb(), params.id, locals.user!.id, outro, dar, receber);
		if (!r.ok) return fail(409, { erro: r.motivo });
		return { trocado: { membro: outro, dar, receber } };
	}
};
