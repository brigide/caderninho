/* Caderninho de Figurinhas — dados de exemplo e regras de negócio.
   Tudo aqui é MOCK: troque CATALOGO pela lista oficial do álbum e
   colecao pelo que vier da API. As regras (progresso, trocas, estimativa)
   são as que a implementação deve seguir. */
(function () {
  'use strict';

  var TOTAL = 276;
  var POR_ESTACAO = 69;

  var ESTACOES = [
    { id: 'spring', nome: 'Primavera' },
    { id: 'summer', nome: 'Verão' },
    { id: 'autumn', nome: 'Outono' },
    { id: 'winter', nome: 'Inverno' }
  ];

  /* Tipo de exemplo: especial = código % 17 === 1; ameba = código % 23 === 0 */
  function tipoDe(n) {
    if (n % 17 === 1) return 'especial';
    if (n % 23 === 0) return 'ameba';
    return 'regular';
  }

  /* Catálogo: { codigo, numero, estacao, tipo, pagina } */
  var CATALOGO = [];
  for (var i = 1; i <= TOTAL; i++) {
    CATALOGO.push({
      codigo: String(i),
      numero: i,
      estacao: ESTACOES[Math.floor((i - 1) / POR_ESTACAO)].id,
      tipo: tipoDe(i),
      pagina: Math.floor((i - 1) / 8) + 2
    });
  }

  /* Coleção de exemplo determinística: 187 coladas (52/50/46/39 por estação) */
  function hash(n, seed) { return (Math.imul(n + (seed || 0), 2654435761) >>> 0) % 1000; }
  var META = { spring: 52, summer: 50, autumn: 46, winter: 39 };
  function colecaoExemplo() {
    var copias = {};
    ESTACOES.forEach(function (e, idx) {
      var codigos = CATALOGO.slice(idx * POR_ESTACAO, (idx + 1) * POR_ESTACAO).map(function (f) { return f.numero; });
      codigos.slice().sort(function (a, b) { return hash(a) - hash(b); }).forEach(function (n, r) {
        if (r < META[e.id]) {
          var h = (Math.imul(n + 7, 40503) >>> 0) % 10;
          copias[n] = h < 3 ? 2 : (h === 3 ? 3 : 1);
        } else {
          copias[n] = 0;
        }
      });
    });
    return copias; /* { numero: copias } — 0 faltando, 1 colada, 2+ repetida */
  }

  /* ---------- Regras ---------- */

  function resumo(copias) {
    var r = { coladas: 0, faltam: 0, repetidas: 0, porEstacao: {}, porTipo: {} };
    ESTACOES.forEach(function (e) { r.porEstacao[e.id] = { coladas: 0, total: POR_ESTACAO }; });
    ['regular', 'especial', 'ameba'].forEach(function (t) { r.porTipo[t] = { coladas: 0, total: 0 }; });
    CATALOGO.forEach(function (f) {
      var c = copias[f.numero] || 0;
      r.porTipo[f.tipo].total++;
      if (c > 0) {
        r.coladas++;
        r.porEstacao[f.estacao].coladas++;
        r.porTipo[f.tipo].coladas++;
      } else {
        r.faltam++;
      }
      if (c > 1) r.repetidas += c - 1;
    });
    r.percentual = Math.round(r.coladas / TOTAL * 100);
    return r;
  }

  /* Trocas entre A (você) e B: dá = repetidas suas que B não tem; recebe = o contrário */
  function trocas(copiasA, copiasB) {
    var da = [], recebe = [];
    CATALOGO.forEach(function (f) {
      var a = copiasA[f.numero] || 0, b = copiasB[f.numero] || 0;
      if (a >= 2 && b === 0) da.push(f.codigo);
      if (b >= 2 && a === 0) recebe.push(f.codigo);
    });
    return { voceDa: da, voceRecebe: recebe, justa: Math.min(da.length, recebe.length) };
  }

  /* Mais procuradas: faltando para 2+ membros, ordenadas por quantos precisam */
  function maisProcuradas(colecoes) {
    return CATALOGO.map(function (f) {
      var precisam = colecoes.filter(function (c) { return !(c[f.numero] > 0); }).length;
      return { codigo: f.codigo, precisam: precisam };
    }).filter(function (x) { return x.precisam >= 2; })
      .sort(function (a, b) { return b.precisam - a.precisam || Number(a.codigo) - Number(b.codigo); });
  }

  /* Estimativa simples (a da tela): taxa de novas observada nos últimos envelopes */
  function estimativaSimples(faltam, taxaNovas, porEnvelope, precoEnvelope) {
    var envelopes = Math.ceil(faltam / ((porEnvelope || 5) * taxaNovas));
    return { envelopes: envelopes, custo: envelopes * (precoEnvelope || 5) };
  }

  /* Estimativa realista sem trocas: colecionador de cupons, E = N * H(m) */
  function estimativaColecionador(total, faltam, porEnvelope, precoEnvelope) {
    var h = 0;
    for (var k = 1; k <= faltam; k++) h += 1 / k;
    var figurinhas = total * h;
    var envelopes = Math.ceil(figurinhas / (porEnvelope || 5));
    return { figurinhas: Math.round(figurinhas), envelopes: envelopes, custo: envelopes * (precoEnvelope || 5) };
  }

  function custoAvulsas(faltam, precoAvulsa) { return faltam * (precoAvulsa || 1); }

  function formatarBRL(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }

  window.Caderninho = {
    TOTAL: TOTAL, POR_ESTACAO: POR_ESTACAO, ESTACOES: ESTACOES, CATALOGO: CATALOGO,
    tipoDe: tipoDe, colecaoExemplo: colecaoExemplo, resumo: resumo, trocas: trocas,
    maisProcuradas: maisProcuradas, estimativaSimples: estimativaSimples,
    estimativaColecionador: estimativaColecionador, custoAvulsas: custoAvulsas, formatarBRL: formatarBRL
  };
})();
