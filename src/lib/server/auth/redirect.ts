/** Só aceita caminhos internos (evita open redirect via ?next=). */
export function safeNext(next: string | null | undefined, fallback = '/album'): string {
	if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\'))
		return fallback;
	return next;
}
