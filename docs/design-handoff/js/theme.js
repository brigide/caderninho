/* Tema: ?tema=escuro (ou preferência do sistema, se o app permitir "automático").
   Carregue no <head>, antes do CSS pintar, para evitar flash. */
(function () {
  try {
    var q = new URLSearchParams(location.search).get('tema');
    if (q === 'escuro') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) { /* sem tema */ }
})();
