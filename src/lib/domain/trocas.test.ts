import { describe, expect, it } from 'vitest';
import { maisProcuradas, trocas, type Copias } from './trocas.js';

const codes = ['1', '2', '3', '4', 'A1'];

describe('trocas', () => {
	it('dá repetidas minhas que o outro não tem e recebe o contrário', () => {
		const me = { '1': 2, '2': 1, '3': 0, A1: 3 };
		const other = { '1': 0, '2': 2, '3': 2, A1: 0 };
		expect(trocas(me, other, codes)).toEqual({ iGive: ['1', 'A1'], iReceive: ['3'], fair: 1 });
	});

	it('não oferece figurinha que o outro já colou nem a única cópia minha', () => {
		const me = { '1': 2, '2': 1 };
		const other = { '1': 1, '2': 0 };
		expect(trocas(me, other, codes)).toEqual({ iGive: [], iReceive: [], fair: 0 });
	});
});

describe('maisProcuradas', () => {
	it('ordena por quantos membros precisam, depois por código numérico', () => {
		const members: Copias[] = [
			{ '1': 1, '2': 0 },
			{ '1': 0, '2': 0 },
			{ '1': 1, '2': 0, '4': 1 }
		];
		expect(maisProcuradas(members, codes, 3)).toEqual([
			{ code: '2', needed: 3 },
			{ code: '3', needed: 3 },
			{ code: 'A1', needed: 3 }
		]);
	});
});
