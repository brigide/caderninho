/* Abrindo envelope — teclado numérico/letras, lançar, desfazer, contador do envelope.
   Na implementação real: "Lançar" = POST lancamento; "Desfazer" = marca desfeito_em. */
(function () {
  'use strict';
  var C = window.Caderninho;
  var root = document.querySelector('[data-envelope]');
  if (!root) return;

  var copias = C.colecaoExemplo();
  var MAX = 4;
  var state = {
    input: '',
    letras: false,
    log: [ /* lançamentos deste envelope, mais antigo primeiro */
      { codigo: '12', antes: 0 }, { codigo: '87', antes: 1 }, { codigo: '140', antes: 0 },
      { codigo: 'A3', antes: 2 }, { codigo: '205', antes: 0 }
    ],
    extras: { 'A3': 3 } /* códigos com letra não estão no catálogo de exemplo */
  };
  /* aplica o log inicial na coleção de exemplo */
  state.log.forEach(function (l) { if (/^\d+$/.test(l.codigo)) copias[Number(l.codigo)] = l.antes + 1; });

  function atual(codigo) { return /^\d+$/.test(codigo) ? (copias[Number(codigo)] || 0) : (state.extras[codigo] || 0); }
  function definir(codigo, v) { if (/^\d+$/.test(codigo)) copias[Number(codigo)] = v; else state.extras[codigo] = v; }

  var NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  function render() {
    var vis = root.querySelector('[data-display]');
    vis.textContent = state.input;
    vis.setAttribute('aria-label', state.input ? 'Número digitado: ' + state.input : 'Nenhum número digitado');

    var teclas = state.letras ? ABC : NUM;
    root.querySelectorAll('[data-key-index]').forEach(function (b) {
      var t = teclas[Number(b.dataset.keyIndex)];
      b.textContent = t; b.dataset.char = t; b.setAttribute('aria-label', t);
    });
    var modo = root.querySelector('[data-mode]');
    modo.textContent = state.letras ? '123' : 'ABC';
    modo.setAttribute('aria-label', state.letras ? 'Mudar para números' : 'Mudar para letras');

    var novas = state.log.filter(function (l) { return l.antes === 0; }).length;
    root.querySelector('[data-new]').textContent = novas + (novas === 1 ? ' nova' : ' novas');
    root.querySelector('[data-dup]').textContent = (state.log.length - novas) + ((state.log.length - novas) === 1 ? ' repetida' : ' repetidas');

    var ultimo = state.log[state.log.length - 1];
    var res = root.querySelector('[data-result]');
    if (ultimo) {
      res.hidden = false;
      res.className = 'result ' + (ultimo.antes ? 'result--dup' : 'result--new');
      res.innerHTML = '<span class="stamp">' + ultimo.codigo + '</span> · ' + (ultimo.antes ? 'Repetida ×' + (ultimo.antes + 1) : 'Nova! ✓');
    } else { res.hidden = true; }

    var lista = root.querySelector('[data-recent]');
    lista.innerHTML = state.log.slice(-5).reverse().map(function (l, i) {
      var idx = state.log.length - 1 - i;
      var dup = l.antes > 0;
      return '<li class="recent-row"><span class="cell cell--sm ' + (dup ? 'cell--give' : 'cell--have') + '" style="width:34px;min-width:34px;cursor:default">' + l.codigo + '</span>' +
        '<span class="strong" style="flex:1">' + (dup ? 'Repetida ×' + (l.antes + 1) : 'Nova! colada ✓') + '</span>' +
        '<button type="button" class="icon-btn icon-btn--bare" data-undo="' + idx + '" aria-label="Desfazer ' + l.codigo + '">' +
        '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg></button></li>';
    }).join('');
  }

  function lancar() {
    if (!state.input) return;
    var codigo = state.input;
    var antes = atual(codigo);
    definir(codigo, antes + 1);
    state.log.push({ codigo: codigo, antes: antes });
    state.input = '';
    render();
  }

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.char && state.input.length < MAX) { state.input += b.dataset.char; render(); }
    else if (b.hasAttribute('data-backspace')) { state.input = state.input.slice(0, -1); render(); }
    else if (b.hasAttribute('data-mode')) { state.letras = !state.letras; render(); }
    else if (b.hasAttribute('data-go')) { lancar(); }
    else if (b.dataset.undo) {
      var l = state.log.splice(Number(b.dataset.undo), 1)[0];
      definir(l.codigo, l.antes);
      render();
    }
  });

  /* Teclado físico também funciona (desktop/teclado bluetooth) */
  document.addEventListener('keydown', function (ev) {
    if (/^[0-9a-iA-I]$/.test(ev.key) && state.input.length < MAX) { state.input += ev.key.toUpperCase(); render(); }
    else if (ev.key === 'Backspace') { state.input = state.input.slice(0, -1); render(); }
    else if (ev.key === 'Enter') { lancar(); }
    else if (ev.key === 'Escape') { location.href = 'album.html'; }
  });

  render();
})();
