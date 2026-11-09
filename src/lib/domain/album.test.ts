import { describe, expect, it } from 'vitest';
import { contagemFiltros, passaFiltro, resumo, type Figurinha, type Secao } from './album.js';

const secoes: Secao[] = [
	{ id: 'spring', name: 'Primavera', position: 1 },
	{ id: 'summer', name: 'Verão', position: 2 }
];
const cat: Figurinha[] = [
	{ code: '1', sortOrder: 1, sectionId: 'spring', kind: 'regular', page: 2 },
	{ code: '2', sortOrder: 2, sectionId: 'spring', kind: 'especial', page: 2 },
	{ code: 'A1', sortOrder: 3, sectionId: 'summer', kind: 'ameba', page: 9 }
];

describe('resumo', () => {
	it('conta coladas, faltantes, repetidas e percentual', () => {
		const r = resumo(cat, secoes, { '1': 3, '2': 1 });
		expect(r).toMatchObject({
			total: 3,
			coladas: 2,
			faltam: 1,
			repetidas: 2,
			comRepetida: 1,
			percentual: 67
		});
		expect(r.porEstacao.spring).toEqual({ coladas: 2, total: 2 });
		expect(r.porEstacao.summer).toEqual({ coladas: 0, total: 1 });
		expect(r.porTipo.ameba).toEqual({ coladas: 0, total: 1 });
	});
});

describe('passaFiltro', () => {
	it('filtra por estado, tipo e prefixo do código', () => {
		expect(passaFiltro(cat[0], 0, 'miss', '')).toBe(true);
		expect(passaFiltro(cat[0], 1, 'miss', '')).toBe(false);
		expect(passaFiltro(cat[0], 2, 'dup', '')).toBe(true);
		expect(passaFiltro(cat[2], 0, 'ameba', 'a')).toBe(true);
		expect(passaFiltro(cat[2], 0, 'all', '1')).toBe(false);
	});
});

describe('contagemFiltros', () => {
	it('devolve a contagem de cada chip', () => {
		expect(contagemFiltros(cat, { '1': 2 })).toEqual({
			all: 3,
			miss: 2,
			have: 1,
			dup: 1,
			reg: 1,
			esp: 1,
			ameba: 1
		});
	});
});
