/* Meu Álbum — renderiza as seções por estação e trata colar, repetida, filtros e busca.
   Funciona igual no mobile (album.html) e no desktop (desktop-album.html).
   Estado local em memória; na implementação real, cada mudança vira um PATCH em colecao. */
(function () {
  'use strict';
  var C = window.Caderninho;
  var root = document.querySelector('[data-album]');
  if (!root) return;

  var state = { copias: C.colecaoExemplo(), filtro: 'all', busca: '', pop: null };
  var LONG_PRESS_MS = 500;

  var ICONES = {
    spring: '<svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/></svg>',
    summer: '<svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>',
    autumn: '<svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    winter: '<svg class="icon icon--xs" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/></svg>'
  };
  var STAR = '<svg class="cell__star" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z"/></svg>';
  var CHECK = '<svg class="cell__check" viewBox="0 0 16 14" aria-hidden="true"><path d="M2 8c2 1 3 3 4 4 2-4 5-8 9-10"/></svg>';

  function passaFiltro(f, c) {
    var x = state.filtro;
    var ok = x === 'all' || (x === 'miss' && c === 0) || (x === 'have' && c > 0) ||
      (x === 'dup' && c > 1) || (x === 'reg' && f.tipo === 'regular') ||
      (x === 'esp' && f.tipo === 'especial') || (x === 'ameba' && f.tipo === 'ameba');
    if (ok && state.busca) ok = f.codigo.indexOf(state.busca) === 0;
    return ok;
  }

  function celula(f, c) {
    var cls = 'cell ' + (c > 0 ? 'cell--have' : 'cell--missing') +
      (f.tipo === 'especial' ? ' cell--special' : '') + (f.tipo === 'ameba' ? ' cell--ameba' : '') +
      (state.pop === f.numero ? ' is-popping' : '');
    var label = 'Figurinha ' + f.codigo + (f.tipo !== 'regular' ? ', ' + f.tipo : '') +
      (c === 0 ? ', faltando' : c === 1 ? ', colada' : ', colada, ' + c + ' cópias');
    return '<button type="button" class="' + cls + '" data-n="' + f.numero + '" aria-pressed="' + (c > 0) + '" aria-label="' + label + '" title="' + label + '">' +
      (f.tipo === 'especial' ? (c > 0 ? '<span class="cell__shine"></span>' : '') + STAR : '') +
      f.codigo + (c > 0 ? CHECK : '') + (c > 1 ? '<span class="cell__badge">×' + c + '</span>' : '') + '</button>';
  }

  function render() {
    var r = C.resumo(state.copias);
    var html = '';
    var algum = false;
    C.ESTACOES.forEach(function (e, idx) {
      var cells = '';
      C.CATALOGO.slice(idx * C.POR_ESTACAO, (idx + 1) * C.POR_ESTACAO).forEach(function (f) {
        var c = state.copias[f.numero] || 0;
        if (passaFiltro(f, c)) cells += celula(f, c);
      });
      if (!cells) return;
      algum = true;
      html += '<section class="album-section" id="sec-' + e.id + '" aria-label="' + e.nome + '">' +
        '<div class="section-head"><span class="season-tab season-tab--' + e.id + '">' + ICONES[e.id] + e.nome + '</span>' +
        '<span class="rule" aria-hidden="true"></span><span class="strong num">' + r.porEstacao[e.id].coladas + '/' + C.POR_ESTACAO + '</span></div>' +
        '<div class="sticker-grid' + (root.dataset.album === 'desktop' ? ' sticker-grid--fluid' : '') + '">' + cells + '</div></section>';
    });
    root.querySelector('[data-sections]').innerHTML = algum ? html :
      '<p class="display-s muted center" style="padding:40px 0">Nada por aqui com esse filtro.</p>';

    root.querySelectorAll('[data-progress-text]').forEach(function (el) { el.textContent = r.coladas + ' / ' + C.TOTAL + ' · ' + r.percentual + '%'; });
    root.querySelectorAll('[data-progress-count]').forEach(function (el) { el.textContent = r.coladas; });
    root.querySelectorAll('[data-progress-pct]').forEach(function (el) { el.textContent = r.percentual; });
    C.ESTACOES.forEach(function (e) {
      var pe = r.porEstacao[e.id];
      root.querySelectorAll('[data-season-fill="' + e.id + '"]').forEach(function (el) { el.style.width = Math.round(pe.coladas / pe.total * 100) + '%'; });
      root.querySelectorAll('[data-season-count="' + e.id + '"]').forEach(function (el) { el.textContent = pe.coladas + '/' + pe.total; });
    });
    var contagem = { all: C.TOTAL, miss: r.faltam, have: r.coladas, dup: 0, reg: r.porTipo.regular.total, esp: r.porTipo.especial.total, ameba: r.porTipo.ameba.total };
    C.CATALOGO.forEach(function (f) { if ((state.copias[f.numero] || 0) > 1) contagem.dup++; });
    root.querySelectorAll('[data-filter]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.filter === state.filtro));
      var n = b.querySelector('[data-count]');
      if (n) n.textContent = contagem[b.dataset.filter];
    });
  }

  /* Colar / desfazer; Shift+clique soma repetida; toque longo abre o detalhe */
  var timer = null, longFired = false;
  root.addEventListener('pointerdown', function (ev) {
    var btn = ev.target.closest('.cell[data-n]');
    if (!btn) return;
    longFired = false;
    timer = setTimeout(function () {
      longFired = true;
      location.href = 'detalhe.html?f=' + btn.dataset.n;
    }, LONG_PRESS_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) {
    root.addEventListener(t, function () { clearTimeout(timer); });
  });
  root.addEventListener('contextmenu', function (ev) { if (ev.target.closest('.cell')) ev.preventDefault(); });
  root.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.cell[data-n]');
    if (btn) {
      if (longFired) return;
      var n = Number(btn.dataset.n), c = state.copias[n] || 0;
      if (ev.shiftKey) { state.copias[n] = c + 1; state.pop = c === 0 ? n : null; }
      else { state.copias[n] = c > 0 ? 0 : 1; state.pop = c > 0 ? null : n; }
      render();
      var novo = root.querySelector('.cell[data-n="' + n + '"]');
      if (novo) novo.focus({ preventScroll: true });
      return;
    }
    var f = ev.target.closest('[data-filter]');
    if (f) { state.filtro = f.dataset.filter; state.pop = null; render(); }
  });
  var busca = root.querySelector('[data-search]');
  if (busca) busca.addEventListener('input', function () { state.busca = busca.value.trim().toUpperCase(); state.pop = null; render(); });

  render();
})();
