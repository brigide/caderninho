import { describe, expect, it } from 'vitest';
import { corAvatar, gerarCodigoConvite, normalizarCodigo } from './turmas.js';

describe('gerarCodigoConvite', () => {
	it('tem o formato PALAVRA-XXXX sem caracteres ambíguos', () => {
		for (let i = 0; i < 50; i++)
			expect(gerarCodigoConvite()).toMatch(/^[A-Z]+-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
	});
	it('é determinístico dado o gerador', () => {
		expect(gerarCodigoConvite(() => 0)).toBe('PRIMAVERA-AAAA');
	});
});

describe('normalizarCodigo / corAvatar', () => {
	it('normaliza espaços e caixa', () => {
		expect(normalizarCodigo(' outono-7kq2 ')).toBe('OUTONO-7KQ2');
	});
	it('cicla as cores', () => {
		expect(corAvatar(0)).toBe('blue');
		expect(corAvatar(5)).toBe('pink');
	});
});
