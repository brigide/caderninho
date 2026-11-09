# Caderninho de Figurinhas

Companheiro para o álbum **Snoopy – Um Ano para Recordar** (Panini, 2026): registre figurinhas coladas e repetidas, veja estatísticas e descubra trocas com a sua turma.

- Produção: https://app.caderninho.workers.dev (Cloudflare Workers + D1, plano Free)
- Documentação: [`docs/`](docs/) — plano de implementação, hospedagem, handoff de design.

## Estado

| Fase | Entrega                                                         | Status |
| ---- | --------------------------------------------------------------- | ------ |
| 0    | Scaffold, D1, CI/CD                                             | ✅     |
| 1    | Login, cadastro livre, sessões                                  | ✅     |
| 2    | Álbum interativo (colar, repetidas, envelope, detalhe, filtros) | ✅     |
| 3    | Estatísticas                                                    | ✅     |
| 4    | Turmas e convites                                               | ✅     |
| 5    | Dashboard de trocas                                             | ✅     |
| 6    | Polimento (PWA, conta, créditos, exportar, tema)                | ✅     |

Pendente: transcrever o checklist real do álbum para `data/stickers.csv` (hoje o catálogo é provisório, 1..276).

## Stack

SvelteKit 3 · `@sveltejs/adapter-cloudflare` · Cloudflare D1 · Drizzle ORM · Tailwind v4 · Vitest · Wrangler.

## Desenvolvimento

```bash
npm install
npm run db:migrate:local   # cria o schema no D1 local (.wrangler/)
npm run db:seed:local      # catálogo (data/stickers.csv ou placeholder 1..276)
npm run dev                # vite dev com bindings via platform proxy
```

Scripts úteis: `npm run check` (tipos), `npm test` (Vitest), `npm run lint` / `npm run format` (Prettier), `npm run db:generate` (nova migration Drizzle), `npm run deploy` (build + `wrangler deploy`).

## Catálogo do álbum

`scripts/seed.ts` gera `data/seed.sql`. Se existir `data/stickers.csv` (colunas `code,sort_order,section_id,kind,page,label`; `section_id` ∈ spring/summer/autumn/winter; `kind` ∈ regular/especial/ameba), ele é usado; senão, um placeholder de 276 figurinhas em 4 estações × 69. A numeração oficial não está publicada online — transcreva do índice do álbum físico.

## Deploy

GitHub Actions: `ci.yml` roda em PRs (lint, check, testes, build); `deploy.yml` roda em cada push em `main`, aplica migrations no D1 remoto e publica o Worker `app`. Secrets necessários no repositório: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Licenças de assets

Fontes Patrick Hand, Nunito e DM Mono sob SIL OFL 1.1 (`static/fonts/OFL-*.txt`). Nenhum personagem Peanuts e nenhuma imagem gerada por IA.
