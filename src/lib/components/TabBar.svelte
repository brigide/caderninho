<script lang="ts">
	import { page } from '$app/state';

	const items = [
		{
			href: '/album',
			label: 'Álbum',
			d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
		},
		{ href: '/estatisticas', label: 'Estatísticas', d: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3' },
		{
			href: '/turmas',
			label: 'Turmas',
			d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'
		},
		{ href: '/conta', label: 'Conta', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }
	];
	const current = $derived(page.url.pathname);
</script>

<nav class="tabbar" aria-label="Principal">
	{#each items as it (it.href)}
		<a
			class="tabbar__item"
			href={it.href}
			aria-current={current.startsWith(it.href) ? 'page' : undefined}
		>
			<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
				{#each it.d.split(' M') as seg, i (i)}<path d={i === 0 ? seg : 'M' + seg} />{/each}
				{#if it.href === '/turmas'}<circle cx="9" cy="7" r="4" />{/if}
				{#if it.href === '/conta'}<circle cx="12" cy="7" r="4" />{/if}
			</svg>
			{it.label}
		</a>
	{/each}
</nav>
