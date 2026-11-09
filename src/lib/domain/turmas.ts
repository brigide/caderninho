const PALAVRAS = [
	'PRIMAVERA',
	'VERAO',
	'OUTONO',
	'INVERNO',
	'PIPA',
	'CASINHA',
	'COBERTOR',
	'ABOBORA',
	'FLOCO',
	'PIANO',
	'CANECA',
	'FOLHA'
];
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I/L

/** Código de convite legível, ex.: OUTONO-7KQ2 (≈ 12 × 31⁴ ≈ 11 milhões de combinações). */
export function gerarCodigoConvite(rand: () => number = Math.random): string {
	const palavra = PALAVRAS[Math.floor(rand() * PALAVRAS.length)];
	let sufixo = '';
	for (let i = 0; i < 4; i++) sufixo += ALFABETO[Math.floor(rand() * ALFABETO.length)];
	return `${palavra}-${sufixo}`;
}

export function normalizarCodigo(s: string): string {
	return s.trim().toUpperCase().replace(/\s+/g, '');
}

export const CORES_AVATAR = ['blue', 'pink', 'orange', 'green'] as const;
export function corAvatar(i: number): (typeof CORES_AVATAR)[number] {
	return CORES_AVATAR[i % CORES_AVATAR.length];
}

export function inicial(nome: string): string {
	return nome.trim().charAt(0).toUpperCase() || '?';
}

export const CONVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CONVITE_MAX_USOS = 50;
