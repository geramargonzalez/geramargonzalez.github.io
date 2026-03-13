/**
 * admin.js — Lógica del panel de administración
 *
 * Funcionalidades:
 * 1. Tags input (agregar/quitar con Enter o coma)
 * 2. Links builder (agregar filas con label, url, estilo, download)
 * 3. Sections builder (secciones con título + bloques de texto / imagen)
 * 4. Generación del objeto JS listo para pegar en projects-data.js
 * 5. Copiar al portapapeles
 * 6. URL de vista previa
 */

(function adminApp() {

  /* ══════════════════════════════════════
     ESTADO
  ══════════════════════════════════════ */
  var tags     = [];   // array de strings
  var links    = [];   // [ { label, url, style, download } ]
  var sections = [];   // [ { title, blocks: [ { type, content, caption } ] } ]

  /* ══════════════════════════════════════
     REFS al DOM
  ══════════════════════════════════════ */
  var outputCode  = document.getElementById('outputCode');
  var btnGenerate = document.getElementById('btnGenerate');
  var btnCopy     = document.getElementById('btnCopy');
  var btnPreview  = document.getElementById('btnPreview');
  var adminToast  = document.getElementById('adminToast');

  /* ══════════════════════════════════════
     NAVBAR SCROLL
  ══════════════════════════════════════ */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ══════════════════════════════════════
     1. TAGS INPUT
  ══════════════════════════════════════ */
  var tagsWrap  = document.getElementById('tagsWrap');
  var tagsInput = document.getElementById('tagsInput');

  function renderTags() {
    // Quitar tags viejos (no el input)
    tagsWrap.querySelectorAll('.tag').forEach(function (el) { el.remove(); });

    tags.forEach(function (tag, i) {
      var span = document.createElement('span');
      span.className = 'tag tag--sm';
      span.innerHTML =
        escHtml(tag) +
        ' <button type="button" class="tag__remove" data-idx="' + i + '" aria-label="Quitar">&times;</button>';
      tagsWrap.insertBefore(span, tagsInput);
    });
  }

  function addTag(raw) {
    var val = raw.trim().replace(/,+$/, '');
    if (!val || tags.indexOf(val) !== -1) return;
    tags.push(val);
    renderTags();
  }

  tagsInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagsInput.value);
      tagsInput.value = '';
    } else if (e.key === 'Backspace' && tagsInput.value === '' && tags.length) {
      tags.pop();
      renderTags();
    }
  });

  tagsInput.addEventListener('blur', function () {
    if (tagsInput.value.trim()) {
      addTag(tagsInput.value);
      tagsInput.value = '';
    }
  });

  tagsWrap.addEventListener('click', function (e) {
    var btn = e.target.closest('.tag__remove');
    if (btn) {
      tags.splice(parseInt(btn.dataset.idx, 10), 1);
      renderTags();
    }
    tagsInput.focus();
  });

  tagsWrap.addEventListener('click', function () { tagsInput.focus(); });

  /* ══════════════════════════════════════
     2. LINKS BUILDER
  ══════════════════════════════════════ */
  var linksList  = document.getElementById('linksList');
  var btnAddLink = document.getElementById('btnAddLink');

  function renderLinks() {
    linksList.innerHTML = '';
    links.forEach(function (lnk, i) {
      var row = document.createElement('div');
      row.className = 'link-item';
      row.innerHTML =
        '<input class="form-input" type="text" placeholder="Etiqueta" value="' + escHtml(lnk.label) + '" data-field="label" data-idx="' + i + '" />' +
        '<input class="form-input" type="url"  placeholder="https://…"  value="' + escHtml(lnk.url)   + '" data-field="url"   data-idx="' + i + '" />' +
        '<select class="form-select" data-field="style" data-idx="' + i + '">' +
          '<option value="outline"' + (lnk.style === 'outline' ? ' selected' : '') + '>outline</option>' +
          '<option value="ghost"'   + (lnk.style === 'ghost'   ? ' selected' : '') + '>ghost</option>'   +
          '<option value="primary"' + (lnk.style === 'primary' ? ' selected' : '') + '>primary</option>' +
        '</select>' +
        '<button type="button" class="link-item__remove" data-idx="' + i + '" aria-label="Quitar link">🗑</button>';
      linksList.appendChild(row);
    });
  }

  btnAddLink.addEventListener('click', function () {
    links.push({ label: '', url: '', style: 'outline', download: false });
    renderLinks();
    // Focus en el primer input del nuevo row
    var rows = linksList.querySelectorAll('.link-item');
    if (rows.length) {
      var last = rows[rows.length - 1];
      var inp = last.querySelector('input');
      if (inp) inp.focus();
    }
  });

  linksList.addEventListener('input', function (e) {
    var el = e.target;
    var idx = parseInt(el.dataset.idx, 10);
    var field = el.dataset.field;
    if (!isNaN(idx) && field && links[idx] !== undefined) {
      links[idx][field] = el.value;
    }
  });

  linksList.addEventListener('change', function (e) {
    var el = e.target;
    var idx = parseInt(el.dataset.idx, 10);
    var field = el.dataset.field;
    if (!isNaN(idx) && field && links[idx] !== undefined) {
      links[idx][field] = el.value;
    }
  });

  linksList.addEventListener('click', function (e) {
    var btn = e.target.closest('.link-item__remove');
    if (btn) {
      links.splice(parseInt(btn.dataset.idx, 10), 1);
      renderLinks();
    }
  });

  /* ══════════════════════════════════════
     3. SECTIONS BUILDER
  ══════════════════════════════════════ */
  var sectionsList  = document.getElementById('sectionsList');
  var btnAddSection = document.getElementById('btnAddSection');

  function renderSections() {
    sectionsList.innerHTML = '';

    sections.forEach(function (sec, si) {
      var item = document.createElement('div');
      item.className = 'section-item open';
      item.dataset.si = si;

      var preview = sec.title || 'Sección ' + (si + 1);

      item.innerHTML =
        '<div class="section-item__header">' +
          '<span class="section-item__drag" title="Arrastrar para reordenar">⠿</span>' +
          '<span class="section-item__title-preview">' + escHtml(preview) + '</span>' +
          '<div style="display:flex;gap:0.4rem;margin-left:auto;align-items:center">' +
            '<button type="button" class="btn btn--sm btn--ghost" data-action="remove-section" data-si="' + si + '" title="Eliminar sección">🗑</button>' +
            '<span class="section-item__toggle">▾</span>' +
          '</div>' +
        '</div>' +
        '<div class="section-item__body">' +
          '<div class="form-group">' +
            '<label class="form-label">Título de la sección</label>' +
            '<input class="form-input" type="text" placeholder="Contexto / Metodología / Resultados…" value="' + escHtml(sec.title) + '" data-action="section-title" data-si="' + si + '" />' +
          '</div>' +
          '<div class="blocks-list" id="blocksList-' + si + '">' +
          '</div>' +
          '<div class="block-add-btns">' +
            '<button type="button" class="btn btn--sm btn--outline btn--add" data-action="add-text" data-si="' + si + '">+ Párrafo</button>' +
            '<button type="button" class="btn btn--sm btn--outline btn--add" data-action="add-image" data-si="' + si + '">🖼 Imagen</button>' +
          '</div>' +
        '</div>';

      sectionsList.appendChild(item);

      // Render blocks de esta sección
      renderBlocks(si);
    });
  }

  function renderBlocks(si) {
    var blocksEl = document.getElementById('blocksList-' + si);
    if (!blocksEl) return;
    blocksEl.innerHTML = '';

    var blocks = sections[si].blocks || [];
    blocks.forEach(function (block, bi) {
      var item = document.createElement('div');
      item.className = 'block-item';

      var innerHtml =
        '<span class="block-item__type-badge block-item__type-badge--' + block.type + '">' +
          (block.type === 'text' ? '¶ Texto' : '🖼 Imagen') +
        '</span>' +
        '<button type="button" class="block-item__remove" data-action="remove-block" data-si="' + si + '" data-bi="' + bi + '" aria-label="Quitar bloque">✕</button>';

      if (block.type === 'text') {
        innerHtml +=
          '<textarea class="form-textarea" rows="3" placeholder="Texto del bloque… (acepta HTML básico)" ' +
                     'data-action="block-content" data-si="' + si + '" data-bi="' + bi + '">' +
            escHtml(block.content) +
          '</textarea>';
      } else {
        innerHtml +=
          '<div class="form-row" style="grid-template-columns:2fr 1fr">' +
            '<div class="form-group" style="margin-bottom:0">' +
              '<label class="form-label">Ruta de la imagen</label>' +
              '<input class="form-input" type="text" placeholder="assets/mi-imagen.jpg" value="' + escHtml(block.content) + '" ' +
                     'data-action="block-content" data-si="' + si + '" data-bi="' + bi + '" />' +
            '</div>' +
            '<div class="form-group" style="margin-bottom:0">' +
              '<label class="form-label">Descripción (caption)</label>' +
              '<input class="form-input" type="text" placeholder="Opcional" value="' + escHtml(block.caption || '') + '" ' +
                     'data-action="block-caption" data-si="' + si + '" data-bi="' + bi + '" />' +
            '</div>' +
          '</div>';
      }

      item.innerHTML = innerHtml;
      blocksEl.appendChild(item);
    });
  }

  btnAddSection.addEventListener('click', function () {
    sections.push({ title: '', blocks: [] });
    renderSections();
    // Scroll al nuevo elemento
    var items = sectionsList.querySelectorAll('.section-item');
    if (items.length) {
      items[items.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Delegación de eventos en sectionsList
  sectionsList.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) {
      // Toggle collapse on header click
      var header = e.target.closest('.section-item__header');
      if (header) {
        var item = header.closest('.section-item');
        if (item) item.classList.toggle('open');
      }
      return;
    }

    var action = el.dataset.action;
    var si = parseInt(el.dataset.si, 10);
    var bi = parseInt(el.dataset.bi, 10);

    if (action === 'remove-section') {
      if (confirm('¿Eliminar esta sección?')) {
        sections.splice(si, 1);
        renderSections();
      }
    } else if (action === 'add-text') {
      sections[si].blocks.push({ type: 'text', content: '' });
      renderBlocks(si);
    } else if (action === 'add-image') {
      sections[si].blocks.push({ type: 'image', content: '', caption: '' });
      renderBlocks(si);
    } else if (action === 'remove-block') {
      sections[si].blocks.splice(bi, 1);
      renderBlocks(si);
    }
  });

  sectionsList.addEventListener('input', function (e) {
    var el = e.target;
    var action = el.dataset.action;
    if (!action) return;
    var si = parseInt(el.dataset.si, 10);
    var bi = parseInt(el.dataset.bi, 10);

    if (action === 'section-title') {
      sections[si].title = el.value;
      // Actualizar preview sin re-render completo
      var item = sectionsList.querySelector('[data-si="' + si + '"].section-item');
      if (item) {
        var preview = item.querySelector('.section-item__title-preview');
        if (preview) preview.textContent = el.value || 'Sección ' + (si + 1);
      }
    } else if (action === 'block-content') {
      sections[si].blocks[bi].content = el.value;
    } else if (action === 'block-caption') {
      sections[si].blocks[bi].caption = el.value;
    }
  });

  /* ══════════════════════════════════════
     4. GENERAR CÓDIGO
  ══════════════════════════════════════ */
  function generateCode() {
    var id       = val('fId')       || 'mi-proyecto';
    var year     = val('fYear')     || new Date().getFullYear().toString();
    var category = val('fCategory');
    var cover    = val('fCover')    || null;
    var titleEs  = val('fTitleEs')  || '';
    var titleEn  = val('fTitleEn')  || '';
    var subEs    = val('fSubEs')    || '';
    var subEn    = val('fSubEn')    || '';
    var descEs   = val('fDescEs')   || '';
    var descEn   = val('fDescEn')   || '';

    // Sanear el ID
    id = id.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    var lines = [];
    lines.push('  {');
    lines.push('    id: ' + jsStr(id) + ',');
    lines.push('    category: ' + jsStr(category) + ',');
    lines.push('    cover: ' + (cover ? jsStr(cover) : 'null') + ',');
    lines.push('    year: ' + jsStr(year) + ',');
    lines.push('    title: {');
    lines.push('      es: ' + jsStr(titleEs) + ',');
    lines.push('      en: ' + jsStr(titleEn));
    lines.push('    },');
    lines.push('    subtitle: {');
    lines.push('      es: ' + jsStr(subEs) + ',');
    lines.push('      en: ' + jsStr(subEn));
    lines.push('    },');
    lines.push('    description: {');
    lines.push('      es: ' + jsStr(descEs) + ',');
    lines.push('      en: ' + jsStr(descEn));
    lines.push('    },');

    // sections[]
    if (sections.length) {
      lines.push('    sections: [');
      sections.forEach(function (sec, si) {
        lines.push('      {');
        lines.push('        title: ' + jsStr(sec.title) + ',');
        lines.push('        blocks: [');
        (sec.blocks || []).forEach(function (block, bi) {
          var comma = bi < sec.blocks.length - 1 ? ',' : '';
          if (block.type === 'image') {
            lines.push('          { type: \'image\', content: ' + jsStr(block.content) + ', caption: ' + jsStr(block.caption || '') + ' }' + comma);
          } else {
            lines.push('          { type: \'text\', content: ' + jsStr(block.content) + ' }' + comma);
          }
        });
        lines.push('        ]');
        var secComma = si < sections.length - 1 ? ',' : '';
        lines.push('      }' + secComma);
      });
      lines.push('    ],');
    }

    // tags[]
    lines.push('    tags: [' + tags.map(jsStr).join(', ') + '],');

    // links[]
    lines.push('    links: [');
    links.forEach(function (lnk, i) {
      var comma = i < links.length - 1 ? ',' : '';
      var dl = lnk.download ? ', download: true' : '';
      lines.push('      { label: ' + jsStr(lnk.label) + ', url: ' + jsStr(lnk.url) + ', style: ' + jsStr(lnk.style) + dl + ' }' + comma);
    });
    lines.push('    ]');

    lines.push('  }');

    return lines.join('\n');
  }

  btnGenerate.addEventListener('click', function () {
    var code = generateCode();
    outputCode.textContent = code;

    // Actualizar link de vista previa
    var id = val('fId').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (id) {
      btnPreview.href = 'project.html?id=' + encodeURIComponent(id);
      btnPreview.style.opacity = '';
    } else {
      btnPreview.href = '#';
    }
  });

  /* ══════════════════════════════════════
     5. COPIAR AL PORTAPAPELES
  ══════════════════════════════════════ */
  btnCopy.addEventListener('click', function () {
    var text = outputCode.textContent;
    if (!text || text.startsWith('//')) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(showToast);
    } else {
      // Fallback para file:// o contextos sin HTTPS
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast();
      } catch (e) {
        alert('No se pudo copiar automáticamente. Seleccioná el código manualmente.');
      }
    }
  });

  function showToast() {
    adminToast.classList.add('show');
    setTimeout(function () { adminToast.classList.remove('show'); }, 2200);
  }

  /* ══════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════ */
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  // Escapa string para uso dentro de una cadena JS con comillas simples
  function jsStr(str) {
    if (str === null || str === undefined) return 'null';
    return '\'' + String(str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
      + '\'';
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /* ── Init: agregar un link y una sección vacíos para orientar al usuario ── */
  links.push({ label: 'GitHub', url: 'https://github.com/', style: 'outline', download: false });
  sections.push({ title: 'Contexto', blocks: [{ type: 'text', content: '' }] });
  renderLinks();
  renderSections();

})();
