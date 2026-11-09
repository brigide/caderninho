<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	import { aplicarTema, lerTema, type Tema } from '#lib/tema.js';

	let { data, form }: PageProps = $props();
	let tema = $state<Tema>('auto');
	let mostrarZerar = $state(false);
	let mostrarSenha = $state(false);

	$effect(() => {
		tema = lerTema();
	});
	function trocarTema(t: Tema) {
		tema = t;
		aplicarTema(t);
	}
	const temas: { id: Tema; label: string }[] = [
		{ id: 'auto', label: 'Automático' },
		{ id: 'claro', label: 'Claro' },
		{ id: 'escuro', label: 'Escuro' }
	];
</script>

<svelte:head><title>Conta · Caderninho de Figurinhas</title></svelte:head>

<main class="screen__main" style="gap:20px;padding-bottom:120px">
	<h1 class="display-l">Conta</h1>

	{#if form?.ok === 'nome'}<p
			class="card card--surface card__pad small strong"
			role="status"
			style="border-color:var(--grass)"
		>
			Nome atualizado.
		</p>{/if}
	{#if form?.ok === 'senha'}<p
			class="card card--surface card__pad small strong"
			role="status"
			style="border-color:var(--grass)"
		>
			Senha trocada.
		</p>{/if}
	{#if form?.ok === 'zerado'}<p
			class="card card--surface card__pad small strong"
			role="status"
			style="border-color:var(--grass)"
		>
			Álbum zerado. Boa sorte na nova coleção!
		</p>{/if}

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<span class="muted overline">Você</span>
		<form
			method="POST"
			action="?/nome"
			use:enhance={() =>
				async ({ update }) => {
					await update();
					await invalidateAll();
				}}
			style="display:flex;flex-direction:column;gap:10px"
		>
			<label class="field">
				<span class="field__label">Nome de exibição</span>
				<input
					class="field__input"
					type="text"
					name="nome"
					value={form?.nome ?? data.user.displayName}
					maxlength="40"
					required
				/>
				{#if form?.errors?.nome}<span class="small strong" style="color:var(--doghouse-text)"
						>{form.errors.nome}</span
					>{/if}
			</label>
			<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
				<span class="small muted">@{data.user.username}</span>
				<button class="btn btn--sm" type="submit">Salvar nome</button>
			</div>
		</form>
	</section>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<span class="muted overline">Aparência</span>
		<div class="chips" role="group" aria-label="Tema">
			{#each temas as t (t.id)}
				<button
					type="button"
					class="chip"
					aria-pressed={tema === t.id}
					onclick={() => trocarTema(t.id)}>{t.label}</button
				>
			{/each}
		</div>
		<p class="small muted">"Automático" segue o tema do celular.</p>
	</section>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<span class="muted overline">Meu álbum</span>
		<a class="btn btn--block" href="/conta/exportar.csv" download>
			<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
				><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg
			>Exportar CSV
		</a>
		{#if mostrarZerar}
			<form
				method="POST"
				action="?/zerar"
				use:enhance={() =>
					async ({ update }) => {
						await update();
						mostrarZerar = false;
					}}
				style="display:flex;flex-direction:column;gap:10px"
			>
				<p class="small">
					Isso apaga <b>todas</b> as suas figurinhas coladas, repetidas e o histórico. Não dá para
					desfazer. Digite <b class="stamp">ZERAR</b> para confirmar.
				</p>
				<input
					class="field__input field__input--code"
					type="text"
					name="confirma"
					placeholder="ZERAR"
					autocapitalize="characters"
					required
				/>
				{#if form?.errors?.confirma}<span class="small strong" style="color:var(--doghouse-text)"
						>{form.errors.confirma}</span
					>{/if}
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
					<button type="button" class="btn btn--sm" onclick={() => (mostrarZerar = false)}
						>Cancelar</button
					>
					<button type="submit" class="btn btn--danger btn--sm">Zerar álbum</button>
				</div>
			</form>
		{:else}
			<button
				type="button"
				class="btn btn--ghost btn--sm"
				style="align-self:flex-start"
				disabled={!data.temDados}
				onclick={() => (mostrarZerar = true)}>Zerar álbum…</button
			>
		{/if}
	</section>

	<section class="card card--surface card__pad" style="display:flex;flex-direction:column;gap:12px">
		<span class="muted overline">Segurança</span>
		{#if mostrarSenha || form?.errors?.atual || form?.errors?.nova}
			<form
				method="POST"
				action="?/senha"
				use:enhance={() =>
					async ({ update }) => {
						await update();
						mostrarSenha = false;
					}}
				style="display:flex;flex-direction:column;gap:10px"
			>
				<label class="field">
					<span class="field__label">Senha atual</span>
					<input
						class="field__input"
						type="password"
						name="atual"
						autocomplete="current-password"
						required
					/>
					{#if form?.errors?.atual}<span class="small strong" style="color:var(--doghouse-text)"
							>{form.errors.atual}</span
						>{/if}
				</label>
				<label class="field">
					<span class="field__label">Nova senha</span>
					<input
						class="field__input"
						type="password"
						name="nova"
						autocomplete="new-password"
						minlength="8"
						placeholder="mín. 8 caracteres"
						required
					/>
					{#if form?.errors?.nova}<span class="small strong" style="color:var(--doghouse-text)"
							>{form.errors.nova}</span
						>{/if}
				</label>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
					<button type="button" class="btn btn--sm" onclick={() => (mostrarSenha = false)}
						>Cancelar</button
					>
					<button type="submit" class="btn btn--primary btn--sm">Trocar senha</button>
				</div>
			</form>
		{:else}
			<button
				type="button"
				class="btn btn--sm"
				style="align-self:flex-start"
				onclick={() => (mostrarSenha = true)}>Trocar senha…</button
			>
		{/if}
	</section>

	<div style="display:flex;flex-direction:column;gap:10px;margin-top:auto">
		<a
			class="small strong center"
			href="/creditos"
			style="text-decoration:underline wavy;text-underline-offset:3px">Créditos e licenças</a
		>
		<form method="POST" action="/sair">
			<button class="btn btn--danger btn--block" type="submit">Sair do caderninho</button>
		</form>
	</div>
</main>
