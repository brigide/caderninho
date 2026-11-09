import { and, asc, eq, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';
import { getCopias } from '#lib/server/stickers.js';
import { resumo } from '#lib/domain/album.js';
import {
	SEMANA_MS,
	custoAvulsas,
	estimativaColecionador,
	estimativaObservada,
	mediaSemanal,
	ritmoSemanal
} from '#lib/domain/estatisticas.js';

const SEMANAS = 8;
const PRECO_ENVELOPE = 5;
const POR_ENVELOPE = 5;
const PRECO_AVULSA = 1;

export const load: PageServerLoad = async ({ locals }) => {
	const db = createDb();
	const userId = locals.user!.id;
	const now = Date.now();
	const [sections, stickers, copias, eventos, totalLancadas] = await Promise.all([
		db.select().from(schema.sections).orderBy(asc(schema.sections.position)),
		db
			.select({
				code: schema.stickers.code,
				sortOrder: schema.stickers.sortOrder,
				sectionId: schema.stickers.sectionId,
				kind: schema.stickers.kind,
				page: schema.stickers.page
			})
			.from(schema.stickers),
		getCopias(db, userId),
		// histórico completo do usuário (poucos milhares de linhas no pior caso)
		db
			.select({
				stickerCode: schema.stickerEvents.stickerCode,
				delta: schema.stickerEvents.delta,
				at: schema.stickerEvents.at
			})
			.from(schema.stickerEvents)
			.where(eq(schema.stickerEvents.userId, userId))
			.orderBy(asc(schema.stickerEvents.at)),
		db
			.select({ delta: schema.stickerEvents.delta })
			.from(schema.stickerEvents)
			.where(and(eq(schema.stickerEvents.userId, userId), gte(schema.stickerEvents.delta, 1)))
	]);

	const r = resumo(stickers, sections, copias);
	const semanas = ritmoSemanal(eventos, now, SEMANAS);
	const ritmo = mediaSemanal(semanas);
	const janela = semanas.reduce(
		(a, s) => ({ novas: a.novas + s.novas, lancadas: a.lancadas + s.lancadas }),
		{ novas: 0, lancadas: 0 }
	);
	const lancadas = totalLancadas.reduce((a, e) => a + e.delta, 0);
	const envelopesAbertos = Math.ceil(lancadas / POR_ENVELOPE);
	const melhor = semanas.reduce((m, s) => (s.novas > m.novas ? s : m), semanas[0]);

	return {
		resumo: r,
		sections,
		semanas,
		ritmo,
		envelopesAbertos,
		melhor,
		estimativa: {
			colecionador: estimativaColecionador(r.total, r.faltam, POR_ENVELOPE, PRECO_ENVELOPE),
			observada: estimativaObservada(
				r.faltam,
				janela.novas,
				janela.lancadas,
				POR_ENVELOPE,
				PRECO_ENVELOPE
			),
			avulsas: custoAvulsas(r.faltam, PRECO_AVULSA),
			precoEnvelope: PRECO_ENVELOPE,
			porEnvelope: POR_ENVELOPE,
			precoAvulsa: PRECO_AVULSA
		},
		semanaMs: SEMANA_MS
	};
};
