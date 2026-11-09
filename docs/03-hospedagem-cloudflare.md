# Hospedagem gratuita na Cloudflare — Plano

Objetivo: site + banco + deploy contínuo a **R$ 0,00**, usando apenas o plano Free da Cloudflare.

## 1. Serviços usados e limites do Free (nov/2026 — confira o painel, limites mudam)

| Serviço                                 | Para quê                                                   | Limite Free                                                                                           | Nosso uso estimado (2 usuários)             |
| --------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Workers** (com Static Assets)         | Roda o SvelteKit (SSR + API) e serve os arquivos estáticos | 100.000 requisições/dia; 10 ms CPU/req; assets estáticos ilimitados e sem contar no limite            | < 2.000 req/dia                             |
| **D1**                                  | Banco SQLite                                               | 5 GB total; 5 milhões de leituras/dia; 100.000 escritas/dia; 10 bancos                                | < 1 MB; dezenas de escritas/dia             |
| **GitHub Actions** (fora da Cloudflare) | CI/CD: testa no PR, publica ao mergear em `main`           | grátis em repo público; 2.000 min/mês em privado                                                      | ~2 min por deploy                           |
| **workers.dev**                         | Domínio gratuito `snoopy-album.<conta>.workers.dev`        | incluso                                                                                               | —                                           |
| **Domínio próprio** (opcional)          | `figurinhas.seudominio.com`                                | DNS + TLS grátis se o domínio estiver na Cloudflare; o registro do domínio em si é pago (~US$ 10/ano) | opcional                                    |
| **KV** (opcional)                       | Rate limit de login / cache                                | 100.000 leituras/dia, 1.000 escritas/dia                                                              | não necessário na v1 (usar D1)              |
| **R2** (opcional)                       | Imagens enviadas                                           | 10 GB                                                                                                 | não necessário (imagens ficam em `static/`) |

Não usar: Durable Objects, Queues, Cron Triggers, Images (não precisamos, e alguns não têm free tier generoso). **Pages** também funciona, mas a Cloudflare hoje recomenda Workers + Static Assets para projetos novos; o adapter do SvelteKit suporta os dois.

Cartão de crédito: **não é exigido** para o plano Free de Workers/D1.

## 2. Setup inicial (uma vez)

```bash
npm create cloudflare@latest snoopy-album -- --framework=svelte
```

(escolha SvelteKit, TypeScript; o scaffold já configura `adapter-cloudflare` e `wrangler.jsonc`)

```bash
cd snoopy-album && npx wrangler login
```

```bash
npx wrangler d1 create snoopy-album
```

Cole o `database_id` retornado em `wrangler.jsonc`:

```jsonc
{
	"name": "snoopy-album",
	"compatibility_date": "2026-10-01",
	"compatibility_flags": ["nodejs_compat"],
	"main": ".svelte-kit/cloudflare/_worker.js",
	"assets": { "binding": "ASSETS", "directory": ".svelte-kit/cloudflare" },
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "snoopy-album",
			"database_id": "<id>",
			"migrations_dir": "drizzle"
		}
	],
	"observability": { "enabled": true }
}
```

Segredos (não vão para o repositório):

```bash
npx wrangler secret put SESSION_SECRET
```

## 3. Migrations e seed

Desenvolvimento local (D1 local em SQLite, dentro de `.wrangler/`):

```bash
npx drizzle-kit generate
```

```bash
npx wrangler d1 migrations apply snoopy-album --local
```

```bash
npx wrangler d1 execute snoopy-album --local --file=./data/seed.sql
```

Produção:

```bash
npx wrangler d1 migrations apply snoopy-album --remote
```

```bash
npx wrangler d1 execute snoopy-album --remote --file=./data/seed.sql
```

`data/seed.sql` é gerado por `scripts/seed.ts` a partir de `data/stickers.csv` com `INSERT OR REPLACE`, então pode ser reaplicado quando você corrigir o checklist.

## 4. Deploy

Manual (bom para a primeira vez):

```bash
npm run build && npx wrangler deploy
```

Contínuo (recomendado): **GitHub Actions** no repositório `brigide/caderninho`.

`.github/workflows/deploy.yml` (resumo):

```yaml
name: deploy
on:
  push:
    branches: [main]
concurrency: { group: deploy-prod, cancel-in-progress: false }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run check && npm test && npm run build
      - name: Migrations D1
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: d1 migrations apply caderninho --remote
      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

`.github/workflows/ci.yml` roda em todo PR: `npm ci`, `npm run check`, `npm test`, `npm run build`. Sem deploy.

Secrets necessários no GitHub: `CLOUDFLARE_API_TOKEN` (token restrito: Workers Scripts Edit, D1 Edit, Account Settings Read, User Details Read) e `CLOUDFLARE_ACCOUNT_ID`.

Fluxo: abrir PR → CI verde → merge em `main` → `deploy.yml` aplica migrations e publica em `https://caderninho.<subdominio>.workers.dev`. GitHub Actions é gratuito para repositórios públicos e tem 2.000 min/mês em privados; cada deploy usa ~2 min.

Migrations em produção: aplicadas automaticamente pelo workflow **antes** do deploy. Migrations devem ser aditivas (nunca `DROP` destrutivo sem backup via `wrangler d1 export`).

## 5. Domínio (opcional)

1. Se já tem um domínio na Cloudflare: Worker → **Settings → Domains & Routes → Add → Custom domain** → `figurinhas.seudominio.com`. TLS automático.
2. Se não tem: fique no `*.workers.dev`. É HTTPS, funciona como PWA ("Adicionar à tela inicial") e é suficiente para dois usuários.

## 6. Operação do dia a dia

- **Logs ao vivo:** `npx wrangler tail`.
- **Backup do banco:** `npx wrangler d1 export snoopy-album --remote --output=backup.sql` (rode de vez em quando; D1 também tem Time Travel de 30 dias no Free para restaurar ponto no tempo).
- **Consulta rápida:** `npx wrangler d1 execute snoopy-album --remote --command "SELECT count(*) FROM user_stickers WHERE pasted=1"`.
- **Monitorar limites:** painel → Workers & Pages → Overview mostra requisições/dia; D1 → métricas de leitura/escrita. Com 2 usuários você ficará abaixo de 1% de tudo.

## 7. O que pode dar errado (e a saída)

| Problema                                       | Causa provável                                  | Solução                                                                                       |
| ---------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Error 1102 Worker exceeded CPU time` no login | Hash de senha em JS puro (bcryptjs/argon2 wasm) | Usar `crypto.subtle.deriveBits` com PBKDF2 (nativo), ≤ 100k iterações.                        |
| `D1_ERROR: no such table` em produção          | Migration só aplicada em `--local`              | Rodar `migrations apply --remote`.                                                            |
| Preview branch sem dados                       | Preview usa o mesmo D1 de produção por padrão   | Aceitável aqui; ou criar `snoopy-album-preview` e mapear via `env.preview` no wrangler.jsonc. |
| Build falha com `nodejs_compat`                | Lib usa API Node não suportada                  | Trocar por alternativa Web-API (ex.: `nanoid` em vez de `crypto.randomUUID` do Node).         |
| Cookies não persistem no celular               | Faltou `Secure`/domínio errado                  | Garantir `Secure; SameSite=Lax; Path=/`, acessar sempre via HTTPS.                            |

## 8. Custo total

| Item                                        | Custo       |
| ------------------------------------------- | ----------- |
| Workers + D1 + workers.dev + GitHub Actions | R$ 0        |
| Domínio próprio (opcional)                  | ~US$ 10/ano |
| **Total obrigatório**                       | **R$ 0**    |
