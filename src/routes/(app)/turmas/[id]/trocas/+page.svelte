<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { corAvatar, inicial } from '#lib/domain/turmas.js';

	let { data, form }: PageProps = $props();
	const comTroca = $derived(
		data.cards.filter((c) => c.troca.iGive.length + c.troca.iReceive.length > 0)
	);
	const pessoas = $derived(comTroca.length);
	let confirmando = $state<string | null>(null);
	let enviando = $state(false);
</script>

<svelte:head><title>Trocas · {data.turma.name} · Caderninho de Figurinhas</title></svelte:head>

{#snippet mini(code: string, classe: 'cell--give' | 'cell--get')}
	{@const tipo = data.tipos[code] ?? 'regular'}
	<span
		class="cell cell--sm stamp {classe}"
		class:cell--ameba={tipo === 'ameba'}
		aria-label="Figurinha {code}{tipo !== 'regular' ? ', ' + tipo : ''}"
	>
		{#if tipo === 'especial'}<svg class="cell__star" viewBox="0 0 10 10" aria-hidden="true"
				><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" /></svg
			>{/if}{code}
	</span>
{/snippet}

<main class="screen__main" style="padding-top:10px;gap:20px;padding-bottom:120px">
	<div class="page-head">
		<a
			href="/turmas/{data.turma.id}"
			class="icon-btn icon-btn--bare back"
			aria-label="Voltar para a turma"
		>
			<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
		</a>
		<div>
			<h1 class="display" style="font-size:32px">Trocas com a turma</h1>
			<p class="small strong">
				{data.turma.name}{pessoas
					? ` · ${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'} com troca`
					: ''}
			</p>
		</div>
	</div>

	{#if form?.trocado}
		<p
			class="card card--surface card__pad small strong"
			role="status"
			style="border-color:var(--grass)"
		>
			Troca registrada: você deu {form.trocado.dar.join(', ') || 'nada'} e recebeu {form.trocado.receber.join(
				', '
			) || 'nada'}. Os dois álbuns foram atualizados.
		</p>
	{/if}
	{#if form?.erro}<p class="small strong" role="alert" style="color:var(--doghouse-text)">
			{form.erro}
		</p>{/if}

	{#if data.tamanho < 2}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:0 12px"
		>
			<p class="display" style="font-size:28px;line-height:1.15">
				A turma ainda é só você. Convide alguém para começar a trocar.
			</p>
			<a href="/turmas/{data.turma.id}" class="btn btn--primary btn--block">Convidar</a>
		</div>
	{:else if !comTroca.length}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center;padding:0 12px"
		>
			<div
				class="scene-wood scene-wood--tight"
				role="img"
				aria-label="Ilustração: dois envelopes abertos e vazios ao lado de uma caneca de café numa mesa de madeira"
				style="width:290px;height:196px;border:1.5px solid #2B2622;border-radius:16px 18px 15px 17px;box-shadow:3px 4px 0 var(--shadow-color)"
			>
				<div
					class="light-beam"
					aria-hidden="true"
					style="top:-40px;left:120px;width:60px;height:300px;transform:rotate(30deg)"
				></div>
				<div
					class="env"
					aria-hidden="true"
					style="left:22px;top:92px;transform:rotate(-9deg)"
				></div>
				<div class="env" aria-hidden="true" style="left:162px;top:104px;transform:rotate(8deg)">
					<span class="env__seal"></span>
				</div>
				<span
					class="leaf leaf--copper"
					aria-hidden="true"
					style="left:248px;top:20px;width:22px;height:22px;transform:rotate(20deg)"
				></span>
				<span
					class="leaf leaf--yellow"
					aria-hidden="true"
					style="left:20px;top:22px;width:18px;height:18px;transform:rotate(-50deg)"
				></span>
				<span
					class="leaf leaf--red"
					aria-hidden="true"
					style="left:130px;top:160px;width:16px;height:16px;transform:rotate(80deg)"
				></span>
				<div
					class="mug-top mug-top--yellow"
					aria-hidden="true"
					style="--size:74px;left:112px;top:18px"
				>
					<span class="mug-top__shadow"></span><span class="mug-top__handle"></span><span
						class="mug-top__body"
					></span>
					<span class="puff puff--1"></span><span class="puff puff--2"></span><span
						class="puff puff--3"
					></span>
				</div>
			</div>
			<p class="display" style="font-size:28px;line-height:1.15">
				Por enquanto ninguém tem o que o outro precisa. Abram mais envelopes ☕
			</p>
			<a href="/album" class="btn btn--primary btn--block">
				<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
					><rect width="20" height="16" x="2" y="4" rx="2" /><path
						d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
					/></svg
				>Abrir envelope
			</a>
		</div>
	{:else}
		<div style="display:flex;flex-direction:column;gap:20px">
			{#each comTroca as m, i (m.id)}
				<article
					class="card card--surface"
					style="padding:16px 14px 14px;display:flex;flex-direction:column;gap:12px"
				>
					<div style="display:flex;align-items:center;gap:10px">
						<span class="avatar avatar--{corAvatar(i + 1)}">{inicial(m.displayName)}</span>
						<span style="display:flex;flex-direction:column"
							><span class="strong" style="font-size:17px">{m.displayName}</span><span class="small"
								>{m.percentual}% completo</span
							></span
						>
					</div>
					<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
						<div class="env-col">
							<div class="perf"></div>
							<div class="env-col__body">
								<span class="env-col__head"
									><span>Você dá</span><span>{m.troca.iGive.length}</span></span
								>
								<div class="mini-grid">
									{#each m.troca.iGive as c (c)}{@render mini(c, 'cell--give')}{/each}
								</div>
							</div>
						</div>
						<div class="env-col">
							<div class="perf"></div>
							<div class="env-col__body">
								<span class="env-col__head"
									><span>Você recebe</span><span>{m.troca.iReceive.length}</span></span
								>
								<div class="mini-grid">
									{#each m.troca.iReceive as c (c)}{@render mini(c, 'cell--get')}{/each}
								</div>
							</div>
						</div>
					</div>
					<div
						style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1.5px dashed var(--rule)"
					>
						<span style="display:flex;flex-direction:column">
							<span class="strong">Troca justa: {m.troca.fair} ↔ {m.troca.fair}</span>
							<span class="small" style="font-size:12px">{m.dica}</span>
						</span>
						{#if confirmando === m.id}
							<form
								method="POST"
								action="?/trocar"
								style="display:flex;flex-direction:column;gap:8px;width:100%"
								use:enhance={() => {
									enviando = true;
									return async ({ update }) => {
										await update();
										enviando = false;
										confirmando = null;
									};
								}}
							>
								<input type="hidden" name="membro" value={m.id} />
								<input type="hidden" name="dar" value={m.justa.dar.join(',')} />
								<input type="hidden" name="receber" value={m.justa.receber.join(',')} />
								<p class="small">
									Você dá <b>{m.justa.dar.join(', ')}</b> e recebe
									<b>{m.justa.receber.join(', ')}</b>. Isso atualiza o álbum de {m.displayName} também.
								</p>
								<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
									<button type="button" class="btn btn--sm" onclick={() => (confirmando = null)}
										>Cancelar</button
									>
									<button type="submit" class="btn btn--grass btn--sm" disabled={enviando}
										>Confirmar</button
									>
								</div>
							</form>
						{:else}
							<button
								type="button"
								class="btn btn--grass btn--sm"
								disabled={m.troca.fair === 0}
								onclick={() => (confirmando = m.id)}>Marcar como trocadas</button
							>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}

	{#if data.tamanho >= 2 && data.procuradas.length}
		<section style="display:flex;flex-direction:column;gap:10px;padding-top:6px">
			<h2 class="display" style="font-size:26px">Mais procuradas na turma</h2>
			<ul class="card" style="padding:4px 14px;box-shadow:none">
				{#each data.procuradas as w (w.code)}
					<li class="list-row" style="padding:8px 0">
						<span style="width:38px;flex:none">{@render mini(w.code, 'cell--get')}</span>
						<span class="strong" style="flex:1;font-size:14px"
							>{w.needed} de {data.tamanho} precisam</span
						>
						<span class="dots-meter" aria-hidden="true"
							>{#each Array(data.tamanho) as _, k (k)}<i class:on={k < w.needed}></i>{/each}</span
						>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>
