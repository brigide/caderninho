<script lang="ts">
	import type { Figurinha } from '#lib/domain/album.js';
	import { rotuloCelula } from '#lib/domain/album.js';

	let {
		f,
		copias,
		popping = false,
		size = 'md',
		onpress,
		onlongpress
	}: {
		f: Figurinha;
		copias: number;
		popping?: boolean;
		size?: 'md' | 'sm' | 'xl';
		onpress?: (f: Figurinha) => void;
		onlongpress?: (f: Figurinha) => void;
	} = $props();

	const LONG_PRESS_MS = 500;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let longFired = false;

	function down() {
		longFired = false;
		if (!onlongpress) return;
		timer = setTimeout(() => {
			longFired = true;
			onlongpress?.(f);
		}, LONG_PRESS_MS);
	}
	function cancel() {
		if (timer) clearTimeout(timer);
		timer = null;
	}
	function click(ev: MouseEvent) {
		if (longFired) {
			ev.preventDefault();
			return;
		}
		if (ev.shiftKey) onlongpress?.(f);
		else onpress?.(f);
	}
	const label = $derived(rotuloCelula(f, copias));
</script>

<button
	type="button"
	class="cell stamp"
	class:cell--have={copias > 0}
	class:cell--missing={copias === 0}
	class:cell--special={f.kind === 'especial'}
	class:cell--ameba={f.kind === 'ameba'}
	class:cell--sm={size === 'sm'}
	class:cell--xl={size === 'xl'}
	class:is-popping={popping}
	aria-pressed={copias > 0}
	aria-label={label}
	title={label}
	onpointerdown={down}
	onpointerup={cancel}
	onpointerleave={cancel}
	onpointercancel={cancel}
	oncontextmenu={(e) => e.preventDefault()}
	onclick={click}
>
	{#if f.kind === 'especial'}
		{#if copias > 0}<span class="cell__shine"></span>{/if}
		<svg class="cell__star" viewBox="0 0 10 10" aria-hidden="true"
			><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z" /></svg
		>
	{/if}
	{f.code}
	{#if copias > 0}
		<svg class="cell__check" viewBox="0 0 16 14" aria-hidden="true"
			><path d="M2 8c2 1 3 3 4 4 2-4 5-8 9-10" /></svg
		>
	{/if}
	{#if copias > 1}<span class="cell__badge">×{copias}</span>{/if}
</button>
