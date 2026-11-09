import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { schema, type Db } from './db/index.js';
import { CONVITE_MAX_USOS, CONVITE_TTL_MS, gerarCodigoConvite } from '#lib/domain/turmas.js';
import { trocas } from '#lib/domain/trocas.js';

export type Membro = {
	id: string;
	username: string;
	displayName: string;
	role: 'owner' | 'member';
	joinedAt: number;
	coladas: number;
	repetidas: number;
	percentual: number;
};

export async function minhasTurmas(db: Db, userId: string) {
	return db
		.select({
			id: schema.turmas.id,
			name: schema.turmas.name,
			ownerId: schema.turmas.ownerId,
			role: schema.turmaMembros.role
		})
		.from(schema.turmaMembros)
		.innerJoin(schema.turmas, eq(schema.turmas.id, schema.turmaMembros.turmaId))
		.where(eq(schema.turmaMembros.userId, userId))
		.orderBy(asc(schema.turmaMembros.joinedAt));
}

export async function criarTurma(db: Db, ownerId: string, name: string, now = Date.now()) {
	const id = createId();
	await db.batch([
		db.insert(schema.turmas).values({ id, name, ownerId, createdAt: now }),
		db
			.insert(schema.turmaMembros)
			.values({ turmaId: id, userId: ownerId, role: 'owner', joinedAt: now })
	]);
	return id;
}

export async function turmaDoUsuario(db: Db, turmaId: string, userId: string) {
	const rows = await db
		.select({
			id: schema.turmas.id,
			name: schema.turmas.name,
			ownerId: schema.turmas.ownerId,
			role: schema.turmaMembros.role
		})
		.from(schema.turmas)
		.innerJoin(
			schema.turmaMembros,
			and(eq(schema.turmaMembros.turmaId, schema.turmas.id), eq(schema.turmaMembros.userId, userId))
		)
		.where(eq(schema.turmas.id, turmaId))
		.limit(1);
	return rows[0] ?? null;
}

/** Copias de todos os membros: { userId: { code: copias } } */
export async function copiasDosMembros(
	db: Db,
	userIds: string[]
): Promise<Record<string, Record<string, number>>> {
	const out: Record<string, Record<string, number>> = {};
	for (const id of userIds) out[id] = {};
	if (!userIds.length) return out;
	const rows = await db
		.select({
			userId: schema.userStickers.userId,
			code: schema.userStickers.stickerCode,
			copias: schema.userStickers.copias
		})
		.from(schema.userStickers)
		.where(
			and(inArray(schema.userStickers.userId, userIds), sql`${schema.userStickers.copias} > 0`)
		);
	for (const r of rows) out[r.userId][r.code] = r.copias;
	return out;
}

export async function membrosDaTurma(db: Db, turmaId: string, total: number): Promise<Membro[]> {
	const rows = await db
		.select({
			id: schema.users.id,
			username: schema.users.username,
			displayName: schema.users.displayName,
			role: schema.turmaMembros.role,
			joinedAt: schema.turmaMembros.joinedAt
		})
		.from(schema.turmaMembros)
		.innerJoin(schema.users, eq(schema.users.id, schema.turmaMembros.userId))
		.where(eq(schema.turmaMembros.turmaId, turmaId))
		.orderBy(asc(schema.turmaMembros.joinedAt));
	const copias = await copiasDosMembros(
		db,
		rows.map((r) => r.id)
	);
	return rows.map((r) => {
		const c = Object.values(copias[r.id]);
		const coladas = c.length;
		const repetidas = c.reduce((a, n) => a + Math.max(0, n - 1), 0);
		return {
			...r,
			coladas,
			repetidas,
			percentual: total ? Math.round((coladas / total) * 100) : 0
		};
	});
}

/** Soma de trocas possíveis (iGive + iReceive) entre `me` e cada outro membro. */
export function totalTrocas(
	me: string,
	copias: Record<string, Record<string, number>>,
	codes: string[]
): { total: number; pessoas: number } {
	let total = 0;
	let pessoas = 0;
	for (const [uid, c] of Object.entries(copias)) {
		if (uid === me) continue;
		const t = trocas(copias[me] ?? {}, c, codes);
		const n = t.iGive.length + t.iReceive.length;
		if (n > 0) pessoas++;
		total += n;
	}
	return { total, pessoas };
}

export async function conviteAtivo(db: Db, turmaId: string, now = Date.now()) {
	const rows = await db
		.select()
		.from(schema.turmaConvites)
		.where(eq(schema.turmaConvites.turmaId, turmaId))
		.orderBy(asc(schema.turmaConvites.expiresAt));
	return rows.find((c) => c.expiresAt > now && c.uses < c.maxUses) ?? null;
}

/** Gera um novo convite e desativa os anteriores da turma. */
export async function gerarConvite(db: Db, turmaId: string, createdBy: string, now = Date.now()) {
	let token = gerarCodigoConvite();
	for (let i = 0; i < 5; i++) {
		const clash = await db
			.select({ t: schema.turmaConvites.token })
			.from(schema.turmaConvites)
			.where(eq(schema.turmaConvites.token, token))
			.limit(1);
		if (!clash.length) break;
		token = gerarCodigoConvite();
	}
	await db.batch([
		db.delete(schema.turmaConvites).where(eq(schema.turmaConvites.turmaId, turmaId)),
		db.insert(schema.turmaConvites).values({
			token,
			turmaId,
			createdBy,
			expiresAt: now + CONVITE_TTL_MS,
			maxUses: CONVITE_MAX_USOS,
			uses: 0
		})
	]);
	return token;
}

export async function lerConvite(db: Db, token: string, now = Date.now()) {
	const rows = await db
		.select({
			token: schema.turmaConvites.token,
			turmaId: schema.turmaConvites.turmaId,
			expiresAt: schema.turmaConvites.expiresAt,
			uses: schema.turmaConvites.uses,
			maxUses: schema.turmaConvites.maxUses,
			turmaName: schema.turmas.name
		})
		.from(schema.turmaConvites)
		.innerJoin(schema.turmas, eq(schema.turmas.id, schema.turmaConvites.turmaId))
		.where(eq(schema.turmaConvites.token, token))
		.limit(1);
	const c = rows[0];
	if (!c) return { status: 'inexistente' as const };
	if (c.expiresAt <= now) return { status: 'expirado' as const, turmaName: c.turmaName };
	if (c.uses >= c.maxUses) return { status: 'esgotado' as const, turmaName: c.turmaName };
	return { status: 'ok' as const, ...c };
}

export async function aceitarConvite(db: Db, token: string, userId: string, now = Date.now()) {
	const c = await lerConvite(db, token, now);
	if (c.status !== 'ok') return c;
	const ja = await turmaDoUsuario(db, c.turmaId, userId);
	if (ja) return { status: 'ja-membro' as const, turmaId: c.turmaId, turmaName: c.turmaName };
	await db.batch([
		db
			.insert(schema.turmaMembros)
			.values({ turmaId: c.turmaId, userId, role: 'member', joinedAt: now }),
		db
			.update(schema.turmaConvites)
			.set({ uses: sql`${schema.turmaConvites.uses} + 1` })
			.where(eq(schema.turmaConvites.token, token))
	]);
	return { status: 'entrou' as const, turmaId: c.turmaId, turmaName: c.turmaName };
}

export async function removerMembro(db: Db, turmaId: string, userId: string) {
	await db
		.delete(schema.turmaMembros)
		.where(and(eq(schema.turmaMembros.turmaId, turmaId), eq(schema.turmaMembros.userId, userId)));
}

/** Sai da turma. Dono saindo passa a posse ao membro mais antigo; turma vazia é apagada. */
export async function sairDaTurma(db: Db, turmaId: string, userId: string) {
	const membros = await db
		.select({ userId: schema.turmaMembros.userId, role: schema.turmaMembros.role })
		.from(schema.turmaMembros)
		.where(eq(schema.turmaMembros.turmaId, turmaId))
		.orderBy(asc(schema.turmaMembros.joinedAt));
	const eu = membros.find((m) => m.userId === userId);
	if (!eu) return;
	const outros = membros.filter((m) => m.userId !== userId);
	if (!outros.length) {
		await db.delete(schema.turmas).where(eq(schema.turmas.id, turmaId));
		return;
	}
	if (eu.role === 'owner') {
		const novo = outros[0].userId;
		await db.batch([
			db.update(schema.turmas).set({ ownerId: novo }).where(eq(schema.turmas.id, turmaId)),
			db
				.update(schema.turmaMembros)
				.set({ role: 'owner' })
				.where(and(eq(schema.turmaMembros.turmaId, turmaId), eq(schema.turmaMembros.userId, novo))),
			db
				.delete(schema.turmaMembros)
				.where(
					and(eq(schema.turmaMembros.turmaId, turmaId), eq(schema.turmaMembros.userId, userId))
				)
		]);
	} else {
		await removerMembro(db, turmaId, userId);
	}
}

export async function codigosDoCatalogo(db: Db): Promise<string[]> {
	const rows = await db.select({ code: schema.stickers.code }).from(schema.stickers);
	return rows.map((r) => r.code);
}
