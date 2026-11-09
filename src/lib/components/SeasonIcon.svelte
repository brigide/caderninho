<script lang="ts">
	let { id }: { id: string } = $props();
</script>

<svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true">
	{#if id === 'spring'}
		<circle cx="12" cy="12" r="3" /><path
			d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"
		/>
	{:else if id === 'summer'}
		<circle cx="12" cy="12" r="4" /><path
			d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"
		/>
	{:else if id === 'autumn'}
		<path
			d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
		/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
	{:else}
		<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" />
	{/if}
</svg>
