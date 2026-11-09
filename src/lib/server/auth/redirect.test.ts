import { describe, expect, it } from 'vitest';
import { safeNext } from './redirect.js';

describe('safeNext', () => {
	it('aceita caminhos internos', () => {
		expect(safeNext('/turmas/abc?x=1')).toBe('/turmas/abc?x=1');
	});
	it('rejeita externos e vazios', () => {
		expect(safeNext('//evil.com')).toBe('/album');
		expect(safeNext('https://evil.com')).toBe('/album');
		expect(safeNext(null)).toBe('/album');
		expect(safeNext('/\\evil')).toBe('/album');
	});
});
