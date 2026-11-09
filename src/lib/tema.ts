export type Tema = 'claro' | 'escuro' | 'auto';
const KEY = 'caderninho:tema';

export function lerTema(): Tema {
	try {
		const t = localStorage.getItem(KEY);
		return t === 'claro' || t === 'escuro' ? t : 'auto';
	} catch {
		return 'auto';
	}
}

export function aplicarTema(t: Tema) {
	try {
		localStorage.setItem(KEY, t);
	} catch {
		/* sem storage */
	}
	const dark =
		t === 'escuro' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.toggleAttribute('data-theme', dark);
	if (dark) document.documentElement.setAttribute('data-theme', 'dark');
}
