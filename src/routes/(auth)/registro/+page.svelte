<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let sending = $state(false);
</script>

<svelte:head><title>Criar conta · Caderninho de Figurinhas</title></svelte:head>

<main class="screen dots">
	<div class="mug-top mug-top--pink" aria-hidden="true" style="left:272px;top:-34px;z-index:1">
		<span class="mug-top__shadow"></span><span class="mug-top__handle"></span><span
			class="mug-top__body"
		></span>
		<span class="puff puff--1"></span><span class="puff puff--2"></span>
	</div>
	<span
		class="leaf leaf--copper"
		aria-hidden="true"
		style="left:232px;top:104px;width:24px;height:24px;transform:rotate(-24deg)"
	></span>
	<span
		class="leaf leaf--yellow"
		aria-hidden="true"
		style="right:22px;top:128px;width:18px;height:18px;transform:rotate(50deg)"
	></span>

	<div class="screen__main" style="padding:20px 24px 28px;gap:18px">
		<a href="/login" class="icon-btn icon-btn--bare back" aria-label="Voltar">
			<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
		</a>

		<div style="display:flex;flex-direction:column;gap:6px">
			<h1 class="display" style="font-size:40px">Criar conta</h1>
			<p class="small strong">Caderninho de Figurinhas · Snoopy 2026</p>
		</div>

		<form
			id="registro"
			method="POST"
			class="card card--surface sheet-page"
			style="border-radius:6px 14px 14px 6px"
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update();
					sending = false;
				};
			}}
		>
			<span
				class="washi washi--blue"
				aria-hidden="true"
				style="top:-11px;right:34px;transform:rotate(-4deg)"
			></span>
			<label class="field">
				<span class="field__label">Nome de exibição</span>
				<input
					class="field__input"
					type="text"
					name="nome"
					placeholder="como a turma te chama"
					value={form?.nome ?? ''}
					maxlength="40"
					required
				/>
				{#if form?.errors?.nome}<span class="error">{form.errors.nome}</span>{/if}
			</label>
			<label class="field">
				<span class="field__label">Usuário</span>
				<input
					class="field__input"
					type="text"
					name="usuario"
					placeholder="sem espaços"
					autocomplete="username"
					autocapitalize="none"
					pattern="[A-Za-z0-9_.]+"
					value={form?.usuario ?? ''}
					required
				/>
				{#if form?.errors?.usuario}<span class="error">{form.errors.usuario}</span>{/if}
			</label>
			<label class="field">
				<span class="field__label">Senha</span>
				<input
					class="field__input"
					type="password"
					name="senha"
					placeholder="mín. 8 caracteres"
					autocomplete="new-password"
					minlength="8"
					required
				/>
				{#if form?.errors?.senha}<span class="error">{form.errors.senha}</span>{/if}
			</label>
			{#if form?.errors?._}<p class="error" role="alert">{form.errors._}</p>{/if}
		</form>

		<div class="info">
			<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
				><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z" /><path
					d="M12 16v-4"
				/><path d="M12 8h.01" /></svg
			>
			<p class="small" style="font-size:14px">
				Cadastro aberto para a turma. Só precisa de um nome, um usuário e uma senha.
			</p>
		</div>

		<button
			class="btn btn--primary btn--block"
			type="submit"
			form="registro"
			disabled={sending}
			style="margin-top:auto"
		>
			{sending ? 'Criando…' : 'Criar meu caderninho'}
		</button>
		<p class="center">
			Já tem conta? <a href="/login{page.url.search}" class="strong wavy">Entrar</a>
		</p>
	</div>
</main>

<style>
	.sheet-page {
		position: relative;
		padding: 24px 22px 22px 34px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.sheet-page::before {
		content: '';
		position: absolute;
		left: 18px;
		top: 0;
		bottom: 0;
		width: 1.5px;
		background: var(--season-spring);
	}
	.error {
		color: var(--doghouse-text);
		font-size: var(--text-small);
		font-weight: 700;
		margin-top: 4px;
	}
	.wavy {
		text-decoration-style: wavy;
		text-underline-offset: 4px;
	}
</style>
