/** Regras puras da tela de Estatísticas. */
export type Evento = { stickerCode: string; delta: number; at: number };

export const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export type Semana = { inicio: number; fim: number; novas: number; lancadas: number };

/**
 * Replays os eventos (ordem cronológica) e conta, por semana, quantas figurinhas
 * ficaram "novas" (0 → ≥1) e quantas cópias foram lançadas (deltas positivos).
 * As semanas são janelas de 7 dias encerrando em `now` (a última é a atual).
 */
export function ritmoSemanal(eventos: Evento[], now: number, semanas = 8): Semana[] {
	const out: Semana[] = [];
	for (let i = semanas - 1; i >= 0; i--) {
		const fim = now - i * SEMANA_MS;
		out.push({ inicio: fim - SEMANA_MS, fim, novas: 0, lancadas: 0 });
	}
	const ordenados = [...eventos].sort((a, b) => a.at - b.at);
	const copias = new Map<string, number>();
	const limiteInferior = out[0].inicio;
	for (const e of ordenados) {
		const antes = copias.get(e.stickerCode) ?? 0;
		const depois = Math.max(0, antes + e.delta);
		copias.set(e.stickerCode, depois);
		if (e.at < limiteInferior || e.at > now) continue;
		const idx = Math.min(out.length - 1, Math.floor((e.at - limiteInferior) / SEMANA_MS));
		const s = out[idx];
		if (e.delta > 0) s.lancadas += e.delta;
		if (antes === 0 && depois > 0) s.novas++;
		if (antes > 0 && depois === 0) s.novas = Math.max(0, s.novas - 1);
	}
	return out;
}

/** Média de novas por semana desde a primeira semana com atividade; ignora a semana atual quando há outras. */
export function mediaSemanal(semanas: Semana[]): number {
	const primeira = semanas.findIndex((s) => s.novas > 0 || s.lancadas > 0);
	if (primeira < 0) return 0;
	const desde = semanas.slice(primeira);
	const base = desde.length > 1 ? desde.slice(0, -1) : desde;
	const n = base.reduce((a, s) => a + s.novas, 0);
	return Math.round(n / base.length);
}

/** Colecionador de cupons sem trocas: E[figurinhas] = N · H(m). */
export function estimativaColecionador(
	total: number,
	faltam: number,
	porEnvelope = 5,
	precoEnvelope = 5
) {
	let h = 0;
	for (let k = 1; k <= faltam; k++) h += 1 / k;
	const figurinhas = total * h;
	const envelopes = Math.ceil(figurinhas / porEnvelope);
	return { figurinhas: Math.round(figurinhas), envelopes, custo: envelopes * precoEnvelope };
}

/** Estimativa pela taxa de novas observada (novas / lançadas) nas últimas semanas. */
export function estimativaObservada(
	faltam: number,
	novas: number,
	lancadas: number,
	porEnvelope = 5,
	precoEnvelope = 5
) {
	if (lancadas === 0 || novas === 0) return null;
	const taxa = Math.min(1, novas / lancadas);
	const envelopes = Math.ceil(faltam / (porEnvelope * taxa));
	return { taxa, envelopes, custo: envelopes * precoEnvelope };
}

export function custoAvulsas(faltam: number, precoAvulsa = 1) {
	return faltam * precoAvulsa;
}

export function formatarBRL(v: number): string {
	return v.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0
	});
}

/** Caminho SVG suave (Catmull-Rom → Bézier) para a sparkline. */
export function sparklinePath(
	valores: number[],
	w = 320,
	h = 96,
	pad = 8
): { d: string; pontos: { x: number; y: number }[] } {
	if (!valores.length) return { d: '', pontos: [] };
	const max = Math.max(1, ...valores);
	const n = valores.length;
	const pontos = valores.map((v, i) => ({
		x: n === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (n - 1),
		y: h - pad - (v / max) * (h - 2 * pad - 6)
	}));
	if (n === 1) return { d: `M${pontos[0].x} ${pontos[0].y}`, pontos };
	let d = `M${r(pontos[0].x)} ${r(pontos[0].y)}`;
	for (let i = 0; i < n - 1; i++) {
		const p0 = pontos[i - 1] ?? pontos[i];
		const p1 = pontos[i];
		const p2 = pontos[i + 1];
		const p3 = pontos[i + 2] ?? p2;
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(p2.x)} ${r(p2.y)}`;
	}
	return { d, pontos };
}
const r = (n: number) => Math.round(n * 10) / 10;
