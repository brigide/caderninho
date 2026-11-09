# Caderninho de Figurinhas — pacote de handoff

Implementação de referência em **HTML, CSS e JS puros** das telas desenhadas no canvas
"Caderninho de Figurinhas". Não precisa de build nem servidor: abra `index.html`.

O documento de handoff (tokens, componentes, regras de negócio, acessibilidade e
pendências) está no doc "Handoff · Caderninho de Figurinhas". Este README cobre só o código.

## Estrutura

```
index.html                 galeria com todas as telas (+ alternância de tema)
telas/                     uma página por tela
  login.html  registro.html  album.html  envelope.html  detalhe.html
  estatisticas.html  grupos.html  grupo-detalhe.html  convite.html
  grupos-vazio.html  trocas.html  trocas-vazio.html
  desktop-album.html  desktop-trocas.html
css/
  tokens.css               variáveis (claro + [data-theme="dark"])
  fonts.css                @font-face self-hosted
  base.css                 reset, tipografia utilitária, .screen, reduced-motion
  components.css           botões, chips, StickerCell, cards, sheet, nav, progresso…
  illustrations.css        cenas em CSS puro (mesa, canecas, vapor, folhas, envelopes)
js/
  theme.js                 aplica ?tema=escuro
  data.js                  catálogo/coleção de exemplo + regras (resumo, trocas, estimativas)
  album.js                 Álbum: colar, repetida, filtros, busca, toque longo
  envelope.js              teclado, lançar, desfazer, contador do envelope
  trocas.js                cards de troca + mais procuradas
tokens/design-tokens.json  tokens no formato W3C Design Tokens
fonts/                     Patrick Hand, Nunito, DM Mono (OFL) — subconjunto Latin
screenshots/               PNG 2× de cada tela (390 px de largura no mobile)
```

## Convenções

- **Tokens primeiro.** Nenhum componente usa hex solto, exceto as ilustrações e o
  caderno do Login, que são objetos "físicos" e não mudam com o tema.
- **Classes estilo BEM leve:** `.cell`, `.cell--have`, `.cell__badge`. Estados de UI
  por atributo ARIA quando existe (`aria-pressed`, `aria-current`), senão `.is-*`.
- **Estilos inline nas telas** são só de layout pontual. Ao portar para componentes,
  vire-os em props ou classes utilitárias.
- **Modo escuro:** `<html data-theme="dark">`. Nas telas, teste com `?tema=escuro`.
- **Movimento:** tudo respeita `prefers-reduced-motion`.

## Interatividade incluída

| Tela | O que funciona |
| --- | --- |
| Álbum (mobile e desktop) | tocar cola/desfaz com animação; toque longo (500 ms) abre o Detalhe; Shift+clique soma repetida; filtros; busca por prefixo |
| Abrindo envelope | teclado 0–9 e A–I, ⌫, Lançar, desfazer nos 5 últimos, contador; teclado físico também (Enter lança, Esc fecha) |
| Convidar | copiar link (rótulo "Copiado!" por 2 s) e compartilhamento nativo |

O estado é só em memória; recarregar a página volta ao exemplo.

## Ao portar para um framework

- `StickerCell` é o componente central: props `codigo`, `tipo` (regular | especial | ameba),
  `copias` (0, 1, 2+), `onToggle`, `onLongPress`. Os 3 estados saem de `copias`.
- `data.js` já separa **regras** (`resumo`, `trocas`, `maisProcuradas`,
  `estimativaColecionador`) de **dados de exemplo** (`CATALOGO`, `colecaoExemplo`).
  Leve as regras; troque os dados pela API.
- Os números e listas das telas estáticas (Estatísticas, Grupos, Trocas) são fixos e
  batem com o design; ligue-os a `resumo()` e `trocas()`.
- Ícones: desenhados no estilo Lucide; use o pacote `lucide` com os mesmos nomes.

## Licenças

Fontes sob SIL Open Font License 1.1 (`fonts/OFL-*.txt`). Ícones no estilo Lucide (ISC).
Nenhum personagem Peanuts e nenhuma imagem gerada por IA no pacote.
