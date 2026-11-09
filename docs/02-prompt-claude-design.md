# Prompt para o Claude Design — "Snoopy 2026: Um Ano para Recordar"

> Cole o bloco abaixo inteiro no Claude Design. Ele foi escrito para gerar um design system + 8 telas mobile-first, prontas para virar componentes SvelteKit + Tailwind.

---

```
Você vai desenhar um web app mobile-first chamado **"Caderninho de Figurinhas"**, um companheiro para o álbum de figurinhas Panini "Snoopy – Um Ano para Recordar" (2026). Dois amigos usam o app no celular enquanto abrem envelopes: marcam figurinhas coladas, contam repetidas, veem estatísticas e descobrem trocas entre si.

## Direção estética: cozy / aesthetic / Snoopy — sem usar os personagens

RESTRIÇÃO LEGAL E DE PRODUTO (obrigatória):
- NÃO desenhe nem inclua Snoopy, Woodstock, Charlie Brown ou qualquer personagem/tira Peanuts. São propriedade da Peanuts Worldwide. Evoque o universo por paleta, formas e humor.
- NÃO use imagens geradas por IA. Onde houver foto/ilustração, deixe um placeholder com legenda "FOTO LIVRE: <descrição>" (ex.: "FOTO LIVRE: folhas de outono sobre mesa de madeira, Unsplash"). Ícones devem ser de set open source (Lucide ou Phosphor).

Sensação desejada: um caderno de papel kraft sobre uma mesa de madeira num fim de tarde, com uma caneca quente. Aconchegante, analógico, levemente nostálgico, nunca infantil demais e nunca "corporativo".

Referências visuais permitidas: casinha vermelha de cachorro (silhueta/forma, sem o cão), zigue-zague amarelo-e-preto de camiseta, pipa presa numa árvore, cobertor azul-claro, piano de brinquedo, passarinho amarelo em forma abstrata (apenas círculos), folhas de outono, abóboras, flocos de neve, flores de primavera, ondas de verão.

## Tokens

Paleta (nomes para usar no handoff):
- `paper`      #F6EFE3  (fundo principal, papel creme)
- `kraft`      #E8D8BF  (cartões, abas)
- `ink`        #2B2622  (texto principal, traço de caneta)
- `ink-soft`   #6E635A  (texto secundário)
- `doghouse`   #C8463B  (ação primária, "casinha vermelha")
- `zigzag`     #F2C94C  (destaque, amarelo Woodstock/camiseta)
- `blanket`    #9FC5E8  (azul cobertor, informação)
- `grass`      #7FA86B  (sucesso / colada)
- Acentos por estação (usar nas abas e cabeçalhos de seção):
  - Primavera `#E9A9C0` rosa cerejeira
  - Verão     `#F4B860` laranja sol
  - Outono    `#B8683A` cobre folha
  - Inverno   `#8FA9C9` azul gelo

Tipografia:
- Display / títulos: uma fonte manuscrita-arredondada legível (ex.: "Gochi Hand", "Patrick Hand" ou "Caveat" do Google Fonts) — sensação de caneta hidrográfica.
- Corpo / números: sans humanista arredondada (ex.: "Nunito" ou "Quicksand").
- Números de figurinha em estilo "carimbo": monoespaçada leve (ex.: "DM Mono") dentro de um quadradinho.

Forma e textura:
- Cantos arredondados 12–16px; bordas de 1.5px em `ink` com leve irregularidade "desenhada à mão" em elementos chave (botão primário, cards de estação).
- Sombra curta e quente (offset 2–3px, sem blur, cor `ink` a 15%) — efeito papel recortado colado.
- Texturas sutis em CSS/SVG: pontilhado de caderno no fundo, fita adesiva (washi tape) segurando cards, borda picotada em "envelopes".
- Microinterações: ao marcar figurinha colada, o quadradinho "cola" com um pequeno squash & stretch e um rabisco de check à mão; repetida mostra um badge amarelo "×2".

## Estados de uma figurinha (componente central: `StickerCell`)
Quadradinho 56×56 com o código (ex.: "12", "A3") em carimbo.
1. **Faltando** — contorno tracejado em `ink-soft`, fundo transparente, código apagado.
2. **Colada** — fundo `grass` suave, código em `ink`, check rabiscado no canto.
3. **Repetida** — igual a Colada + badge `zigzag` com "×N" no canto superior direito.
4. **Tipo** — indicador discreto: regular (nada), especial (brilho/metálico diagonal sutil), ameba (contorno orgânico irregular em vez de quadrado).
Toque = colar / desfazer. Toque longo ou botão "+" = adicionar repetida. Deve funcionar com o polegar, uma mão.

## Telas (mobile 390×844 primeiro; depois uma variante desktop 1280 para Álbum e Trocas)

1. **Login** — capa de caderno: título manuscrito "Caderninho de Figurinhas", subtítulo "Snoopy · Um Ano para Recordar · 2026", campos usuário/senha em estilo linha de caderno, botão `doghouse` "Entrar", link "Criar conta". Placeholder de foto livre no topo (mesa de madeira, luz quente).

2. **Registro** — mesmo estilo; campos nome de exibição, usuário, senha (sem código de convite; cadastro livre).

3. **Meu Álbum** (tela principal)
   - Topo fixo: progresso geral como "fita de caderno": barra com 4 segmentos coloridos por estação e texto "187 / 276 · 68%".
   - Chips de filtro roláveis: Todas · Faltando · Coladas · Repetidas · Regular · Especial · Ameba. Busca por código.
   - Botão flutuante (FAB) `doghouse` "Abrir envelope" com ícone de envelope.
   - Seções por estação com cabeçalho em acento sazonal e mini-progresso ("Primavera 52/69"); grade de StickerCells 6 colunas no mobile.
   - Navegação inferior com 4 abas: Álbum · Estatísticas · Turmas · Conta (ícones Lucide: book-open, bar-chart-3, users, user).

4. **Modo "Abrindo envelope"** (bottom sheet sobre o Álbum)
   - Campo grande "Digite o número", teclado numérico + botão para alternar letras; ao enviar, mostra um chip com o resultado: "12 · Nova! ✓" em verde ou "12 · Repetida ×2" em amarelo.
   - Lista dos 5 últimos lançados com desfazer.
   - Contador do envelope atual "3 novas · 2 repetidas".

5. **Detalhe da figurinha** (bottom sheet)
   - Código grande em carimbo, estação, tipo, página.
   - Estado atual e botões: "Colar", "+ Repetida", "– Repetida", "Desmarcar".
   - Bloco "Na sua turma": "Ana precisa dessa" / "Léo tem repetida".

6. **Estatísticas**
   - Cards estilo papel colado com washi tape: "% completo" (anel de progresso em `grass`), "Faltam 89", "Repetidas 134", "Ritmo: 23 figurinhas/semana".
   - Barras horizontais por estação (acentos sazonais) e por tipo (regular/especial/ameba).
   - Card "Estimativa": "≈ 41 envelopes (~R$ 205) para completar · ou peça 89 avulsas por R$ 89 na Panini".
   - Mini linha do tempo semanal desenhada à mão (sparkline).

7. **Turmas**
   - Lista: card por turma com nome manuscrito, avatares-iniciais dos membros e progresso de cada um como pequenas barras.
   - Detalhe do turma: membros (nome, % completo, nº de repetidas), botão "Convidar" que abre sheet com link copiável e validade "expira em 7 dias", ações "Remover" (dono) e "Sair".
   - Estado vazio ilustrado com placeholder "FOTO LIVRE: duas canecas numa mesa".

8. **Trocas** (dentro do turma)
   - Cabeçalho: "Trocas com a turma".
   - Card por membro, dividido em duas colunas estilo "envelope aberto": **"Você dá"** (seus repetidos que ele precisa) e **"Você recebe"** (repetidos dele que você precisa), cada uma com StickerCells pequenos; rodapé do card: "Troca justa: 6 ↔ 6" com botão "Marcar como trocadas".
   - Seção "Mais procuradas na turma": lista de códigos com quantos membros precisam.
   - Estado vazio: "Por enquanto ninguém tem o que o outro precisa. Abram mais envelopes ☕".

## Entregáveis
- Design system: paleta, tipografia, espaçamento, componentes (botões, chips, StickerCell nos 4 estados × 3 tipos, cards, bottom sheet, nav inferior, barra de progresso sazonal, badge, campo de formulário em linha de caderno, washi tape, borda picotada).
- As 8 telas em mobile; Álbum e Trocas também em desktop.
- Variante de modo escuro opcional: `paper` → #221E1A, `kraft` → #2E2823, manter acentos.
- Anotações de handoff em cada componente com os nomes dos tokens acima.
- Todo texto da interface em português do Brasil.
```
