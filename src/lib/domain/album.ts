/** Regras puras do álbum (espelham js/data.js do handoff). */
export type Tipo = 'regular' | 'especial' | 'ameba';
export type Figurinha = {
	code: string;
	sortOrder: number;
	sectionId: string;
	kind: Tipo;
	page: number | null;
};
export type Secao = { id: string; name: string; position: number };
export type Copias = Record<string, number>;
export type Filtro = 'all' | 'miss' | 'have' | 'dup' | 'reg' | 'esp' | 'ameba';

export const FILTROS: { id: Filtro; label: string }[] = [
	{ id: 'all', label: 'Todas' },
	{ id: 'miss', label: 'Faltando' },
	{ id: 'have', label: 'Coladas' },
	{ id: 'dup', label: 'Repetidas' },
	{ id: 'reg', label: 'Regular' },
	{ id: 'esp', label: 'Especial' },
	{ id: 'ameba', label: 'Ameba' }
];

export function passaFiltro(f: Figurinha, c: number, filtro: Filtro, busca: string): boolean {
	const ok =
		filtro === 'all' ||
		(filtro === 'miss' && c === 0) ||
		(filtro === 'have' && c > 0) ||
		(filtro === 'dup' && c > 1) ||
		(filtro === 'reg' && f.kind === 'regular') ||
		(filtro === 'esp' && f.kind === 'especial') ||
		(filtro === 'ameba' && f.kind === 'ameba');
	if (!ok) return false;
	const b = busca.trim().toUpperCase();
	return !b || f.code.toUpperCase().startsWith(b);
}

export type Resumo = {
	total: number;
	coladas: number;
	faltam: number;
	repetidas: number; // soma de (copias-1)
	comRepetida: number; // nº de códigos com copias>1
	percentual: number;
	porEstacao: Record<string, { coladas: number; total: number }>;
	porTipo: Record<Tipo, { coladas: number; total: number }>;
};

export function resumo(catalogo: Figurinha[], secoes: Secao[], copias: Copias): Resumo {
	const r: Resumo = {
		total: catalogo.length,
		coladas: 0,
		faltam: 0,
		repetidas: 0,
		comRepetida: 0,
		percentual: 0,
		porEstacao: {},
		porTipo: {
			regular: { coladas: 0, total: 0 },
			especial: { coladas: 0, total: 0 },
			ameba: { coladas: 0, total: 0 }
		}
	};
	for (const s of secoes) r.porEstacao[s.id] = { coladas: 0, total: 0 };
	for (const f of catalogo) {
		const c = copias[f.code] ?? 0;
		const e = (r.porEstacao[f.sectionId] ??= { coladas: 0, total: 0 });
		e.total++;
		r.porTipo[f.kind].total++;
		if (c > 0) {
			r.coladas++;
			e.coladas++;
			r.porTipo[f.kind].coladas++;
		} else r.faltam++;
		if (c > 1) {
			r.repetidas += c - 1;
			r.comRepetida++;
		}
	}
	r.percentual = r.total ? Math.round((r.coladas / r.total) * 100) : 0;
	return r;
}

export function contagemFiltros(catalogo: Figurinha[], copias: Copias): Record<Filtro, number> {
	const n: Record<Filtro, number> = {
		all: catalogo.length,
		miss: 0,
		have: 0,
		dup: 0,
		reg: 0,
		esp: 0,
		ameba: 0
	};
	for (const f of catalogo) {
		const c = copias[f.code] ?? 0;
		if (c === 0) n.miss++;
		else n.have++;
		if (c > 1) n.dup++;
		if (f.kind === 'regular') n.reg++;
		else if (f.kind === 'especial') n.esp++;
		else n.ameba++;
	}
	return n;
}

export function rotuloCelula(f: Figurinha, c: number): string {
	return (
		`Figurinha ${f.code}` +
		(f.kind !== 'regular' ? `, ${f.kind}` : '') +
		(c === 0 ? ', faltando' : c === 1 ? ', colada' : `, colada, ${c} cópias`)
	);
}
