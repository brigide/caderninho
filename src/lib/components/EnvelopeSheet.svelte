<script lang="ts">
	import type { Album } from '#lib/album.svelte.js';
	import Sheet from './Sheet.svelte';

	let { album, onclose }: { album: Album; onclose: () => void } = $props();

	const MAX = 4;
	const NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
	const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

	type Lancamento = { codigo: string; antes: number };
	let input = $state('');
	let letras = $state(false);
	let log = $state<Lancamento[]>([]);
	let invalido = $state<string | null>(null);

	const teclas = $derived(letras ? ABC : NUM);
	const novas = $derived(log.filter((l) => l.antes === 0).length);
	const repetidas = $derived(log.length - novas);
	const ultimo = $derived(log.at(-1));
	const recentes = $derived(log.slice(-5).reverse());

	function digitar(ch: string) {
		if (input.length < MAX) input += ch;
		invalido = null;
	}
	function apagar() {
		input = input.slice(0, -1);
	}
	async function lancar() {
		const codigo = input.toUpperCase();
		if (!codigo) return;
		if (!album.existe(codigo)) {
			invalido = codigo;
			input = '';
			return;
		}
		invalido = null;
		input = '';
		const antes = album.get(codigo);
		log.push({ codigo, antes });
		await album.lancar(codigo);
	}
	async function desfazer(i: number) {
		const idx = log.length - 1 - i;
		const [l] = log.splice(idx, 1);
		await album.definir(l.codigo, l.antes);
	}
	function tecla(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		if (/^[0-9a-iA-I]$/.test(e.key)) digitar(e.key.toUpperCase());
		else if (e.key === 'Backspace') apagar();
		else if (e.key === 'Enter') lancar();
		else return;
		e.preventDefault();
	}
</script>

<svelte:window onkeydown={tecla} />

<Sheet {onclose} labelledby="env-titulo" top="96px">
	<div class="sheet__head">
		<div>
			<h2 id="env-titulo" class="display" style="font-size:30px">Abrindo envelope</h2>
			<p class="small strong" style="font-size:14px;margin-top:2px">
				{novas}
				{novas === 1 ? 'nova' : 'novas'} · {repetidas}
				{repetidas === 1 ? 'repetida' : 'repetidas'}
			</p>
		</div>
		<button type="button" class="icon-btn" aria-label="Fechar" onclick={onclose}>
			<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
				><path d="M18 6 6 18M6 6l12 12" /></svg
			>
		</button>
	</div>

	<div style="display:flex;align-items:center;gap:12px">
		<div style="flex:1;display:flex;flex-direction:column;gap:2px">
			<span class="small strong">Digite o número</span>
			<output
				class="display-input"
				aria-live="polite"
				aria-label={input ? `Número digitado: ${input}` : 'Nenhum número digitado'}>{input}</output
			>
		</div>
		{#if invalido}
			<span class="result result--dup" aria-live="polite"
				><span class="stamp">{invalido}</span> · não existe</span
			>
		{:else if ultimo}
			<span
				class="result"
				class:result--new={ultimo.antes === 0}
				class:result--dup={ultimo.antes > 0}
				aria-live="polite"
			>
				<span class="stamp">{ultimo.codigo}</span> · {ultimo.antes
					? `Repetida ×${ultimo.antes + 1}`
					: 'Nova! ✓'}
			</span>
		{/if}
	</div>

	<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:6px">
		<div style="display:flex;justify-content:space-between;align-items:baseline">
			<span class="overline">Últimos lançados</span>
			<span class="small muted" style="font-size:12px">toque em ↶ para desfazer</span>
		</div>
		<ul>
			{#each recentes as l, i (log.length - 1 - i)}
				<li class="recent-row">
					<span
						class="cell cell--sm stamp"
						class:cell--give={l.antes > 0}
						class:cell--have={l.antes === 0}
						style="width:34px;min-width:34px;cursor:default">{l.codigo}</span
					>
					<span class="strong" style="flex:1"
						>{l.antes > 0 ? `Repetida ×${l.antes + 1}` : 'Nova! colada ✓'}</span
					>
					<button
						type="button"
						class="icon-btn icon-btn--bare"
						aria-label="Desfazer {l.codigo}"
						onclick={() => desfazer(i)}
					>
						<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
							><path d="M9 14 4 9l5-5" /><path
								d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"
							/></svg
						>
					</button>
				</li>
			{:else}
				<li class="small muted">Nada lançado ainda neste envelope.</li>
			{/each}
		</ul>
	</div>

	<div class="keypad" role="group" aria-label="Teclado">
		{#each teclas.slice(0, 3) as t (t)}<button type="button" class="key" onclick={() => digitar(t)}
				>{t}</button
			>{/each}
		<button type="button" class="key key--fn" aria-label="Apagar" onclick={apagar}>⌫</button>
		{#each teclas.slice(3, 6) as t (t)}<button type="button" class="key" onclick={() => digitar(t)}
				>{t}</button
			>{/each}
		<button
			type="button"
			class="key key--mode"
			aria-label={letras ? 'Mudar para números' : 'Mudar para letras'}
			onclick={() => (letras = !letras)}>{letras ? '123' : 'ABC'}</button
		>
		{#each teclas.slice(6, 9) as t (t)}<button type="button" class="key" onclick={() => digitar(t)}
				>{t}</button
			>{/each}
		<button type="button" class="key key--go" onclick={lancar} disabled={!input}>Lançar</button>
		<button type="button" class="key key--wide" aria-label="0" onclick={() => digitar('0')}
			>0</button
		>
	</div>
</Sheet>
