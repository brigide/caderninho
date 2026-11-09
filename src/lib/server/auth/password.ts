/** Hash de senha com PBKDF2-SHA-256 via WebCrypto (nativo no Workers e no Node). */
const ITERATIONS = 100_000;
const KEY_BYTES = 32;
const SALT_BYTES = 16;

const enc = new TextEncoder();

export type PasswordRecord = { hash: string; salt: string; iters: number };

function toB64(bytes: ArrayBuffer | Uint8Array): string {
	const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let s = '';
	for (const b of u8) s += String.fromCharCode(b);
	return btoa(s);
}

function fromB64(s: string): Uint8Array {
	const bin = atob(s);
	const u8 = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
	return u8;
}

async function derive(password: string, salt: Uint8Array, iters: number): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: iters },
		key,
		KEY_BYTES * 8
	);
	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<PasswordRecord> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = await derive(password, salt, ITERATIONS);
	return { hash: toB64(hash), salt: toB64(salt), iters: ITERATIONS };
}

/** Comparação em tempo constante. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export async function verifyPassword(password: string, rec: PasswordRecord): Promise<boolean> {
	const expected = fromB64(rec.hash);
	const actual = await derive(password, fromB64(rec.salt), rec.iters);
	return timingSafeEqual(actual, expected);
}
