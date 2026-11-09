import { and, asc, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';

/** CSV do meu álbum: code,secao,tipo,pagina,copias,estado */
export const GET: RequestHandler = async ({ locals }) => {
	const db = createDb();
	const rows = await db
		.select({
			code: schema.stickers.code,
			secao: schema.sections.name,
			tipo: schema.stickers.kind,
			pagina: schema.stickers.page,
			copias: schema.userStickers.copias
		})
		.from(schema.stickers)
		.innerJoin(schema.sections, eq(schema.sections.id, schema.stickers.sectionId))
		.leftJoin(
			schema.userStickers,
			and(
				eq(schema.userStickers.stickerCode, schema.stickers.code),
				eq(schema.userStickers.userId, locals.user!.id)
			)
		)
		.orderBy(asc(schema.stickers.sortOrder));
	const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
	const linhas = ['code,secao,tipo,pagina,copias,estado'];
	for (const r of rows) {
		const c = r.copias ?? 0;
		linhas.push(
			[
				r.code,
				r.secao,
				r.tipo,
				r.pagina ?? '',
				c,
				c === 0 ? 'faltando' : c === 1 ? 'colada' : 'repetida'
			]
				.map(q)
				.join(',')
		);
	}
	const data = new Date().toISOString().slice(0, 10);
	return new Response('﻿' + linhas.join('\r\n'), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="caderninho-${locals.user!.username}-${data}.csv"`,
			'cache-control': 'no-store'
		}
	});
};
