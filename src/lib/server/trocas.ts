import { asc, eq, inArray, ne } from 'drizzle-orm';
import { schema, type Db } from './db/index.js';
import { copiasDosMembros, membrosDaTurma, turmaDoUsuario } from './turmas.js';
import { setCopias } from './stickers.js';
import {
	dicaTroca,
	maisProcuradas,
	selecionarJusta,
	trocas,
	type Troca
} from '#lib/domain/trocas.js';
import type { Figurinha } from '#lib/domain/album.js';

export type CardTroca = {
	id: string;
	displayName: string;
	percentual: number;
	troca: Troca;
	justa: { dar: string[]; receber: string[] };
	dica: string;
};

export async function catalogo(db: Db): Promise<Figurinha[]> {
	return db
		.select({
			code: schema.stickers.code,
			sortOrder: schema.stickers.sortOrder,
			sectionId: schema.stickers.sectionId,
			kind: schema.stickers.kind,
			page: schema.stickers.page
		})
		.from(schema.stickers)
		.orderBy(asc(schema.stickers.sortOrder));
}

export async function painelTrocas(db: Db, turmaId: string, me: string) {
	const cat = await catalogo(db);
	const codes = cat.map((f) => f.code);
	const membros = await membrosDaTurma(db, turmaId, codes.length);
	const copias = await copiasDosMembros(
		db,
		membros.map((m) => m.id)
	);
	const cards: CardTroca[] = membros
		.filter((m) => m.id !== me)
		.map((m) => {
			const troca = trocas(copias[me] ?? {}, copias[m.id] ?? {}, codes);
			return {
				id: m.id,
				displayName: m.displayName,
				percentual: m.percentual,
				troca,
				justa: selecionarJusta(troca),
				dica: dicaTroca(m.displayName, troca)
			};
		})
		.sort(
			(a, b) =>
				b.troca.iGive.length +
				b.troca.iReceive.length -
				(a.troca.iGive.length + a.troca.iReceive.length)
		);
	const procuradas = maisProcuradas(Object.values(copias), codes, 8).filter(
		(p) => p.needed >= Math.min(2, membros.length)
	);
	return {
		cards,
		procuradas,
		tamanho: membros.length,
		porCodigo: new Map(cat.map((f) => [f.code, f]))
	};
}

export type ResultadoTroca =
	{ ok: true; dar: string[]; receber: string[] } | { ok: false; motivo: string };

/** Aplica a troca nos dois álbuns, validando o estado atual (evita troca dupla). */
export async function aplicarTroca(
	db: Db,
	turmaId: string,
	me: string,
	outro: string,
	dar: string[],
	receber: string[]
): Promise<ResultadoTroca> {
	if (me === outro) return { ok: false, motivo: 'Não dá para trocar consigo.' };
	const [t1, t2] = await Promise.all([
		turmaDoUsuario(db, turmaId, me),
		turmaDoUsuario(db, turmaId, outro)
	]);
	if (!t1 || !t2) return { ok: false, motivo: 'Vocês dois precisam estar na turma.' };
	const copias = await copiasDosMembros(db, [me, outro]);
	const minhas = copias[me];
	const dele = copias[outro];
	for (const c of dar)
		if ((minhas[c] ?? 0) < 2 || (dele[c] ?? 0) !== 0)
			return { ok: false, motivo: `A figurinha ${c} não está mais disponível para dar.` };
	for (const c of receber)
		if ((dele[c] ?? 0) < 2 || (minhas[c] ?? 0) !== 0)
			return { ok: false, motivo: `A figurinha ${c} não está mais disponível para receber.` };
	const now = Date.now();
	for (const c of dar) {
		await setCopias(db, me, c, minhas[c] - 1, now);
		await setCopias(db, outro, c, 1, now);
	}
	for (const c of receber) {
		await setCopias(db, outro, c, dele[c] - 1, now);
		await setCopias(db, me, c, 1, now);
	}
	return { ok: true, dar, receber };
}

export type Vizinho = { id: string; displayName: string; turmaId: string; turmaName: string };
export type VizinhosPorCodigo = Record<string, { precisam: Vizinho[]; temRepetida: Vizinho[] }>;

/** Para cada código, quem (nas minhas turmas) precisa dele e quem tem repetida. */
export async function vizinhosPorCodigo(
	db: Db,
	me: string,
	codes: string[]
): Promise<VizinhosPorCodigo> {
	const minhas = await db
		.select({ turmaId: schema.turmaMembros.turmaId })
		.from(schema.turmaMembros)
		.where(eq(schema.turmaMembros.userId, me));
	const out: VizinhosPorCodigo = {};
	if (!minhas.length) return out;
	const turmaIds = minhas.map((t) => t.turmaId);
	const outros = await db
		.select({
			id: schema.users.id,
			displayName: schema.users.displayName,
			turmaId: schema.turmas.id,
			turmaName: schema.turmas.name
		})
		.from(schema.turmaMembros)
		.innerJoin(schema.users, eq(schema.users.id, schema.turmaMembros.userId))
		.innerJoin(schema.turmas, eq(schema.turmas.id, schema.turmaMembros.turmaId))
		.where(inArray(schema.turmaMembros.turmaId, turmaIds))
		.orderBy(asc(schema.turmaMembros.joinedAt));
	const vistos = new Map<string, Vizinho>();
	for (const o of outros) if (o.id !== me && !vistos.has(o.id)) vistos.set(o.id, o);
	if (!vistos.size) return out;
	const copias = await copiasDosMembros(db, [...vistos.keys()]);
	for (const code of codes) {
		const precisam: Vizinho[] = [];
		const temRepetida: Vizinho[] = [];
		for (const v of vistos.values()) {
			const c = copias[v.id][code] ?? 0;
			if (c === 0) precisam.push(v);
			else if (c > 1) temRepetida.push(v);
		}
		if (precisam.length || temRepetida.length) out[code] = { precisam, temRepetida };
	}
	return out;
}

export const _ne = ne;
