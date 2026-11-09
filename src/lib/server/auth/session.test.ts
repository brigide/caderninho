import { describe, expect, it } from 'vitest';
import { RENEW_BEFORE_MS, SESSION_TTL_MS, isExpired, randomToken, shouldRenew } from './session.js';

describe('session helpers', () => {
	it('expira quando expiresAt já passou', () => {
		expect(isExpired(1000, 1000)).toBe(true);
		expect(isExpired(1001, 1000)).toBe(false);
	});
	it('renova só quando falta menos que RENEW_BEFORE_MS', () => {
		const now = 1_000_000;
		expect(shouldRenew(now + SESSION_TTL_MS, now)).toBe(false);
		expect(shouldRenew(now + RENEW_BEFORE_MS - 1, now)).toBe(true);
	});
	it('gera tokens url-safe e distintos', () => {
		const a = randomToken();
		const b = randomToken();
		expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(a).not.toBe(b);
	});
});
