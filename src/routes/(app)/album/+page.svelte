<script lang="ts">
	import type { PageProps } from './$types';
	import { Album } from '#lib/album.svelte.js';
	import { FILTROS, passaFiltro, type Figurinha } from '#lib/domain/album.js';
	import StickerCell from '#lib/components/StickerCell.svelte';
	import SeasonIcon from '#lib/components/SeasonIcon.svelte';
	import EnvelopeSheet from '#lib/components/EnvelopeSheet.svelte';
	import DetalheSheet from '#lib/components/DetalheSheet.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const album = new Album(data.stickers, data.sections, data.copias);
	let envelope = $state(false);
	let detalhe = $state<Figurinha | null>(null);

	const initial = $derived(data.user.displayName.trim().charAt(0).toUpperCase() || '?');
	const visiveis = $derived(
		data.sections.map((s) => ({
			s,
			list: album.catalogo.filter(
				(f) => f.sectionId === s.id && passaFiltro(f, album.get(f.code), album.filtro, album.busca)
			)
		}))
	);
	const algum = $derived(visiveis.some((v) => v.list.length > 0));
</script>

<svelte:head><title>Meu Álbum · Caderninho de Figurinhas</title></svelte:head>

<header class="album-header">
	<div style="display:flex;justify-content:space-between;align-items:center">
		<h1 class="display-l">Meu Álbum</h1>
		<a href="/conta" class="avatar avatar--sm avatar--blue" aria-label={data.user.displayName}
			>{initial}</a
		>
	</div>
	<div style="display:flex;flex-direction:column;gap:6px">
		<div style="display:flex;justify-content:space-between;align-items:baseline">
			<span class="small strong">Snoopy · Um Ano para Recordar</span>
			<span class="strong num"
				>{album.resumo.coladas} / {album.resumo.total} · {album.resumo.percentual}%</span
			>
		</div>
		<div class="season-bar" role="img" aria-label="Progresso por estação">
			{#each data.sections as s (s.id)}
				{@const pe = album.resumo.porEstacao[s.id]}
				<div class="season-bar__seg">
					<div
						class="season-bar__fill fill--{s.id}"
						style="width:{pe.total ? Math.round((pe.coladas / pe.total) * 100) : 0}%"
					></div>
				</div>
			{/each}
		</div>
	</div>
	<div class="chips" role="group" aria-label="Filtrar figurinhas">
		{#each FILTROS as f (f.id)}
			<button
				type="button"
				class="chip"
				aria-pressed={album.filtro === f.id}
				onclick={() => (album.filtro = f.id)}
			>
				{f.label} <span class="muted num">{album.contagem[f.id]}</span>
			</button>
		{/each}
	</div>
	<label class="search">
		<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
			><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
		>
		<span class="sr-only">Buscar figurinha por código</span>
		<input
			type="search"
			inputmode="text"
			autocapitalize="characters"
			placeholder="Buscar por código (ex.: 12)"
			bind:value={album.busca}
		/>
	</label>
	{#if album.erro}<p class="small strong" role="alert" style="color:var(--doghouse-text)">
			{album.erro}
		</p>{/if}
</header>

<main style="flex:1;padding:18px 16px 140px;display:flex;flex-direction:column;gap:26px">
	{#each visiveis as { s, list } (s.id)}
		{#if list.length}
			<section class="album-section" aria-label={s.name}>
				<div class="section-head">
					<span class="season-tab season-tab--{s.id}"><SeasonIcon id={s.id} />{s.name}</span>
					<span class="rule" aria-hidden="true"></span>
					<span class="strong num"
						>{album.resumo.porEstacao[s.id].coladas}/{album.resumo.porEstacao[s.id].total}</span
					>
				</div>
				<div class="sticker-grid">
					{#each list as f (f.code)}
						<StickerCell
							{f}
							copias={album.get(f.code)}
							popping={album.pop === f.code}
							onpress={(x) => album.alternar(x.code)}
							onlongpress={(x) => (detalhe = x)}
						/>
					{/each}
				</div>
			</section>
		{/if}
	{/each}
	{#if !algum}
		<p class="display-s muted center" style="padding:40px 0">Nada por aqui com esse filtro.</p>
	{/if}
</main>

<button type="button" class="fab" onclick={() => (envelope = true)}>
	<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"
		><rect width="20" height="16" x="2" y="4" rx="2" /><path
			d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
		/></svg
	>
	Abrir envelope
</button>

{#if envelope}
	<EnvelopeSheet {album} onclose={() => (envelope = false)} />
{:else if detalhe}
	<DetalheSheet
		{album}
		f={detalhe}
		vizinhos={data.vizinhos[detalhe.code]}
		onclose={() => (detalhe = null)}
	/>
{/if}
