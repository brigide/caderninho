<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { corAvatar, inicial } from '#lib/domain/turmas.js';
	import Sheet from '#lib/components/Sheet.svelte';

	let { data, form }: PageProps = $props();
	const me = $derived(data.user.id);
	const dono = $derived(data.turma.role === 'owner');
	let convidar = $state(false);
	let copiado = $state(false);
	let confirmarSaida = $state(false);

	const diasRestantes = $derived(
		data.convite ? Math.max(1, Math.ceil((data.convite.expiresAt - Date.now()) / 86_400_000)) : 0
	);

	async function copiar() {
		if (!data.convite) return;
		try {
			await navigator.clipboard.writeText(data.convite.url);
		} catch {
			/* sem clipboard: o link está visível para copiar à mão */
		}
		copiado = true;
		setTimeout(() => (copiado = false), 2000);
	}
	function compartilhar() {
		if (!data.convite) return;
		navigator
			.share?.({
				title: 'Caderninho de Figurinhas',
				text: `Entra na nossa turma "${data.turma.name}" do álbum!`,
				url: data.convite.url
			})
			.catch(() => {});
	}
	const podeCompartilhar = typeof navigator !== 'undefined' && 'share' in navigator;
</script>

<svelte:head><title>{data.turma.name} · Caderninho de Figurinhas</title></svelte:head>

<main class="screen__main" style="padding-top:10px;gap:16px;padding-bottom:120px">
	<div class="page-head">
		<a href="/turmas" class="icon-btn icon-btn--bare back" aria-label="Voltar para turmas">
			<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
		</a>
		<h1 class="display" style="font-size:32px">{data.turma.name}</h1>
	</div>

	<a
		href="/turmas/{data.turma.id}/trocas"
		class="card card--yellow"
		style="display:flex;align-items:center;gap:14px;padding:18px 16px;text-decoration:none"
	>
		<span
			class="icon-btn"
			aria-hidden="true"
			style="border-radius:12px;background:#FFFDF7;color:#2B2622;border-color:#2B2622"
		>
			<svg class="icon icon--sm" viewBox="0 0 24 24"
				><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path
					d="M20 17H4"
				/></svg
			>
		</span>
		<span style="flex:1;display:flex;flex-direction:column">
			<span class="display-s">Trocas com a turma</span>
			<span class="strong" style="font-size:14px">
				{#if data.trocas.total}{data.trocas.total}
					{data.trocas.total === 1 ? 'troca possível' : 'trocas possíveis'} com {data.trocas
						.pessoas}
					{data.trocas.pessoas === 1 ? 'pessoa' : 'pessoas'}{:else}Nenhuma troca agora{/if}
			</span>
		</span>
		<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
	</a>

	<div style="display:flex;justify-content:space-between;align-items:center">
		<span class="overline">Membros · {data.membros.length}</span>
		<form
			method="POST"
			action="?/convidar"
			use:enhance={() =>
				async ({ update }) => {
					await update();
					convidar = true;
				}}
		>
			{#if data.convite}
				<button type="button" class="btn btn--primary btn--sm" onclick={() => (convidar = true)}>
					<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
							cx="9"
							cy="7"
							r="4"
						/><path d="M19 8v6M22 11h-6" /></svg
					>Convidar
				</button>
			{:else}
				<button type="submit" class="btn btn--primary btn--sm">
					<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
							cx="9"
							cy="7"
							r="4"
						/><path d="M19 8v6M22 11h-6" /></svg
					>Convidar
				</button>
			{/if}
		</form>
	</div>

	{#if form?.erro}<p class="small strong" role="alert" style="color:var(--doghouse-text)">
			{form.erro}
		</p>{/if}

	<ul class="card card--surface" style="padding:2px 14px">
		{#each data.membros as m, i (m.id)}
			<li class="list-row">
				<span class="avatar avatar--{m.id === me ? 'blue' : corAvatar(i + 1)}"
					>{inicial(m.displayName)}</span
				>
				<span style="flex:1;display:flex;flex-direction:column">
					<span class="strong"
						>{m.displayName}
						{#if m.role === 'owner'}<span class="pill pill--tag">dono</span>{/if}</span
					>
					<span class="small"
						>{m.percentual}% completo · {m.repetidas}
						{m.repetidas === 1 ? 'repetida' : 'repetidas'}</span
					>
				</span>
				{#if dono && m.id !== me}
					<form method="POST" action="?/remover" use:enhance>
						<input type="hidden" name="userId" value={m.id} />
						<button
							class="remove"
							type="submit"
							aria-label="Remover {m.displayName} da turma"
							onclick={(e) => {
								if (!confirm(`Remover ${m.displayName} da turma?`)) e.preventDefault();
							}}>Remover</button
						>
					</form>
				{/if}
			</li>
		{/each}
	</ul>

	{#if confirmarSaida}
		<form
			method="POST"
			action="?/sair"
			use:enhance
			class="card card__pad"
			style="display:flex;flex-direction:column;gap:10px;margin-top:auto"
		>
			<p class="strong">Sair de "{data.turma.name}"?</p>
			{#if dono && data.membros.length > 1}<p class="small">
					A posse passa para o membro mais antigo.
				</p>{/if}
			{#if data.membros.length === 1}<p class="small">
					Você é a única pessoa: a turma será apagada.
				</p>{/if}
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
				<button type="button" class="btn btn--sm" onclick={() => (confirmarSaida = false)}
					>Ficar</button
				>
				<button type="submit" class="btn btn--danger btn--sm">Sair</button>
			</div>
		</form>
	{:else}
		<button
			type="button"
			class="btn btn--ghost btn--sm"
			style="margin-top:auto;align-self:center"
			onclick={() => (confirmarSaida = true)}
		>
			<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
				><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path
					d="M21 12H9"
				/></svg
			>Sair da turma
		</button>
	{/if}
</main>

{#if convidar && data.convite}
	<Sheet onclose={() => (convidar = false)} labelledby="conv-titulo">
		<div class="sheet__head">
			<h2 id="conv-titulo" class="display" style="font-size:30px">Convidar para a turma</h2>
			<button type="button" class="icon-btn" aria-label="Fechar" onclick={() => (convidar = false)}>
				<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
					><path d="M18 6 6 18M6 6l12 12" /></svg
				>
			</button>
		</div>
		<p>Mande este link para quem vai entrar. Quem ainda não tem conta cria a própria com ele.</p>
		<div class="env-col" style="border-radius:12px">
			<div class="perf" style="--surface:var(--paper)"></div>
			<div class="env-col__body" style="padding:6px 16px 16px;gap:10px">
				<span class="overline">Link de convite</span>
				<div
					style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1.5px dashed var(--ink);border-radius:10px;padding:10px 12px"
				>
					<span
						class="stamp"
						style="flex:1;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
						>{data.convite.url.replace(/^https?:\/\//, '')}</span
					>
				</div>
				<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
					<span class="pill pill--info"
						><svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true"
							><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg
						>expira em {diasRestantes}
						{diasRestantes === 1 ? 'dia' : 'dias'}</span
					>
					<span class="small">· código <b class="stamp">{data.convite.token}</b></span>
				</div>
			</div>
		</div>
		<button class="btn btn--primary btn--block" type="button" aria-live="polite" onclick={copiar}>
			<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
				><rect width="14" height="14" x="8" y="8" rx="2" /><path
					d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
				/></svg
			><span>{copiado ? 'Copiado!' : 'Copiar link'}</span>
		</button>
		<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
			<button class="btn" type="button" disabled={!podeCompartilhar} onclick={compartilhar}
				>Compartilhar…</button
			>
			<form method="POST" action="?/convidar" use:enhance style="display:contents">
				<button class="btn btn--ghost" type="submit">Gerar novo link</button>
			</form>
		</div>
		<p class="small center">Gerar um novo link desativa o anterior.</p>
	</Sheet>
{/if}

<style>
	.remove {
		min-height: 44px;
		padding: 0 10px;
		border: none;
		background: transparent;
		font-weight: 800;
		font-size: 14px;
		color: var(--doghouse-text);
		cursor: pointer;
	}
</style>
