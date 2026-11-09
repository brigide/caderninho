import { describe, expect, it } from 'vitest';
import { dicaTroca, maisProcuradas, selecionarJusta, trocas, type Copias } from './trocas.js';

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

describe('selecionarJusta / dicaTroca', () => {
	it('corta cada lado no tamanho justo', () => {
		const t = { iGive: ['1', '2', '3'], iReceive: ['9'], fair: 1 };
		expect(selecionarJusta(t)).toEqual({ dar: ['1'], receber: ['9'] });
		expect(dicaTroca('Ana', t)).toBe('você tem 2 sobrando para Ana');
	});
	it('dicas para os outros casos', () => {
		expect(dicaTroca('Ana', { iGive: ['1'], iReceive: ['2'], fair: 1 })).toBe('tudo bate certinho');
		expect(dicaTroca('Ana', { iGive: [], iReceive: ['2', '3'], fair: 0 })).toBe(
			'Ana tem 2 a mais para você'
		);
		expect(dicaTroca('Ana', { iGive: [], iReceive: [], fair: 0 })).toBe(
			'nada para trocar por enquanto'
		);
	});
});
