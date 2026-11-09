<svelte:head><title>Créditos · Caderninho de Figurinhas</title></svelte:head>

<main class="screen dots">
	<div class="screen__main" style="gap:18px;padding:20px 24px 40px">
		<div class="page-head">
			<a href="/album" class="icon-btn icon-btn--bare back" aria-label="Voltar">
				<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
			</a>
			<h1 class="display" style="font-size:32px">Créditos e licenças</h1>
		</div>

		<section
			class="card card--surface card__pad"
			style="display:flex;flex-direction:column;gap:8px"
		>
			<span class="overline">Sobre</span>
			<p>
				O <b>Caderninho de Figurinhas</b> é um projeto pessoal, sem fins lucrativos, para acompanhar
				o álbum <i>Snoopy – Um Ano para Recordar</i> (Panini, 2026) entre amigos.
			</p>
			<p class="small">
				Não tem vínculo com a Panini, a Peanuts Worldwide LLC ou o espólio de Charles M. Schulz.
				Snoopy, Charlie Brown e Peanuts são marcas e obras de seus detentores. Nenhum personagem ou
				arte oficial é reproduzido aqui.
			</p>
		</section>

		<section
			class="card card--surface card__pad"
			style="display:flex;flex-direction:column;gap:8px"
		>
			<span class="overline">Fontes</span>
			<ul style="display:flex;flex-direction:column;gap:6px">
				<li>
					<b style="font-family:var(--font-display);font-size:20px">Patrick Hand</b> — Patrick
					Wagesreiter · <a href="/fonts/OFL-patrick-hand.txt">SIL Open Font License 1.1</a>
				</li>
				<li>
					<b>Nunito</b> — Vernon Adams, Cyreal, Jacques Le Bailly ·
					<a href="/fonts/OFL-nunito.txt">SIL Open Font License 1.1</a>
				</li>
				<li>
					<b class="stamp">DM Mono</b> — Colophon Foundry, Google ·
					<a href="/fonts/OFL-dm-mono.txt">SIL Open Font License 1.1</a>
				</li>
			</ul>
		</section>

		<section
			class="card card--surface card__pad"
			style="display:flex;flex-direction:column;gap:8px"
		>
			<span class="overline">Ícones e ilustrações</span>
			<p>
				Ícones no estilo <a href="https://lucide.dev">Lucide</a> (licença ISC). Ilustrações (mesa,
				canecas, envelopes, folhas, casinha do ícone) desenhadas à mão em CSS e SVG para este
				projeto. <b>Nenhuma imagem foi gerada por IA.</b>
			</p>
		</section>

		<section
			class="card card--surface card__pad"
			style="display:flex;flex-direction:column;gap:8px"
		>
			<span class="overline">Tecnologia</span>
			<p class="small">
				SvelteKit, Drizzle ORM e Tailwind (MIT). Hospedado na Cloudflare (Workers + D1). Código em <a
					href="https://github.com/brigide/caderninho">github.com/brigide/caderninho</a
				>.
			</p>
		</section>

		<section
			class="card card--surface card__pad"
			style="display:flex;flex-direction:column;gap:8px"
		>
			<span class="overline">Privacidade</span>
			<p class="small">
				Guardamos só o que você digita: nome, usuário, senha (com hash PBKDF2 e salt), suas
				figurinhas e suas turmas. Sem rastreadores, sem anúncios, sem e-mail. Você pode exportar seu
				álbum em CSV e zerá-lo quando quiser, na tela Conta.
			</p>
		</section>
	</div>
</main>
