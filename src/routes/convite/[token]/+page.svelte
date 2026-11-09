<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const next = $derived(encodeURIComponent(`/convite/${data.token}`));
	const c = $derived(data.convite);
</script>

<svelte:head><title>Convite · Caderninho de Figurinhas</title></svelte:head>

<main class="screen dots">
	<div class="screen__main" style="padding:28px 24px;gap:22px;justify-content:center">
		<div style="display:flex;flex-direction:column;gap:6px;text-align:center">
			<p class="small strong">Caderninho de Figurinhas · Snoopy 2026</p>
			{#if c.status === 'ok'}
				<h1 class="display" style="font-size:36px;line-height:1.05">
					Você foi convidado para a turma <span style="color:var(--doghouse-text)"
						>"{c.turmaName}"</span
					>
				</h1>
			{:else if c.status === 'inexistente'}
				<h1 class="display" style="font-size:36px;line-height:1.05">Esse convite não existe</h1>
				<p>Confira o link com quem te convidou.</p>
			{:else}
				<h1 class="display" style="font-size:36px;line-height:1.05">
					Esse convite {c.status === 'expirado' ? 'expirou' : 'já foi usado demais'}
				</h1>
				<p>Peça um link novo para quem está na turma "{c.turmaName}".</p>
			{/if}
		</div>

		{#if c.status === 'ok'}
			<div
				class="card card--surface card__pad"
				style="display:flex;flex-direction:column;gap:14px;text-align:center"
			>
				<span class="small">código <b class="stamp">{data.token}</b></span>
				{#if data.user}
					<p class="small">Entrando como <b>{data.user.displayName}</b> (@{data.user.username}).</p>
					<form
						method="POST"
						action="?/aceitar"
						use:enhance
						style="display:flex;flex-direction:column;gap:10px"
					>
						<button class="btn btn--primary btn--block" type="submit">Entrar na turma</button>
						<a class="btn btn--ghost btn--sm" href="/turmas">Agora não</a>
					</form>
				{:else}
					<p class="small">Crie sua conta ou entre para aceitar o convite.</p>
					<a class="btn btn--primary btn--block" href="/registro?next={next}">Criar conta</a>
					<a class="btn btn--block" href="/login?next={next}">Já tenho conta</a>
				{/if}
				{#if form?.falha}<p class="small strong" role="alert" style="color:var(--doghouse-text)">
						Não deu para entrar: convite {form.falha}.
					</p>{/if}
			</div>
		{:else}
			<a class="btn btn--block" href={data.user ? '/turmas' : '/login'}
				>{data.user ? 'Ir para minhas turmas' : 'Entrar'}</a
			>
		{/if}
	</div>
</main>
