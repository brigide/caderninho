import { and, eq, sql } from 'drizzle-orm';
import { schema, type Db } from './db/index.js';

export async function getCopias(db: Db, userId: string): Promise<Record<string, number>> {
	const rows = await db
		.select({ code: schema.userStickers.stickerCode, copias: schema.userStickers.copias })
		.from(schema.userStickers)
		.where(eq(schema.userStickers.userId, userId));
	const out: Record<string, number> = {};
	for (const r of rows) if (r.copias > 0) out[r.code] = r.copias;
	return out;
}

export async function stickerExists(db: Db, code: string): Promise<boolean> {
	const rows = await db
		.select({ code: schema.stickers.code })
		.from(schema.stickers)
		.where(eq(schema.stickers.code, code))
		.limit(1);
	return rows.length > 0;
}

/** Define `copias` (clamp ≥ 0), registra o evento e devolve o valor final. */
export async function setCopias(
	db: Db,
	userId: string,
	code: string,
	target: number,
	now = Date.now()
): Promise<number> {
	const depois = Math.max(0, Math.min(99, Math.trunc(target)));
	const [cur] = await db
		.select({ copias: schema.userStickers.copias })
		.from(schema.userStickers)
		.where(and(eq(schema.userStickers.userId, userId), eq(schema.userStickers.stickerCode, code)))
		.limit(1);
	const antes = cur?.copias ?? 0;
	if (antes === depois) return antes;
	await db.batch([
		db
			.insert(schema.userStickers)
			.values({ userId, stickerCode: code, copias: depois, updatedAt: now })
			.onConflictDoUpdate({
				target: [schema.userStickers.userId, schema.userStickers.stickerCode],
				set: { copias: depois, updatedAt: now }
			}),
		db
			.insert(schema.stickerEvents)
			.values({ userId, stickerCode: code, delta: depois - antes, at: now })
	]);
	return depois;
}

export async function adjustCopias(
	db: Db,
	userId: string,
	code: string,
	delta: number,
	now = Date.now()
): Promise<number> {
	const [cur] = await db
		.select({ copias: schema.userStickers.copias })
		.from(schema.userStickers)
		.where(and(eq(schema.userStickers.userId, userId), eq(schema.userStickers.stickerCode, code)))
		.limit(1);
	return setCopias(db, userId, code, (cur?.copias ?? 0) + delta, now);
}

export const _sql = sql;
