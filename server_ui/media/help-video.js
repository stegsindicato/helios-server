/* Videoguía de votación de AAEP: carga de YouTube só ao premer. */
(function () {
  'use strict';

  function init() {
    const container = document.querySelector('#video .aaep-video-placeholder');
    if (!container) return;

    const description = document.querySelector('#video > p');
    if (description) {
      description.textContent =
        'Neste vídeo explicámosche como participar nunha consulta das ' +
        'Asembleas Abertas do Ensino Público, desde a selección das ' +
        'respostas ata a confirmación do voto e a comprobación da papeleta.';
    }

    container.removeAttribute('role');
    container.setAttribute('aria-label', 'Videoguía de votación');

    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText =
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:12px;padding:24px;border:0;width:100%;min-height:190px;' +
      'background:transparent;color:#171717;cursor:pointer;text-align:center;';

    const icon = document.createElement('span');
    icon.className = 'aaep-video-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▶';

    const label = document.createElement('strong');
    label.style.cssText = 'font-size:1.35rem;line-height:1.3;';
    label.textContent = 'Ver a videoguía de votación';

    const notice = document.createElement('span');
    notice.style.cssText = 'font-size:.92rem;color:#5c5c5c;line-height:1.4;';
    notice.textContent = 'O vídeo cargarase desde YouTube ao premer aquí';

    button.append(icon, label, notice);
    container.replaceChildren(button);

    button.addEventListener('click', function () {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/YkZfL2n8oQA?autoplay=1';
      iframe.title = 'Como votar · Asembleas Abertas do Ensino Público';
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block;';

      container.classList.remove('aaep-video-placeholder');
      container.classList.add('aaep-video-player');
      container.removeAttribute('aria-label');
      container.style.cssText =
        'position:relative;aspect-ratio:16/9;max-width:810px;width:100%;min-height:0;' +
        'padding:0;border:0;overflow:hidden;background:#171717;border-radius:8px;';
      container.replaceChildren(iframe);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
