import { describe, expect, it } from 'vitest';
import { evaluateWindow } from './ratelimit.js';

describe('evaluateWindow', () => {
	it('abre janela nova quando não há estado', () => {
		const { next, result } = evaluateWindow(null, 1000, 3, 60_000);
		expect(next).toEqual({ windowStart: 1000, count: 1 });
		expect(result).toEqual({ allowed: true, remaining: 2, retryAfterMs: 0 });
	});
	it('bloqueia ao passar do limite e informa retryAfter', () => {
		const { result } = evaluateWindow({ windowStart: 1000, count: 3 }, 2000, 3, 60_000);
		expect(result.allowed).toBe(false);
		expect(result.retryAfterMs).toBe(59_000);
	});
	it('reinicia a janela quando ela venceu', () => {
		const { next, result } = evaluateWindow({ windowStart: 1000, count: 99 }, 61_000, 3, 60_000);
		expect(next).toEqual({ windowStart: 61_000, count: 1 });
		expect(result.allowed).toBe(true);
	});
});
