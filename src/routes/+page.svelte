<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const total = $derived(data.stickers.length);
</script>

<div class="screen dots">
	<header style="padding:20px 16px 0;display:flex;flex-direction:column;gap:12px">
		<h1 class="display-l">Meu Álbum</h1>
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
		<p class="small muted">
			Fase 0: catálogo provisório carregado do D1. Login e registro chegam na próxima fase.
		</p>
	</header>

	<main style="flex:1;padding:18px 16px 40px;display:flex;flex-direction:column;gap:26px">
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
</div>
