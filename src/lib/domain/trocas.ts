/** code -> copias (0 faltando · 1 colada · 2+ repetida). Mesmo modelo do handoff (js/data.js). */
export type Copias = Record<string, number>;

export type Troca = { iGive: string[]; iReceive: string[]; fair: number };

/** Trocas entre mim e outro: dou repetidas minhas que ele não tem; recebo o contrário. */
export function trocas(me: Copias, other: Copias, codes: string[]): Troca {
	const iGive = codes.filter((c) => (me[c] ?? 0) > 1 && (other[c] ?? 0) === 0);
	const iReceive = codes.filter((c) => (other[c] ?? 0) > 1 && (me[c] ?? 0) === 0);
	return { iGive, iReceive, fair: Math.min(iGive.length, iReceive.length) };
}

/** Códigos que mais membros ainda precisam, com a contagem. */
export function maisProcuradas(members: Copias[], codes: string[], limit = 10) {
	return codes
		.map((code) => ({ code, needed: members.filter((m) => (m[code] ?? 0) === 0).length }))
		.filter((x) => x.needed > 0)
		.sort(
			(a, b) => b.needed - a.needed || a.code.localeCompare(b.code, undefined, { numeric: true })
		)
		.slice(0, limit);
}
