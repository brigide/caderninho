<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Conta · Caderninho de Figurinhas</title></svelte:head>

<main class="screen__main" style="padding-bottom:120px">
	<h1 class="display-l">Conta</h1>
	<div class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:6px">
		<span class="muted overline">Você</span>
		<span class="display-s">{data.user.displayName}</span>
		<span class="small muted">@{data.user.username}</span>
	</div>
	<form method="POST" action="/sair" style="margin-top:auto">
		<button class="btn btn--danger btn--block" type="submit">Sair do caderninho</button>
	</form>
</main>
