<script lang="ts">
	import type { PageProps } from './$types';
	import { formatarBRL, sparklinePath } from '#lib/domain/estatisticas.js';

	let { data }: PageProps = $props();

	const r = $derived(data.resumo);
	const circ = 2 * Math.PI * 36;
	const dash = $derived(
		`${((r.percentual / 100) * circ).toFixed(1)} ${(circ - (r.percentual / 100) * circ).toFixed(1)}`
	);

	const valores = $derived(data.semanas.map((s) => s.novas));
	const spark = $derived(sparklinePath(valores, 320, 96));
	const idxMax = $derived(valores.indexOf(Math.max(...valores)));
	const temDados = $derived(valores.some((v) => v > 0));

	const fmtDia = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
	const fmtMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
	function periodo(s: { inicio: number; fim: number }) {
		return `${fmtDia.format(s.inicio)} – ${fmtDia.format(s.fim - 1)}`;
	}
	const meses = $derived(
		[0, Math.floor(data.semanas.length / 2), data.semanas.length - 1].map((i) =>
			fmtMes.format(data.semanas[i].fim - 1).replace('.', '')
		)
	);
	const tipos = [
		{ id: 'regular', label: 'Regular' },
		{ id: 'especial', label: 'Especial' },
		{ id: 'ameba', label: 'Ameba' }
	] as const;
	const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
	const est = $derived(data.estimativa);
	const principal = $derived(est.observada ?? est.colecionador);
	let mostrarTabela = $state(false);
</script>

<svelte:head><title>Estatísticas · Caderninho de Figurinhas</title></svelte:head>

<main class="screen__main" style="gap:22px;padding-bottom:120px">
	<div>
		<h1 class="display-l">Estatísticas</h1>
		<p class="small muted" style="font-size:14px;margin-top:2px">
			{#if data.envelopesAbertos}≈ {data.envelopesAbertos}
				{data.envelopesAbertos === 1 ? 'envelope aberto' : 'envelopes abertos'}{:else}Nenhuma
				figurinha lançada ainda{/if}
		</p>
	</div>

	<div class="kpis">
		<div class="card kpi" style="align-items:center">
			<span
				class="washi"
				aria-hidden="true"
				style="top:-10px;left:30px;width:70px;transform:rotate(-5deg)"
			></span>
			<svg
				width="92"
				height="92"
				viewBox="0 0 92 92"
				role="img"
				aria-label="{r.percentual}% completo"
			>
				<circle class="ring-track" cx="46" cy="46" r="36" fill="none" stroke-width="12" />
				<circle
					cx="46"
					cy="46"
					r="36"
					fill="none"
					stroke="var(--grass)"
					stroke-width="12"
					stroke-dasharray={dash}
					stroke-linecap="round"
					transform="rotate(-90 46 46)"
				/>
				<text
					x="46"
					y="53"
					text-anchor="middle"
					font-family="Nunito, sans-serif"
					font-weight="800"
					font-size="21"
					fill="var(--ink)">{r.percentual}%</text
				>
			</svg>
			<span class="strong" style="font-size:14px">completo</span>
		</div>
		<div class="card card--surface kpi">
			<span
				class="washi washi--blue"
				aria-hidden="true"
				style="top:-10px;right:22px;width:70px;transform:rotate(4deg)"
			></span>
			<span class="overline" style="font-size:11px">Faltam</span>
			<span class="big">{r.faltam}</span>
			<span style="font-size:14px">de {r.total} figurinhas</span>
			<a href="/album" class="strong small" style="margin-top:auto">Ver faltando →</a>
		</div>
		<div class="card card--yellow kpi">
			<span
				class="washi washi--pink"
				aria-hidden="true"
				style="top:-10px;left:24px;width:70px;transform:rotate(3deg)"
			></span>
			<span class="overline" style="font-size:11px">Repetidas</span>
			<span class="big">{r.repetidas}</span>
			<span style="font-size:14px">prontas para trocar</span>
		</div>
		<div class="card kpi">
			<span
				class="washi washi--green"
				aria-hidden="true"
				style="top:-10px;right:28px;width:70px;transform:rotate(-3deg)"
			></span>
			<span class="overline" style="font-size:11px">Ritmo</span>
			<span class="big">{data.ritmo}</span>
			<span style="font-size:14px">figurinhas novas por semana</span>
		</div>
	</div>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<h2 class="display-s" style="font-size:26px">Por estação</h2>
		{#each data.sections as s (s.id)}
			{@const e = r.porEstacao[s.id]}
			<div class="stat-row">
				<span>{s.name}</span>
				<div class="track track--lg" role="img" aria-label="{s.name}: {e.coladas} de {e.total}">
					<span class="fill--{s.id}" style="width:{pct(e.coladas, e.total)}%"></span>
				</div>
				<span class="num">{e.coladas}/{e.total}</span>
			</div>
		{/each}
	</section>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<h2 class="display-s" style="font-size:26px">Por tipo</h2>
		{#each tipos as t (t.id)}
			{@const e = r.porTipo[t.id]}
			<div class="stat-row">
				<span>{t.label}</span>
				<div
					class="track track--lg"
					role="img"
					aria-label="{t.label}: {e.coladas} de {e.total}"
					style={t.id === 'ameba' ? 'border-radius:10px 4px 9px 5px' : ''}
				>
					{#if t.id === 'especial'}
						<span
							style="width:{pct(
								e.coladas,
								e.total
							)}%;background:linear-gradient(135deg,var(--grass) 40%,var(--zigzag) 50%,var(--grass) 60%)"
						></span>
					{:else}
						<span class="fill--grass" style="width:{pct(e.coladas, e.total)}%"></span>
					{/if}
				</div>
				<span class="num">{e.coladas}/{e.total}</span>
			</div>
		{/each}
	</section>

	<section
		class="card card__pad"
		style="padding-top:20px;display:flex;flex-direction:column;gap:10px;position:relative"
	>
		<span
			class="washi"
			aria-hidden="true"
			style="top:-10px;left:50%;margin-left:-35px;width:70px;transform:rotate(2deg)"
		></span>
		{#if r.faltam > 0}
			<div class="env-stack" aria-hidden="true" style="right:16px;top:22px">
				<i></i><i></i><i></i><b>×{principal.envelopes}</b>
			</div>
			<span class="overline" style="font-size:11px">Estimativa</span>
			<p style="padding-right:92px;font-size:20px;font-weight:800;line-height:1.25">
				≈ {principal.envelopes} envelopes
				<span style="font-weight:600">(~{formatarBRL(principal.custo)})</span> para completar
			</p>
			<div style="display:flex;align-items:center;gap:10px">
				<span class="rule"></span><span class="display" style="font-size:20px">ou</span><span
					class="rule"
				></span>
			</div>
			<p style="font-size:16px">
				peça <b>{r.faltam} avulsas por {formatarBRL(est.avulsas)}</b> na Panini
			</p>
			<p style="font-size:12px">
				{#if est.observada}
					Considera {est.porEnvelope} figurinhas por envelope a {formatarBRL(est.precoEnvelope)} e sua
					taxa recente de novas ({Math.round(est.observada.taxa * 100)}% das lançadas). Sem trocas,
					o modelo clássico dá ≈ {est.colecionador.envelopes} envelopes.
				{:else}
					Modelo clássico sem trocas ({est.porEnvelope} por envelope a {formatarBRL(
						est.precoEnvelope
					)}). Fica mais preciso conforme você lança envelopes.
				{/if}
			</p>
		{:else}
			<span class="overline" style="font-size:11px">Estimativa</span>
			<p class="display-s">Álbum completo! 🎉</p>
		{/if}
	</section>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:8px">
		<div style="display:flex;justify-content:space-between;align-items:baseline">
			<h2 class="display-s" style="font-size:26px">Semana a semana</h2>
			<button
				type="button"
				class="small strong"
				style="background:none;border:0;padding:0;text-decoration:underline wavy;text-underline-offset:3px"
				aria-pressed={mostrarTabela}
				onclick={() => (mostrarTabela = !mostrarTabela)}
			>
				{mostrarTabela ? 'ver gráfico' : 'ver tabela'}
			</button>
		</div>
		{#if mostrarTabela}
			<table class="small" style="width:100%;border-collapse:collapse">
				<thead
					><tr
						><th style="text-align:left;padding:4px 0">Semana</th><th style="text-align:right"
							>Novas</th
						><th style="text-align:right">Lançadas</th></tr
					></thead
				>
				<tbody>
					{#each data.semanas as s (s.inicio)}
						<tr style="border-top:1px dashed var(--rule)"
							><td style="padding:4px 0">{periodo(s)}</td><td class="num" style="text-align:right"
								>{s.novas}</td
							><td class="num" style="text-align:right">{s.lancadas}</td></tr
						>
					{/each}
				</tbody>
			</table>
		{:else}
			<svg
				width="100%"
				height="96"
				viewBox="0 0 320 96"
				role="img"
				aria-label="Figurinhas novas por semana: {valores.join(', ')}"
			>
				<path
					d="M4 88 L316 88"
					stroke="var(--ink)"
					stroke-width="1.2"
					stroke-dasharray="4 4"
					opacity=".4"
				/>
				{#if temDados}
					<path
						d={spark.d}
						fill="none"
						stroke="var(--doghouse)"
						stroke-width="2.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					{#each spark.pontos as p, i (i)}
						<circle
							cx={p.x}
							cy={p.y}
							r={i === idxMax || i === spark.pontos.length - 1 ? 4.5 : 3}
							fill={i === idxMax ? 'var(--zigzag)' : 'var(--doghouse)'}
							stroke="var(--ink)"
							stroke-width="1.5"
						>
							<title
								>{periodo(data.semanas[i])}: {data.semanas[i].novas} novas, {data.semanas[i]
									.lancadas} lançadas</title
							>
						</circle>
					{/each}
				{:else}
					<text x="160" y="52" text-anchor="middle" font-size="13" fill="var(--ink-soft)"
						>Lance figurinhas para ver seu ritmo aqui</text
					>
				{/if}
			</svg>
			<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700">
				{#each meses as m, i (i)}<span>{m}</span>{/each}
			</div>
		{/if}
		{#if temDados}
			<p class="small">Melhor semana: <b>{data.melhor.novas} novas</b> ({periodo(data.melhor)}).</p>
		{/if}
	</section>
</main>

<style>
	.big {
		font-size: 38px;
		font-weight: 800;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px 14px;
		padding-top: 6px;
	}
	.kpi {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px 14px 14px;
	}
	.ring-track {
		stroke: var(--paper);
	}
</style>
