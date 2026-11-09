# Snoopy 2026 — Plano de Implementação

Site auxiliar para o álbum **"Snoopy – Um Ano para Recordar"** (Panini Brasil, 2026).
Escopo: 2 usuários previstos, zero preocupação com escala, custo zero de hospedagem.

---

## 0. O que descobri sobre o álbum

| Item                                | Valor                                                                       | Fonte                             |
| ----------------------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| Nome oficial                        | Snoopy – Um Ano para Recordar                                               | Panini / Abramark                 |
| Editora / ano                       | Panini Brasil, 2026 (bancas a partir de ~31/ago–set/2026)                   | Abramark, Trambicast              |
| Total de figurinhas                 | **276**                                                                     | Panini, Abramark, trocafigurinhas |
| Regulares (papel couchê)            | 144                                                                         | Abramark, Trambicast              |
| Especiais (acabamento diferenciado) | 60                                                                          | Abramark, Trambicast              |
| Ameba (recorte especial)            | 72                                                                          | Abramark, Trambicast              |
| Panini conta "especiais"            | 132 (= 60 + 72)                                                             | panini.com.br                     |
| Estrutura                           | 4 seções: Primavera, Verão, Outono, Inverno                                 | Trambicast                        |
| Páginas / formato                   | 48 páginas, 232 x 287 mm, pôster 464 x 554 mm encartado                     | Abramark                          |
| Envelope                            | 5 figurinhas, R$ 5,00                                                       | Panini                            |
| Álbum                               | Brochura R$ 19,90 / Capa dura R$ 69,90                                      | Panini                            |
| Figurinhas avulsas                  | R$ 1,00/cromo em panini.com.br/cromos-faltantes-snoopy-um-ano-para-recordar | Panini                            |
| Prazo p/ pedir faltantes            | Fevereiro de 2028                                                           | trocafigurinhas                   |
| Código do álbum (Panini)            | 005625ABRP88 / SKU 005625SBR                                                | trocafigurinhas, Panini           |

**Lacuna importante:** nenhuma fonte online publica o _checklist numerado_ (quais códigos são regulares, especiais ou ameba, e quais pertencem a cada estação). Em álbuns Panini recentes as especiais costumam ter prefixo de letra (ex.: `A1…`, `E1…`) e as regulares são `1…N`, mas isso **não foi confirmado** para este álbum.

**Decisão:** o sistema trata a lista de figurinhas como **dado de seed** (um CSV `stickers.csv`) que você preenche olhando o índice do álbum físico. O modelo é agnóstico ao formato do código (texto), então funciona com `1`, `A12` ou `V-07`.

> Em paralelo, o álbum "Snoopy 75 Anos" (2025) tem 264 figurinhas — não confundir. Os anúncios da Amazon/Magalu com "Snoopy 2026" referem-se ao Um Ano para Recordar.

---

## 1. Visão do produto

Um "caderninho" digital, aconchegante, que duas pessoas usam no celular enquanto abrem envelopes:

1. **Meu álbum** — grade de todas as 276 figurinhas por estação; toque marca colada; toque longo / botão "+" registra repetida.
2. **Estatísticas** — % completo, por estação e por tipo, repetidas totais, "faltam X", ritmo (figurinhas/semana), estimativa de envelopes.
3. **Turmas** — criar turma, convidar por link, ver membros.
4. **Trocas** — dentro do turma, para cada membro: _"o que eu posso dar"_ (minhas repetidas que ele não tem) e _"o que ele pode me dar"_ (repetidas dele que me faltam). Resumo "troca justa" (n ↔ n).
5. **Login/registro** simples com senha hasheada + salt.

Não-objetivos: app nativo, notificações push, chat, marketplace público, qualquer coisa que exija escala.

---

## 2. Stack (minha escolha, pensada para o free tier da Cloudflare)

| Camada           | Escolha                                                                                                                             | Por quê                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework        | **SvelteKit** + `@sveltejs/adapter-cloudflare`                                                                                      | SSR + form actions (funciona sem JS), uma única app full-stack, leve.                |
| Runtime          | **Cloudflare Workers** (Static Assets)                                                                                              | Free tier generoso, zero servidor.                                                   |
| Banco            | **Cloudflare D1** (SQLite)                                                                                                          | Relacional, grátis, nativo do Workers.                                               |
| ORM / migrations | **Drizzle ORM** + `drizzle-kit`                                                                                                     | Schema tipado, migrations SQL para D1.                                               |
| Estilo           | **Tailwind CSS v4** + tokens CSS próprios                                                                                           | Rápido de estilizar o visual cozy a partir do design.                                |
| Auth             | Sessão em cookie `HttpOnly; Secure; SameSite=Lax`, tabela `sessions` no D1                                                          | Simples, sem libs externas.                                                          |
| Hash de senha    | **PBKDF2-SHA-256, 100.000 iterações, salt 16 bytes aleatório**, via `crypto.subtle` (WebCrypto nativo do Workers)                   | bcrypt/argon2 não rodam bem no limite de CPU do free tier; PBKDF2 é nativo e rápido. |
| Validação        | **Zod**                                                                                                                             | Form actions + API.                                                                  |
| Testes           | **Vitest** (lógica de domínio: matching de trocas, estatísticas) + Playwright opcional                                              | Cobrir o que dói se quebrar.                                                         |
| CI/CD            | **GitHub Actions**: `ci.yml` (check + testes + build em PR) e `deploy.yml` (migrations D1 + `wrangler deploy` ao mergear em `main`) | Repositório `brigide/caderninho`. Ver `03-hospedagem-cloudflare.md`.                 |

Alternativa igualmente válida: Astro + Hono. Fiquei com SvelteKit pela ergonomia de formulários.

---

## 3. Modelo de dados (D1 / SQLite)

```sql
-- Usuários e sessões
CREATE TABLE users (
  id            TEXT PRIMARY KEY,            -- nanoid
  username      TEXT UNIQUE NOT NULL COLLATE NOCASE,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,               -- base64
  password_salt TEXT NOT NULL,               -- base64, 16 bytes
  hash_iters    INTEGER NOT NULL DEFAULT 100000,
  created_at    INTEGER NOT NULL             -- unix ms
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,               -- 32 bytes aleatórios, base64url
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- Catálogo do álbum (seed a partir de stickers.csv)
CREATE TABLE sections (                      -- Primavera, Verão, Outono, Inverno (+ Capa/Extras se houver)
  id       TEXT PRIMARY KEY,                 -- 'primavera' | 'verao' | 'outono' | 'inverno' | 'extras'
  name     TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE stickers (
  code        TEXT PRIMARY KEY,              -- texto: '1', 'A12', etc.
  sort_order  INTEGER NOT NULL,              -- ordem no checklist
  section_id  TEXT NOT NULL REFERENCES sections(id),
  kind        TEXT NOT NULL CHECK (kind IN ('regular','especial','ameba')),
  page        INTEGER,                       -- página do álbum (opcional)
  label       TEXT                           -- descrição curta (opcional)
);

-- Estado de cada usuário por figurinha
CREATE TABLE user_stickers (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sticker_code TEXT NOT NULL REFERENCES stickers(code),
  copias       INTEGER NOT NULL DEFAULT 0,   -- 0 faltando · 1 colada · 2+ repetida (copias-1 p/ troca)
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (user_id, sticker_code)
);
CREATE INDEX idx_user_stickers_spare ON user_stickers(sticker_code) WHERE copias > 1;

-- Turmas
CREATE TABLE turmas (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  owner_id   TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);

CREATE TABLE turma_membros (
  turma_id  TEXT NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL CHECK (role IN ('owner','member')),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (turma_id, user_id)
);

CREATE TABLE turma_convites (
  token      TEXT PRIMARY KEY,               -- 24 bytes aleatórios, base64url
  turma_id   TEXT NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  expires_at INTEGER NOT NULL,               -- padrão: 7 dias
  max_uses   INTEGER NOT NULL DEFAULT 1,
  uses       INTEGER NOT NULL DEFAULT 0
);

-- Histórico leve (para o gráfico de ritmo no dashboard)
CREATE TABLE sticker_events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sticker_code TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('pasted','unpasted','spare+','spare-')),
  at           INTEGER NOT NULL
);
```

Regras de domínio:

- Linha ausente em `user_stickers` ⇒ `copias = 0` (faltando).
- **Faltando** = `copias = 0`. **Colada** = `copias ≥ 1`. **Repetida** = `copias ≥ 2`, com `copias − 1` disponíveis para troca. Mesmo modelo do `data.js` do handoff.
- "Lançar figurinha X" (abrindo envelope): `copias += 1`. "Desfazer": `copias −= 1` (mínimo 0).

### `stickers.csv` (seed)

```
code,sort_order,section_id,kind,page,label
1,1,primavera,regular,2,
2,2,primavera,regular,2,
...
A1,145,primavera,especial,3,
...
```

Você transcreve do índice do álbum. Enquanto não tiver o checklist, use um seed placeholder `1..276` todas em `kind=regular`, `section_id` dividido em 4 blocos de 69 — a UI já fica utilizável e você corrige o CSV depois (migration de dados idempotente: `INSERT OR REPLACE`).

---

## 4. Rotas / telas

| Rota                         | O quê                                                                                                                                                                       | Auth    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `/login`, `/registro`        | Form actions; **cadastro livre** (sem código de convite). Proteção mínima: rate limit por IP e senha ≥ 8 caracteres.                                                        | pública |
| `/`                          | Redireciona para `/album`                                                                                                                                                   | —       |
| `/album`                     | Grade por estação; chips de filtro (Faltando / Coladas / Repetidas / Tipo); busca por código; modo "abrindo envelope" (campo de digitação rápida: digita `12 ↵ A3 ↵ 12 ↵`). | logado  |
| `/album/[code]` (ou drawer)  | Detalhe: estado, botões `Colar`, `+ Repetida`, `– Repetida`, `Desmarcar`; quem no turma precisa / tem.                                                                      | logado  |
| `/stats`                     | Dashboard: % total, por estação, por tipo; repetidas; ritmo semanal; estimativa de envelopes restantes (modelo coupon collector simplificado).                              | logado  |
| `/turmas`                    | Lista meus turmas; criar turma.                                                                                                                                             | logado  |
| `/turmas/[id]`               | Membros, progresso de cada um, botão "Gerar convite" (copia link), remover membro (owner), sair.                                                                            | membro  |
| `/convite/[token]`           | Aceitar convite (se não logado → login/registro e volta).                                                                                                                   | pública |
| `/turmas/[id]/trocas`        | Dashboard de trocas: cards por membro com "Você dá" / "Você recebe" e proposta de troca equilibrada; lista "mais procuradas no turma".                                      | membro  |
| `/conta`                     | Trocar nome/senha, exportar meu álbum em CSV/JSON, zerar álbum.                                                                                                             | logado  |
| `/api/sticker/[code]` (POST) | Ações rápidas via `fetch` para a grade (progressive enhancement).                                                                                                           | logado  |

### Lógica de trocas (função pura, testada com Vitest)

```ts
type Copias = Record<string, number>; // code -> copias
function trocas(me: Copias, other: Copias, codes: string[]) {
	const iGive = codes.filter((c) => (me[c] ?? 0) > 1 && (other[c] ?? 0) === 0);
	const iReceive = codes.filter((c) => (other[c] ?? 0) > 1 && (me[c] ?? 0) === 0);
	const fair = Math.min(iGive.length, iReceive.length);
	return { iGive, iReceive, fair };
}
```

Uma query D1 por membro resolve isso (JOIN de `user_stickers` de A com B); com 2–5 usuários nem precisa otimizar.

### Estimativa de envelopes restantes

Modelo simples: com `m` faltantes de `N = 276`, probabilidade de uma figurinha nova por cromo ≈ `m/N`; envelopes esperados para a próxima nova ≈ `N / (5·m)`. Somar harmonicamente até `m = 0` dá o total esperado. Mostrar como "≈ X envelopes (~R$ Y)" e sugerir "a partir de ~40 faltantes, compensa pedir avulsas a R$ 1,00 na Panini".

---

## 5. Segurança (proporcional ao risco)

- Hash: `PBKDF2(password, salt16, 100000, SHA-256, 32 bytes)`; armazenar hash, salt e iterações. Comparação em tempo constante (`crypto.subtle.timingSafeEqual` ou XOR manual).
- Sessão: id aleatório 32 bytes, 30 dias, renovada a cada acesso; `HttpOnly; Secure; SameSite=Lax; Path=/`.
- CSRF: SvelteKit form actions já checam origem; nas rotas `/api` exigir header `X-Requested-With` e mesma origem.
- Cadastro livre (decisão do usuário); rate limit básico (contador em D1 por IP/hora) em login e registro.
- Convites expiram e têm `max_uses`.
- Autorização: toda query de turma filtra por `turma_membros` do usuário logado.
- Sem MFA, sem OAuth, sem e-mail (conforme RNF).

---

## 6. Imagens (restrição: nada gerado por IA)

Atenção: **personagens Peanuts são propriedade da Peanuts Worldwide LLC**; as tiras não estão em domínio público (Schulz morreu em 2000; no Brasil o prazo é 70 anos). Não existe acervo "livre" de Snoopy. Portanto o visual "snoopy" vem de **evocação** (paleta, motivos, humor), não de arte dos personagens.

Fontes permitidas (uso livre, sem IA):

- **Fotos cozy / estações**: Unsplash, Pexels (licenças próprias, livres para uso) — folhas de outono, neve, piquenique, abóboras, cobertor, caneca.
- **Ilustrações vintage de domínio público**: Rawpixel (coleção public domain), Biodiversity Heritage Library (flora por estação), Old Book Illustrations, Public Domain Review.
- **Ícones**: Lucide (ISC), Phosphor (MIT), OpenMoji (CC BY-SA 4.0 — exige crédito).
- **Texturas**: papel kraft / grid de caderno — criar em CSS/SVG manualmente (não é IA).

Checklist por imagem: salvar URL de origem, autor e licença em `static/img/CREDITS.md`; exibir página `/creditos`.

---

## 6b. Handoff de design (recebido em 09/11/2026)

Pasta `design-handoff/`: 14 telas em HTML/CSS/JS puros, `tokens/design-tokens.json` (W3C), fontes Patrick Hand / Nunito / DM Mono (OFL, self-hosted), modo escuro via `data-theme="dark"`, e `js/data.js` com as regras de negócio (`resumo`, `trocas`, `maisProcuradas`, `estimativaColecionador`). Portar assim:

- `css/tokens.css` → `src/app.css` (manter nomes); `fonts/` → `static/fonts/`.
- `components.css` → classes globais na v1; componentizar `StickerCell` (props `codigo`, `tipo`, `copias`).
- Regras de `data.js` → `src/lib/trades.ts` / `stats.ts` com testes.
- Ajustes pedidos: toda ocorrência de "Grupo(s)" vira **"Turma(s)"** na UI e nas rotas; tela de Registro **sem** campo "Código de convite".

## 7. Estrutura do repositório

```
snoopy-album/
├─ src/
│  ├─ lib/
│  │  ├─ server/
│  │  │  ├─ db/ (schema.ts drizzle, client.ts)
│  │  │  ├─ auth.ts (pbkdf2, sessions, guards)
│  │  │  ├─ trades.ts (função pura)
│  │  │  └─ stats.ts (função pura)
│  │  ├─ components/ (StickerCell, SeasonSection, StatCard, TradeCard, InviteLink…)
│  │  └─ styles/tokens.css
│  ├─ routes/ (conforme tabela acima)
│  ├─ hooks.server.ts (carrega sessão → locals.user)
│  └─ app.css
├─ data/stickers.csv
├─ scripts/seed.ts (csv → SQL idempotente)
├─ drizzle/ (migrations)
├─ static/img/ + CREDITS.md
├─ .github/workflows/ (ci.yml, deploy.yml)
├─ wrangler.jsonc
├─ drizzle.config.ts
└─ tests/ (trades.test.ts, stats.test.ts, auth.test.ts)
```

---

## 8. Fases de entrega

### Fase 0 — Fundação (1 sessão)

- `npm create cloudflare@latest` → SvelteKit, adapter-cloudflare, Tailwind, Drizzle, Vitest.
- `wrangler d1 create snoopy-album`; binding `DB` em `wrangler.jsonc`.
- Schema + primeira migration; seed placeholder 1..276.
- Deploy "hello world" no `*.workers.dev` para validar pipeline cedo.
- Workflows `ci.yml` + `deploy.yml`, secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` no repo; push em `main` deve publicar sozinho.
- **Pronto quando:** site no ar mostrando 276 quadradinhos vazios **e** um merge em `main` redeploya sem intervenção.

### Fase 1 — Auth

- Registro (fechado por env), login, logout, `hooks.server.ts`, guards.
- Testes: hash/verify, sessão expirada.
- **Pronto quando:** dois usuários conseguem logar em celulares diferentes.

### Fase 2 — Meu álbum

- Grade por estação com estados; ações colar / repetida / desfazer (form action + fetch otimista).
- Modo "abrindo envelope" com input de digitação rápida.
- Filtros e busca.
- **Pronto quando:** dá para registrar um envelope real em < 20 segundos.

### Fase 3 — Estatísticas

- `/stats` com cards e barras por estação/tipo; ritmo semanal via `sticker_events`; estimativa de envelopes.
- **Pronto quando:** números batem com uma contagem manual.

### Fase 4 — Turmas e convites

- CRUD de turma, membros, link de convite com expiração, sair/remover.
- **Pronto quando:** usuário B entra pelo link do usuário A.

### Fase 5 — Trocas

- `trades.ts` + testes; `/turmas/[id]/trocas` com cards por membro e "troca justa".
- Lista "mais faltantes do turma".
- **Pronto quando:** a tela mostra corretamente um caso montado à mão (A tem repetida 12 que B precisa; B tem A3 que A precisa).

### Fase 6 — Polimento

- Aplicar design final (tokens, imagens creditadas, microinterações), PWA manifest (ícone na home do celular), página `/creditos`, exportar CSV, modo escuro opcional.
- Substituir seed placeholder pelo `stickers.csv` real transcrito do álbum.

---

## 9. Riscos e decisões em aberto

| Risco                                | Mitigação                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Numeração real do álbum desconhecida | Catálogo via CSV editável; `code` é texto. Transcrever do índice físico (30 min). |
| Uso de arte Peanuts                  | Não usar personagens; estética por paleta/motivos. Créditos de toda imagem.       |
| Limite CPU 10 ms no free tier        | PBKDF2 nativo cabe; evitar libs de hash em JS puro.                               |
| D1 100k escritas/dia                 | 2 usuários abrindo envelopes ficam em dezenas/dia. Sem risco.                     |
| Cadastro aberto virar spam           | Rate limit por IP; usernames únicos; fácil fechar depois via env se necessário.   |

Decisões que marquei como **minhas** (ajuste se discordar): SvelteKit em vez de Astro/Next; PBKDF2 em vez de bcrypt; contador único `copias` (alinhado ao handoff); cadastro livre (pedido seu); modo escuro incluído pois o handoff já o entrega.
