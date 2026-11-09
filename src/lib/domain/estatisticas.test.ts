import { describe, expect, it } from 'vitest';
import {
	SEMANA_MS,
	custoAvulsas,
	estimativaColecionador,
	estimativaObservada,
	mediaSemanal,
	ritmoSemanal,
	sparklinePath
} from './estatisticas.js';

const now = 10 * SEMANA_MS;

describe('ritmoSemanal', () => {
	it('conta novas (0→1) e lançadas por semana, ignorando repetidas nas novas', () => {
		const ev = [
			{ stickerCode: '1', delta: 1, at: now - 0.5 * SEMANA_MS }, // semana atual: nova
			{ stickerCode: '1', delta: 1, at: now - 0.4 * SEMANA_MS }, // repetida
			{ stickerCode: '2', delta: 1, at: now - 1.5 * SEMANA_MS }, // semana anterior: nova
			{ stickerCode: '3', delta: 1, at: now - 9 * SEMANA_MS } // fora da janela de 8
		];
		const s = ritmoSemanal(ev, now, 8);
		expect(s).toHaveLength(8);
		expect(s[7]).toMatchObject({ novas: 1, lancadas: 2 });
		expect(s[6]).toMatchObject({ novas: 1, lancadas: 1 });
		expect(s.slice(0, 6).every((x) => x.novas === 0 && x.lancadas === 0)).toBe(true);
	});
	it('desmarcar na mesma semana desfaz a nova', () => {
		const ev = [
			{ stickerCode: '1', delta: 1, at: now - 0.5 * SEMANA_MS },
			{ stickerCode: '1', delta: -1, at: now - 0.4 * SEMANA_MS }
		];
		expect(ritmoSemanal(ev, now, 2)[1].novas).toBe(0);
	});
	it('replay considera histórico anterior à janela (não conta como nova de novo)', () => {
		const ev = [
			{ stickerCode: '1', delta: 1, at: now - 20 * SEMANA_MS },
			{ stickerCode: '1', delta: 1, at: now - 0.5 * SEMANA_MS }
		];
		expect(ritmoSemanal(ev, now, 2)[1]).toMatchObject({ novas: 0, lancadas: 1 });
	});
});

describe('mediaSemanal', () => {
	it('faz a média desde a primeira semana com atividade, sem a semana atual', () => {
		const s = ritmoSemanal([], now, 4).map((x, i) => ({
			...x,
			novas: [0, 10, 20, 99][i],
			lancadas: [0, 12, 25, 100][i]
		}));
		expect(mediaSemanal(s)).toBe(15);
	});
	it('só a semana atual com dados: usa ela mesma', () => {
		const s = ritmoSemanal([], now, 3).map((x, i) => ({
			...x,
			novas: [0, 0, 4][i],
			lancadas: [0, 0, 5][i]
		}));
		expect(mediaSemanal(s)).toBe(4);
	});
});

describe('estimativas', () => {
	it('colecionador de cupons: N·H(m)', () => {
		const e = estimativaColecionador(276, 1);
		expect(e.figurinhas).toBe(276);
		expect(e.envelopes).toBe(56);
		expect(e.custo).toBe(280);
		expect(estimativaColecionador(276, 0).envelopes).toBe(0);
	});
	it('observada usa a taxa novas/lançadas', () => {
		expect(estimativaObservada(89, 20, 50)).toEqual({ taxa: 0.4, envelopes: 45, custo: 225 });
		expect(estimativaObservada(89, 0, 0)).toBeNull();
		expect(estimativaObservada(89, 2, 5)).toBeNull(); // poucas lançadas: cai no modelo clássico
	});
	it('avulsas a R$ 1', () => {
		expect(custoAvulsas(89)).toBe(89);
	});
});

describe('sparklinePath', () => {
	it('gera um ponto por valor dentro da caixa', () => {
		const { d, pontos } = sparklinePath([1, 3, 2], 320, 96);
		expect(pontos).toHaveLength(3);
		expect(d.startsWith('M8 ')).toBe(true);
		expect(pontos.every((p) => p.y >= 0 && p.y <= 96)).toBe(true);
		expect(pontos[1].y).toBeLessThan(pontos[0].y);
	});
});
