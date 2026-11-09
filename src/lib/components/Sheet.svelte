<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclose,
		labelledby,
		top,
		children
	}: { onclose: () => void; labelledby: string; top?: string; children: Snippet } = $props();

	function key(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={key} />

<div class="scrim" role="presentation" onclick={onclose}></div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledby} style:top>
	<div class="sheet__handle" aria-hidden="true"></div>
	{@render children()}
</div>
