import type { Copias, Figurinha, Filtro, Secao } from './domain/album.js';
import { contagemFiltros, resumo } from './domain/album.js';

export class Album {
	catalogo: Figurinha[] = [];
	secoes: Secao[] = [];
	porCodigo: Map<string, Figurinha> = new Map();
	copias = $state<Copias>({});
	filtro = $state<Filtro>('all');
	busca = $state('');
	/** código que acabou de ser colado (anima o "stick") */
	pop = $state<string | null>(null);
	erro = $state<string | null>(null);
	pendentes = $state(0);

	resumo = $derived(resumo(this.catalogo, this.secoes, this.copias));
	contagem = $derived(contagemFiltros(this.catalogo, this.copias));

	constructor(catalogo: Figurinha[], secoes: Secao[], copias: Copias) {
		this.catalogo = catalogo;
		this.secoes = secoes;
		this.porCodigo = new Map(catalogo.map((f) => [f.code, f]));
		this.copias = { ...copias };
	}

	get(code: string): number {
		return this.copias[code] ?? 0;
	}

	existe(code: string): boolean {
		return this.porCodigo.has(code);
	}

	/** Define o valor com atualização otimista; devolve o valor anterior. Reverte se a API falhar. */
	async definir(code: string, alvo: number): Promise<number> {
		const antes = this.get(code);
		const depois = Math.max(0, alvo);
		if (antes === depois) return antes;
		this.copias[code] = depois;
		this.pop = antes === 0 && depois > 0 ? code : null;
		this.pendentes++;
		try {
			const res = await fetch(`/api/figurinhas/${encodeURIComponent(code)}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ set: depois })
			});
			if (!res.ok) throw new Error(String(res.status));
			const data = (await res.json()) as { copias: number };
			this.copias[code] = data.copias;
			this.erro = null;
		} catch {
			this.copias[code] = antes;
			this.erro = 'Não consegui salvar. Confira a conexão e tente de novo.';
		} finally {
			this.pendentes--;
		}
		return antes;
	}

	/** Toque simples: cola se faltando; desmarca se já tem. */
	alternar(code: string) {
		return this.definir(code, this.get(code) > 0 ? 0 : 1);
	}
	lancar(code: string) {
		return this.definir(code, this.get(code) + 1);
	}
	remover(code: string) {
		return this.definir(code, this.get(code) - 1);
	}
}
