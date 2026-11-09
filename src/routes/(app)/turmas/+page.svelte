<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { corAvatar, inicial } from '#lib/domain/turmas.js';
	import Sheet from '#lib/components/Sheet.svelte';

	let { data, form }: PageProps = $props();
	let novo = $state(false);
	const me = $derived(data.user.id);
</script>

<svelte:head><title>Turmas · Caderninho de Figurinhas</title></svelte:head>

{#if data.turmas.length}
	<main class="screen__main" style="gap:22px;padding-bottom:120px">
		<div style="display:flex;justify-content:space-between;align-items:center">
			<h1 class="display-l">Turmas</h1>
			<button type="button" class="btn btn--sm" onclick={() => (novo = true)}>
				<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
					><path d="M12 5v14M5 12h14" /></svg
				>Nova turma
			</button>
		</div>
		{#each data.turmas as t, ti (t.id)}
			<a href="/turmas/{t.id}" class="card group-card" class:card--surface={ti % 2 === 1}>
				<span
					class="washi"
					class:washi--blue={ti % 2 === 1}
					aria-hidden="true"
					style="top:-10px;left:28px;transform:rotate(-4deg)"
				></span>
				<div style="display:flex;justify-content:space-between;align-items:center">
					<h2 class="display-m">{t.name}</h2>
					<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
				</div>
				<div style="display:flex;align-items:center;gap:16px">
					<div class="avatar-stack" aria-hidden="true">
						{#each t.membros.slice(0, 4) as m, i (m.id)}
							<span class="avatar avatar--sm avatar--{m.id === me ? 'blue' : corAvatar(i + 1)}"
								>{inicial(m.displayName)}</span
							>
						{/each}
					</div>
					<span class="small strong"
						>{t.membros.length}
						{t.membros.length === 1 ? 'membro' : 'membros'}{t.role === 'owner'
							? ' · você é dono'
							: ''}</span
					>
				</div>
				<div style="display:flex;flex-direction:column;gap:7px">
					{#each t.membros as m (m.id)}
						<div class="member-bar">
							<span>{m.id === me ? 'Você' : m.displayName}</span>
							<div class="track" role="img" aria-label="{m.displayName}: {m.percentual}% completo">
								<span class={m.id === me ? 'fill--me' : 'fill--grass'} style="width:{m.percentual}%"
								></span>
							</div>
							<span class="num">{m.percentual}%</span>
						</div>
					{/each}
				</div>
				<div class="group-card__foot">
					<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path
							d="M20 17H4"
						/></svg
					>
					{t.trocas.total
						? `${t.trocas.total} ${t.trocas.total === 1 ? 'troca possível' : 'trocas possíveis'}`
						: t.membros.length < 2
							? 'Convide alguém para começar'
							: 'Nenhuma troca agora'}
				</div>
			</a>
		{/each}
	</main>
{:else}
	<main class="screen__main" style="padding:16px 24px 120px;gap:22px">
		<h1 class="display-l">Turmas</h1>
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center"
		>
			<figure class="polaroid">
				<span
					class="washi"
					aria-hidden="true"
					style="top:-11px;left:50%;margin-left:-40px;height:22px;transform:rotate(3deg)"
				></span>
				<div
					class="polaroid__photo"
					role="img"
					aria-label="Ilustração: duas canecas fumegantes lado a lado numa mesa de madeira"
				>
					<div class="window-light" aria-hidden="true"></div>
					<div class="frame-pic" aria-hidden="true"></div>
					<div class="tabletop" aria-hidden="true"></div>
					<div
						class="contact-shadow"
						aria-hidden="true"
						style="left:28px;top:104px;width:70px"
					></div>
					<div
						class="contact-shadow"
						aria-hidden="true"
						style="left:112px;top:106px;width:66px"
					></div>
					<div class="mug-side" aria-hidden="true" style="left:34px;top:54px">
						<span class="mug-side__handle"></span><span class="mug-side__body"></span><span
							class="mug-side__rim"
						></span>
						<span class="wisp" style="left:14px;top:-28px"></span>
						<span class="wisp wisp--r" style="left:26px;top:-32px;animation-delay:1.1s"></span>
						<span class="wisp" style="left:20px;top:-26px;animation-delay:2.1s"></span>
					</div>
					<div
						class="mug-side mug-side--yellow mug-side--handle-left"
						aria-hidden="true"
						style="left:126px;top:60px"
					>
						<span class="mug-side__handle"></span><span class="mug-side__body"
							><span class="mug-side__band"></span></span
						><span class="mug-side__rim"></span>
						<span class="wisp wisp--r" style="left:14px;top:-28px;animation-delay:.5s"></span>
						<span class="wisp" style="left:24px;top:-30px;animation-delay:1.7s"></span>
					</div>
					<span
						class="leaf leaf--copper"
						aria-hidden="true"
						style="left:186px;top:112px;width:18px;height:18px;transform:rotate(-30deg)"
					></span>
					<span class="cookie" aria-hidden="true" style="left:96px;top:118px"></span>
					<div
						aria-hidden="true"
						style="position:absolute;inset:0;background:radial-gradient(ellipse 200px 140px at 70% 0%,rgba(255,200,130,.25),rgba(255,200,130,0) 70%),radial-gradient(ellipse 260px 160px at 50% 120%,rgba(30,16,8,.25),rgba(30,16,8,0) 70%)"
					></div>
				</div>
				<figcaption class="polaroid__caption">a turma começa com dois</figcaption>
			</figure>
			<div style="display:flex;flex-direction:column;gap:8px;max-width:300px">
				<h2 class="display" style="font-size:30px;line-height:1.05">
					Trocar é mais gostoso em dupla
				</h2>
				<p>
					Crie uma turma e convide quem também está colecionando. Vocês veem as repetidas um do
					outro e o app sugere as trocas.
				</p>
			</div>
			<button class="btn btn--primary btn--block" type="button" onclick={() => (novo = true)}
				>Criar uma turma</button
			>
			<p class="small muted">Recebeu um link de convite? É só abrir o link.</p>
		</div>
	</main>
{/if}

{#if novo || form?.errors}
	<Sheet onclose={() => (novo = false)} labelledby="nova-titulo">
		<div class="sheet__head">
			<h2 id="nova-titulo" class="display" style="font-size:30px">Nova turma</h2>
			<button type="button" class="icon-btn" aria-label="Fechar" onclick={() => (novo = false)}>
				<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"
					><path d="M18 6 6 18M6 6l12 12" /></svg
				>
			</button>
		</div>
		<form
			method="POST"
			action="?/criar"
			use:enhance
			style="display:flex;flex-direction:column;gap:16px"
		>
			<label class="field">
				<span class="field__label">Nome da turma</span>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="field__input"
					type="text"
					name="nome"
					placeholder="ex.: Turma do prédio"
					maxlength="40"
					value={form?.nome ?? ''}
					autofocus
					required
				/>
				{#if form?.errors?.nome}<span class="small strong" style="color:var(--doghouse-text)"
						>{form.errors.nome}</span
					>{/if}
			</label>
			<button class="btn btn--primary btn--block" type="submit">Criar turma</button>
		</form>
	</Sheet>
{/if}

<style>
	.group-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px 16px 14px;
		text-decoration: none;
	}
	.group-card__foot {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-top: 10px;
		border-top: var(--stroke) dashed var(--rule);
		font-size: 14px;
		font-weight: 800;
	}
</style>
