# Passo a passo — o que preciso de você na Cloudflare e no GitHub

Tudo abaixo é plano Free. Nenhum passo exige cartão de crédito.
Faça os passos na ordem; ao final me mande os itens marcados com 📨.

---

## A. Conta Cloudflare

1. Crie a conta em https://dash.cloudflare.com/sign-up e **confirme o e-mail** (sem isso o Workers não libera o deploy).
2. No menu lateral, abra **Compute (Workers) → Workers & Pages**. Na primeira vez ele pede para escolher o **subdomínio `workers.dev`** (ex.: `bruno-figurinhas`). Escolha um; isso vira `https://<worker>.<subdominio>.workers.dev`.
   📨 **Me informe o subdomínio escolhido.**
3. Ainda em Workers & Pages, no canto direito ("Account details") copie o **Account ID**.
   📨 **Me envie o Account ID** (não é segredo, mas evite colar em lugar público).

## B. Token de API (para eu rodar o `wrangler` daqui)

Preciso de um token **restrito** só ao que o projeto usa. Não use "Global API Key".

1. Acesse https://dash.cloudflare.com/profile/api-tokens → **Create Token** → **Create Custom Token**.
2. Nome: `wrangler-caderninho`.
3. Permissões (Account-level, todas em **Edit** salvo onde indicado):
   | Escopo  | Permissão              | Nível                                                 |
   | ------- | ---------------------- | ----------------------------------------------------- |
   | Account | **Workers Scripts**    | Edit                                                  |
   | Account | **D1**                 | Edit                                                  |
   | Account | **Workers KV Storage** | Edit (só por garantia, se usarmos KV para rate limit) |
   | Account | **Account Settings**   | Read                                                  |
   | User    | **User Details**       | Read                                                  |
   | User    | **Memberships**        | Read                                                  |
4. **Account Resources:** Include → sua conta.
5. **TTL:** opcional; sugiro 90 dias. Dá para revogar a qualquer momento na mesma tela.
6. **Continue to summary → Create Token**. Copie o token (ele só aparece uma vez).
   📨 **Me passe o token aqui no chat** — vou guardá-lo apenas como variável de ambiente `CLOUDFLARE_API_TOKEN` na minha sessão, nunca no repositório. Se preferir não colar no chat, a alternativa é você mesmo rodar `npx wrangler login` no terminal quando eu pedir (abre o navegador, você aprova, e eu sigo).

> Com Account ID + token eu consigo: criar o banco D1, aplicar migrations, fazer o primeiro deploy e configurar secrets. Não consigo (e não preciso) mexer em DNS, billing ou outros serviços.

## C. GitHub

1. Repositório já criado: **https://github.com/brigide/caderninho.git** ✅ (vou usar `caderninho` como nome do Worker também).
2. Confirme se a CLI `gh` está logada na sua conta rodando no terminal:
   ```bash
   gh auth status
   ```
   Se não estiver, rode `gh auth login` e siga o fluxo. (Alternativa: me passe a URL SSH e eu uso a sua chave já configurada.)

## D. CI/CD com GitHub Actions (deploy automático ao mergear PR)

Vou criar dois workflows no repositório; você não precisa clicar em nada no painel da Cloudflare.

| Workflow                       | Dispara em                            | Faz                                                                                                                    |
| ------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | todo PR e push em branches            | `npm ci` → `svelte-check` → `vitest` → `npm run build`                                                                 |
| `.github/workflows/deploy.yml` | push em `main` (ou seja, PR mergeado) | tudo do CI + `wrangler d1 migrations apply caderninho --remote` + `wrangler deploy` (via `cloudflare/wrangler-action`) |

Para isso o repositório precisa de **dois secrets** (Settings → Secrets and variables → Actions):

| Secret                  | Valor                    |
| ----------------------- | ------------------------ |
| `CLOUDFLARE_API_TOKEN`  | o mesmo token do passo B |
| `CLOUDFLARE_ACCOUNT_ID` | o Account ID do passo A  |

Se o `gh` estiver logado, eu mesmo gravo os dois com `gh secret set` assim que receber token e Account ID. Caso contrário, você cola na tela de Secrets do GitHub.

Proteção recomendada (opcional, 1 min): Settings → Branches → regra para `main` exigindo o check `ci` verde antes do merge.

> Alternativa sem Actions: **Workers Builds** (painel Cloudflare conectado ao GitHub). Faz o mesmo, mas a configuração fica fora do repo e exige você autorizar o app GitHub da Cloudflare. Fico com Actions porque o pedido foi "CI no repositório".

## E. Opcional

- **Domínio próprio:** se tiver um domínio na Cloudflare e quiser `figurinhas.seudominio.com`, me diga qual. Senão, ficamos no `*.workers.dev`.
- **Nome do Worker:** vou usar `caderninho` (URL final `https://caderninho.<subdominio>.workers.dev`). Se quiser outro, diga.

---

## Resumo do que me enviar (📨)

| #   | Item                                               | Exemplo                                        |
| --- | -------------------------------------------------- | ---------------------------------------------- |
| 1   | Subdomínio workers.dev                             | `bruno-figurinhas`                             |
| 2   | Account ID                                         | `a1b2c3…` (32 hex)                             |
| 3   | API Token restrito (ou "prefiro `wrangler login`") | `cfut_…`                                       |
| 4   | URL do repositório GitHub                          | ✅ `https://github.com/brigide/caderninho.git` |
| 5   | (opcional) domínio próprio / nome do Worker        | —                                              |

## O que eu faço assim que receber

1. `npm create cloudflare@latest` com SvelteKit + adapter Cloudflare; copio o handoff (`tokens.css`, fontes, componentes).
2. `wrangler d1 create caderninho` → preencho `wrangler.jsonc` com o `database_id`.
3. Schema Drizzle + migration + seed provisório 1..276 (4 estações × 69).
4. `wrangler secret put SESSION_SECRET` (valor aleatório gerado por mim).
5. `npm run build && wrangler deploy` → te mando a URL `https://caderninho.<subdominio>.workers.dev` com a tela de login funcionando.
6. Workflows `ci.yml` e `deploy.yml` + secrets no repositório (`gh secret set`).
7. Commit inicial + push para `main` → o Actions faz o segundo deploy sozinho, provando o pipeline.
