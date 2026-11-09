import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '#lib/server/db/index.js';
import { aceitarConvite, lerConvite } from '#lib/server/turmas.js';
import { normalizarCodigo } from '#lib/domain/turmas.js';

export const load: PageServerLoad = async ({ params, locals }) => {
	const token = normalizarCodigo(params.token);
	const convite = await lerConvite(createDb(), token);
	return { token, convite, user: locals.user };
};

export const actions: Actions = {
	aceitar: async ({ params, locals, url }) => {
		const token = normalizarCodigo(params.token);
		if (!locals.user) redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);
		const r = await aceitarConvite(createDb(), token, locals.user.id);
		if (r.status === 'entrou' || r.status === 'ja-membro') redirect(303, `/turmas/${r.turmaId}`);
		return { falha: r.status };
	}
};
