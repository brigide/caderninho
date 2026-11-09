<script lang="ts">
	import type { Album } from '#lib/album.svelte.js';
	import type { Figurinha } from '#lib/domain/album.js';
	import Sheet from './Sheet.svelte';
	import StickerCell from './StickerCell.svelte';

	import type { VizinhosPorCodigo } from '#lib/server/trocas.js';
	import { corAvatar, inicial } from '#lib/domain/turmas.js';

	let {
		album,
		f,
		vizinhos,
		onclose
	}: { album: Album; f: Figurinha; vizinhos?: VizinhosPorCodigo[string]; onclose: () => void } =
		$props();

	const c = $derived(album.get(f.code));
	const secao = $derived(album.secoes.find((s) => s.id === f.sectionId));
	const tipoLabel = { regular: 'Regular', especial: 'Especial', ameba: 'Ameba' } as const;
</script>

<Sheet {onclose} labelledby="fig-titulo" top="150px">
	<div style="display:flex;gap:18px;align-items:center">
		<StickerCell {f} copias={c} size="xl" />
		<div style="display:flex;flex-direction:column;gap:6px">
			<h2 id="fig-titulo" class="display" style="font-size:32px">Figurinha {f.code}</h2>
			{#if c > 1}
				<span class="pill pill--dup" style="align-self:flex-start">Repetida · {c} cópias</span>
			{:else if c === 1}
				<span class="pill pill--info" style="align-self:flex-start">Colada</span>
			{:else}
				<span class="pill pill--tag" style="align-self:flex-start">Faltando</span>
			{/if}
		</div>
	</div>

	<div
		class="card"
		style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:14px 16px;box-shadow:none"
	>
		<div class="meta">
			<b>Estação</b>
			<span style="display:inline-flex;align-items:center;gap:6px">
				<i
					style="width:10px;height:10px;border-radius:50%;background:var(--season-{f.sectionId});border:1.5px solid var(--ink)"
				></i>{secao?.name ?? f.sectionId}
			</span>
		</div>
		<div class="meta"><b>Tipo</b><span>{tipoLabel[f.kind]}</span></div>
		<div class="meta"><b>Página</b><span>{f.page ?? '—'}</span></div>
	</div>

	<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
		{#if c > 0}
			<button class="btn" type="button" disabled style="background:var(--grass-soft)">
				<svg
					viewBox="0 0 16 14"
					width="18"
					height="16"
					aria-hidden="true"
					style="fill:none;stroke:var(--grass-ink);stroke-width:2.2;stroke-linecap:round"
					><path d="M2 8c2 1 3 3 4 4 2-4 5-8 9-10" /></svg
				>Colada
			</button>
		{:else}
			<button class="btn btn--grass" type="button" onclick={() => album.definir(f.code, 1)}
				>Colar</button
			>
		{/if}
		<button class="btn btn--yellow" type="button" onclick={() => album.lancar(f.code)}
			>+ Repetida</button
		>
		<button class="btn" type="button" disabled={c < 2} onclick={() => album.remover(f.code)}
			>– Repetida</button
		>
		<button
			class="btn btn--danger"
			type="button"
			disabled={c === 0}
			onclick={() => album.definir(f.code, 0)}>Desmarcar</button
		>
	</div>

	{#if vizinhos}
		<div style="display:flex;flex-direction:column;gap:10px">
			<span class="overline">Na sua turma</span>
			{#each vizinhos.precisam as v, i (v.id)}
				<div class="turma-row">
					<span class="avatar avatar--sm avatar--{corAvatar(i + 1)}" style="width:34px;height:34px"
						>{inicial(v.displayName)}</span
					>
					<span style="flex:1"><b>{v.displayName}</b> precisa dessa</span>
					{#if c > 1}<a
							href="/turmas/{v.turmaId}/trocas"
							class="strong"
							style="color:var(--doghouse-text);font-size:14px">Oferecer</a
						>{/if}
				</div>
			{/each}
			{#each vizinhos.temRepetida as v, i (v.id)}
				<div class="turma-row">
					<span class="avatar avatar--sm avatar--{corAvatar(i + 2)}" style="width:34px;height:34px"
						>{inicial(v.displayName)}</span
					>
					<span style="flex:1"
						><b>{v.displayName}</b> {c > 0 ? 'também tem repetida' : 'tem repetida'}</span
					>
					{#if c === 0}<a
							href="/turmas/{v.turmaId}/trocas"
							class="strong"
							style="color:var(--doghouse-text);font-size:14px">Pedir</a
						>{/if}
				</div>
			{/each}
		</div>
	{/if}

	<button type="button" class="btn btn--ghost btn--sm" style="align-self:center" onclick={onclose}
		>Fechar</button
	>
</Sheet>
