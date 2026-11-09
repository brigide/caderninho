import { describe, expect, it } from 'vitest';
import { hashPassword, timingSafeEqual, verifyPassword } from './password.js';

describe('password', () => {
	it('verifica a senha correta e rejeita a errada', async () => {
		const rec = await hashPassword('segredo-muito-bom');
		expect(rec.iters).toBe(100000);
		expect(rec.salt).not.toBe('');
		expect(await verifyPassword('segredo-muito-bom', rec)).toBe(true);
		expect(await verifyPassword('segredo-muito-bo', rec)).toBe(false);
	});

	it('gera salts diferentes para a mesma senha', async () => {
		const a = await hashPassword('x'.repeat(8));
		const b = await hashPassword('x'.repeat(8));
		expect(a.salt).not.toBe(b.salt);
		expect(a.hash).not.toBe(b.hash);
	});

	it('timingSafeEqual compara por conteúdo e tamanho', () => {
		expect(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
		expect(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
		expect(timingSafeEqual(new Uint8Array([1]), new Uint8Array([1, 0]))).toBe(false);
	});
});
