<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const total = $derived(data.stickers.length);
	const initial = $derived(data.user.displayName.trim().charAt(0).toUpperCase() || '?');
</script>

<svelte:head><title>Meu Álbum · Caderninho de Figurinhas</title></svelte:head>

<header style="padding:20px 16px 0;display:flex;flex-direction:column;gap:12px">
	<div style="display:flex;justify-content:space-between;align-items:center">
		<h1 class="display-l">Meu Álbum</h1>
		<a href="/conta" class="avatar avatar--sm avatar--blue" aria-label={data.user.displayName}
			>{initial}</a
		>
	</div>
	<div style="display:flex;justify-content:space-between;align-items:baseline">
		<span class="small strong">Snoopy · Um Ano para Recordar</span>
		<span class="strong num">0 / {total} · 0%</span>
	</div>
	<div class="season-bar" role="img" aria-label="Progresso por estação">
		{#each data.sections as s (s.id)}
			<div class="season-bar__seg">
				<div class="season-bar__fill fill--{s.id}" style="width:0%"></div>
			</div>
		{/each}
	</div>
</header>

<main style="flex:1;padding:18px 16px 120px;display:flex;flex-direction:column;gap:26px">
	{#each data.sections as s (s.id)}
		{@const list = data.stickers.filter((f) => f.sectionId === s.id)}
		<section style="display:flex;flex-direction:column;gap:12px">
			<div style="display:flex;justify-content:space-between;align-items:center">
				<span class="season-tab season-tab--{s.id}">{s.name}</span>
				<span class="small strong num">0/{list.length}</span>
			</div>
			<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">
				{#each list as f (f.code)}
					<button
						type="button"
						class="cell cell--missing stamp"
						class:cell--special={f.kind === 'especial'}
						class:cell--ameba={f.kind === 'ameba'}
						aria-label="Figurinha {f.code}, faltando"
					>
						{f.code}
					</button>
				{/each}
			</div>
		</section>
	{/each}
</main>
