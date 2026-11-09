<script lang="ts">
	import TabBar from '#lib/components/TabBar.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="screen dots">
	{@render children()}
	<TabBar />
</div>
