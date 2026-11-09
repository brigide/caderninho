<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let sending = $state(false);
</script>

<svelte:head><title>Entrar · Caderninho de Figurinhas</title></svelte:head>

<main class="screen login scene-wood">
	<div class="warm-light" aria-hidden="true"></div>
	<div class="light-beam light-beam--flicker" aria-hidden="true" style="top:-60px;left:150px"></div>
	<div
		class="light-beam"
		aria-hidden="true"
		style="top:-60px;left:250px;width:46px;height:460px;opacity:.8"
	></div>

	<div class="pencil" aria-hidden="true" style="left:20px;top:96px;transform:rotate(-14deg)">
		<i class="pencil__eraser"></i><i class="pencil__ferrule"></i><i class="pencil__body"></i><i
			class="pencil__tip"
		></i>
	</div>
	<span
		class="leaf leaf--copper"
		aria-hidden="true"
		style="left:300px;top:20px;transform:rotate(18deg)"
	></span>
	<span
		class="leaf leaf--yellow"
		aria-hidden="true"
		style="left:196px;top:34px;width:20px;height:20px;transform:rotate(-40deg)"
	></span>
	<span
		class="leaf leaf--red"
		aria-hidden="true"
		style="left:90px;top:150px;width:22px;height:22px;transform:rotate(70deg)"
	></span>
	<span
		class="leaf leaf--orange"
		aria-hidden="true"
		style="right:20px;bottom:18px;transform:rotate(-12deg)"
	></span>

	<section class="notebook" aria-labelledby="titulo">
		<span class="notebook__margin" aria-hidden="true"></span>
		<span class="notebook__band" aria-hidden="true"></span>

		<div class="label-card">
			<span class="washi" aria-hidden="true"></span>
			<h1 id="titulo" class="display" style="font-size:38px">Caderninho de Figurinhas</h1>
			<p class="small strong" style="margin-top:8px">Snoopy · Um Ano para Recordar · 2026</p>
		</div>

		<form
			method="POST"
			class="form"
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update();
					sending = false;
				};
			}}
		>
			<label class="field">
				<span class="field__label">Usuário</span>
				<input
					class="field__input"
					type="text"
					name="usuario"
					placeholder="seu usuário"
					autocomplete="username"
					autocapitalize="none"
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
					placeholder="••••••"
					autocomplete="current-password"
					required
				/>
				{#if form?.errors?.senha}<span class="error">{form.errors.senha}</span>{/if}
			</label>
			{#if form?.errors?._}<p class="error" role="alert">{form.errors._}</p>{/if}
			<button class="btn btn--primary" type="submit" disabled={sending} style="margin:6px 24px 0 0">
				{sending ? 'Entrando…' : 'Entrar'}
			</button>
		</form>

		<p class="center" style="margin:auto 24px 0 0">
			Ainda não tem caderninho? <a href="/registro{page.url.search}" class="strong wavy"
				>Criar conta</a
			>
		</p>
	</section>

	<div class="mug-top" aria-hidden="true" style="left:236px;top:58px;z-index:2">
		<span class="mug-top__shadow"></span><span class="mug-top__handle"></span><span
			class="mug-top__body"
		></span>
		<span class="puff puff--1"></span><span class="puff puff--2"></span><span class="puff puff--3"
		></span>
	</div>
</main>

<style>
	/* Específico da tela: caderno fechado sobre a mesa (do handoff) */
	.login {
		min-height: 100dvh;
	}
	.notebook {
		position: absolute;
		left: 18px;
		right: 18px;
		top: 196px;
		bottom: 28px;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 22px;
		padding: 36px 36px 28px 44px;
		background: #e8d8bf;
		color: #2b2622;
		border: var(--stroke) solid #2b2622;
		border-radius: 10px 18px 18px 10px;
		box-shadow: 4px 6px 0 rgba(30, 18, 10, 0.32);
	}
	.notebook::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		background: radial-gradient(
			ellipse 260px 200px at 100% 0%,
			rgba(255, 214, 150, 0.35),
			rgba(255, 214, 150, 0) 70%
		);
	}
	.notebook__margin {
		position: absolute;
		left: 14px;
		top: 0;
		bottom: 0;
		width: 2px;
		background: rgba(43, 38, 34, 0.18);
	}
	.notebook__band {
		position: absolute;
		right: 30px;
		top: -1px;
		bottom: -1px;
		width: 12px;
		background: var(--doghouse);
		border-left: var(--stroke) solid #2b2622;
		border-right: var(--stroke) solid #2b2622;
	}
	.notebook > :global(*) {
		position: relative;
	}
	.notebook :global(.field__input),
	.notebook :global(.field__label) {
		color: #2b2622;
	}
	.notebook :global(.field__input) {
		border-bottom-color: #2b2622;
	}
	.notebook :global(.field__input::placeholder) {
		color: #6e635a;
	}
	.label-card {
		align-self: flex-start;
		max-width: 250px;
		padding: 14px 18px 12px;
		background: #f6efe3;
		border: var(--stroke) solid #2b2622;
		border-radius: 6px;
		transform: rotate(-1.5deg);
		box-shadow: 2px 3px 0 rgba(43, 38, 34, 0.15);
	}
	.label-card :global(.washi) {
		top: -11px;
		left: 70px;
		transform: rotate(4deg);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-top: 4px;
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
