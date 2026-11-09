/* Trocas com a turma — renderiza um card por membro e a lista "Mais procuradas".
   Os dados abaixo são fixos para bater com o design; na implementação real,
   cada card vem de Caderninho.trocas(minhaColecao, colecaoDoMembro) e a lista
   de Caderninho.maisProcuradas([colecoes do grupo]). */
(function () {
  'use strict';
  var C = window.Caderninho;

  var MEMBROS = [
    { nome: 'Ana', cor: 'pink', pct: 74, da: [12, 35, 87, 140, 205, 230], recebe: [3, 44, 101, 158, 199, 251] },
    { nome: 'Léo', cor: 'orange', pct: 61, da: [18, 63, 117, 188], recebe: [9, 92, 146, 260, 271] },
    { nome: 'Mari', cor: 'green', pct: 39, da: [27, 46, 52, 119, 166, 213, 244], recebe: [5, 120] }
  ];
  var PROCURADAS = [{ codigo: 58, precisam: 3 }, { codigo: 112, precisam: 3 }, { codigo: 23, precisam: 2 }, { codigo: 201, precisam: 2 }, { codigo: 176, precisam: 2 }];
  var TAMANHO_GRUPO = 4;
  var STAR = '<svg class="cell__star" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4Z"/></svg>';

  function mini(n, tipoCelula) {
    var t = C.tipoDe(n);
    return '<span class="cell cell--sm ' + tipoCelula + (t === 'ameba' ? ' cell--ameba' : '') + '" aria-label="Figurinha ' + n + (t !== 'regular' ? ', ' + t : '') + '">' +
      (t === 'especial' ? STAR : '') + n + '</span>';
  }

  function dica(m, justa) {
    if (m.da.length === m.recebe.length) return 'tudo bate certinho';
    if (m.da.length > m.recebe.length) return 'você tem ' + (m.da.length - justa) + ' sobrando para ' + m.nome;
    return m.nome + ' tem ' + (m.recebe.length - justa) + ' a mais para você';
  }

  var lista = document.querySelector('[data-trocas]');
  if (lista) {
    lista.innerHTML = MEMBROS.map(function (m) {
      var justa = Math.min(m.da.length, m.recebe.length);
      return '<article class="card card--surface" style="padding:16px 14px 14px;display:flex;flex-direction:column;gap:12px">' +
        '<div style="display:flex;align-items:center;gap:10px"><span class="avatar avatar--' + m.cor + '">' + m.nome.charAt(0) + '</span>' +
        '<span style="display:flex;flex-direction:column"><span class="strong" style="font-size:17px">' + m.nome + '</span><span class="small">' + m.pct + '% completo</span></span></div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">' +
          '<div class="env-col"><div class="perf"></div><div class="env-col__body"><span class="env-col__head"><span>Você dá</span><span>' + m.da.length + '</span></span>' +
          '<div class="mini-grid">' + m.da.map(function (n) { return mini(n, 'cell--give'); }).join('') + '</div></div></div>' +
          '<div class="env-col"><div class="perf"></div><div class="env-col__body"><span class="env-col__head"><span>Você recebe</span><span>' + m.recebe.length + '</span></span>' +
          '<div class="mini-grid">' + m.recebe.map(function (n) { return mini(n, 'cell--get'); }).join('') + '</div></div></div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1.5px dashed var(--rule)">' +
          '<span style="display:flex;flex-direction:column"><span class="strong">Troca justa: ' + justa + ' ↔ ' + justa + '</span><span class="small" style="font-size:12px">' + dica(m, justa) + '</span></span>' +
          '<button type="button" class="btn btn--grass btn--sm">Marcar como trocadas</button>' +
        '</div></article>';
    }).join('');
  }

  var procuradas = document.querySelector('[data-wanted]');
  if (procuradas) {
    procuradas.innerHTML = PROCURADAS.map(function (w) {
      var dots = '';
      for (var k = 0; k < TAMANHO_GRUPO; k++) dots += '<i' + (k < w.precisam ? ' class="on"' : '') + '></i>';
      return '<li class="list-row" style="padding:8px 0">' +
        '<span style="width:38px;flex:none">' + mini(w.codigo, 'cell--get') + '</span>' +
        '<span class="strong" style="flex:1;font-size:14px">' + w.precisam + ' de ' + TAMANHO_GRUPO + ' precisam</span>' +
        '<span class="dots-meter" aria-hidden="true">' + dots + '</span></li>';
    }).join('');
  }
})();
