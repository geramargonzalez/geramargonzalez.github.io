/**
 * admin-dashboard.js — Dashboard CRUD para proyectos y artículos
 *
 * Prerrequisitos: config.js, supabase CDN, supabase-client.js, auth-guard.js
 * (todos cargados en el <head> de admin-dashboard.html)
 *
 * Responsabilidades:
 *  - Autenticación ya garantizada por auth-guard.js
 *  - Tabs Proyectos / Artículos
 *  - CRUD completo contra Supabase
 *  - Subida de imágenes al bucket portfolio-images
 *  - Tags input
 *  - Validación de formularios + sanitización de inputs
 *  - Confirmación antes de eliminar
 *  - Toast de feedback
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════
     ESTADO
  ══════════════════════════════════════ */
  var activeTab      = 'projects'; // 'projects' | 'articles'
  var editingProjId  = null;       // UUID de la BD del proyecto editado
  var editingArtId   = null;       // UUID de la BD del artículo editado
  var pTechs         = [];         // tags de tecnologías del form de proyecto
  var aTags          = [];         // tags del form de artículo

  /* ══════════════════════════════════════
     REFS DOM — Globales
  ══════════════════════════════════════ */
  var dashToast    = document.getElementById('dashToast');
  var dashUserInfo = document.getElementById('dashUserInfo');
  var btnLogout    = document.getElementById('btnLogout');

  /* ── Tabs ── */
  var tabsEl     = document.getElementById('dashTabs');
  var tabProjs   = document.getElementById('tabProjects');
  var tabArts    = document.getElementById('tabArticles');

  /* ── Proyectos ── */
  var btnNewProj      = document.getElementById('btnNewProject');
  var projFormPanel   = document.getElementById('projectFormPanel');
  var projFormTitleEl = document.getElementById('projectFormTitle');
  var projForm        = document.getElementById('projectForm');
  var projList        = document.getElementById('projectsList');
  var projFormErr     = document.getElementById('projectFormError');
  var btnSaveProj     = document.getElementById('btnSaveProject');

  /* ── Artículos ── */
  var btnNewArt      = document.getElementById('btnNewArticle');
  var artFormPanel   = document.getElementById('articleFormPanel');
  var artFormTitleEl = document.getElementById('articleFormTitle');
  var artForm        = document.getElementById('articleForm');
  var artList        = document.getElementById('articlesList');
  var artFormErr     = document.getElementById('articleFormError');
  var btnSaveArt     = document.getElementById('btnSaveArticle');

  /* ══════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════ */

  function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function checked(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }

  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value !== null && value !== undefined ? value : '';
  }

  function setChecked(id, value) {
    var el = document.getElementById(id);
    if (el) el.checked = !!value;
  }

  function parseJsonField(raw, fallback) {
    if (!raw || !raw.trim() || raw.trim() === '' || raw.trim() === 'null') return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function showToast(msg, type) {
    if (!dashToast) return;
    dashToast.textContent = msg;
    dashToast.className = 'admin-toast show' + (type === 'error' ? ' admin-toast--error' : '');
    clearTimeout(dashToast._t);
    dashToast._t = setTimeout(function () {
      dashToast.classList.remove('show');
    }, 3500);
  }

  function slugify(text) {
    if (window.SupabaseAPI && window.SupabaseAPI.slugify) {
      return window.SupabaseAPI.slugify(text);
    }
    return String(text)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s\-]/g, '')
      .trim().replace(/\s+/g, '-').replace(/-{2,}/g, '-');
  }

  /* ── Validación básica (los nombres no son datos de usuario, pero saneamos igualmente) ── */
  function validateSlug(slug) {
    return /^[a-z0-9][a-z0-9\-]{1,80}$/.test(slug);
  }

  /* ══════════════════════════════════════
     INIT
  ══════════════════════════════════════ */

  async function init() {
    // Mostrar info del usuario
    try {
      var profile = await window.SupabaseAPI.getUserProfile();
      if (profile && dashUserInfo) {
        dashUserInfo.textContent = profile.email;
      }
    } catch (e) { /* no crítico */ }

    // Cargar lista inicial
    loadProjects();
    setupTabs();
    setupLogout();
    setupProjectForm();
    setupArticleForm();
  }

  /* ══════════════════════════════════════
     TABS
  ══════════════════════════════════════ */

  function setupTabs() {
    if (!tabsEl) return;
    tabsEl.addEventListener('click', function (e) {
      var tab = e.target.closest('.dashboard-tab');
      if (!tab || tab.dataset.tab === activeTab) return;
      switchTab(tab.dataset.tab);
    });
  }

  function switchTab(tabName) {
    activeTab = tabName;

    tabsEl.querySelectorAll('.dashboard-tab').forEach(function (t) {
      t.classList.toggle('dashboard-tab--active', t.dataset.tab === tabName);
    });

    if (tabName === 'projects') {
      tabProjs.classList.remove('admin-form-hidden');
      tabArts.classList.add('admin-form-hidden');
      loadProjects();
    } else {
      tabProjs.classList.add('admin-form-hidden');
      tabArts.classList.remove('admin-form-hidden');
      loadArticles();
    }
  }

  /* ══════════════════════════════════════
     LOGOUT
  ══════════════════════════════════════ */

  function setupLogout() {
    if (!btnLogout) return;
    btnLogout.addEventListener('click', async function () {
      try {
        await window.SupabaseAPI.signOut();
        window.location.href = 'login.html';
      } catch (e) {
        showToast('Error al cerrar sesión.', 'error');
      }
    });
  }

  /* ══════════════════════════════════════
     TAGS INPUT (genérico)
  ══════════════════════════════════════ */

  function setupTagsInput(wrapId, inputId, tagsArray, onUpdate) {
    var wrap  = document.getElementById(wrapId);
    var input = document.getElementById(inputId);
    if (!wrap || !input) return;

    function render() {
      wrap.querySelectorAll('.tag').forEach(function (el) { el.remove(); });
      tagsArray.forEach(function (tag, i) {
        var span = document.createElement('span');
        span.className = 'tag tag--sm';
        span.innerHTML =
          escHtml(tag) +
          ' <button type="button" class="tag__remove" data-idx="' + i + '" aria-label="Quitar">&times;</button>';
        wrap.insertBefore(span, input);
      });
      if (onUpdate) onUpdate(tagsArray);
    }

    function addTag(raw) {
      var v = raw.trim().replace(/,+$/, '');
      if (!v || tagsArray.indexOf(v) !== -1) return;
      tagsArray.push(v);
      render();
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        if (input.value.trim()) { addTag(input.value); input.value = ''; }
      } else if (e.key === 'Backspace' && !input.value && tagsArray.length) {
        tagsArray.pop();
        render();
      }
    });

    input.addEventListener('blur', function () {
      if (input.value.trim()) { addTag(input.value); input.value = ''; }
    });

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.tag__remove');
      if (btn) {
        tagsArray.splice(parseInt(btn.dataset.idx, 10), 1);
        render();
      }
      input.focus();
    });

    render();
    return { render: render, addTag: addTag };
  }

  /* ══════════════════════════════════════
     IMAGE UPLOAD HELPER
  ══════════════════════════════════════ */

  function setupImageUpload(fileInputId, urlInputId, previewId, subfolder) {
    var fileInput = document.getElementById(fileInputId);
    var urlInput  = document.getElementById(urlInputId);
    var preview   = document.getElementById(previewId);
    if (!fileInput) return;

    fileInput.addEventListener('change', async function () {
      var file = fileInput.files[0];
      if (!file) return;

      // Validar tipo y tamaño (máx 5MB)
      var allowed = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml'];
      if (allowed.indexOf(file.type) === -1) {
        showToast('Tipo de archivo no permitido. Usá JPG, PNG, WEBP, GIF o SVG.', 'error');
        fileInput.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen supera el límite de 5MB.', 'error');
        fileInput.value = '';
        return;
      }

      showToast('Subiendo imagen…', '');

      try {
        var path   = subfolder + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
        var pubUrl = await window.SupabaseAPI.uploadImage(file, path);
        if (urlInput) urlInput.value = pubUrl;
        if (preview) {
          preview.innerHTML = '<img src="' + escHtml(pubUrl) + '" alt="preview" class="dashboard-image-preview__img" />';
        }
        showToast('Imagen subida correctamente.', '');
      } catch (err) {
        showToast('Error al subir la imagen: ' + ((err && err.message) || 'error desconocido'), 'error');
      } finally {
        fileInput.value = '';
      }
    });

    // Mostrar preview si ya hay URL
    if (urlInput && preview) {
      urlInput.addEventListener('blur', function () {
        var url = urlInput.value.trim();
        if (url) {
          preview.innerHTML = '<img src="' + escHtml(url) + '" alt="preview" class="dashboard-image-preview__img" />';
        } else {
          preview.innerHTML = '';
        }
      });
    }
  }

  /* ══════════════════════════════════════
     PROYECTOS — Lista
  ══════════════════════════════════════ */

  async function loadProjects() {
    if (!projList) return;
    projList.innerHTML = '<div class="dashboard-loading">Cargando proyectos…</div>';
    try {
      var projects = await window.SupabaseAPI.getProjects(true); // adminMode = all
      renderProjectList(projects);
    } catch (err) {
      projList.innerHTML = '<div class="dashboard-error">Error al cargar proyectos: ' + escHtml((err && err.message) || 'error') + '</div>';
    }
  }

  function renderProjectList(projects) {
    if (!projList) return;

    if (!projects.length) {
      projList.innerHTML = '<p class="dashboard-empty">No hay proyectos aún. Creá el primero.</p>';
      return;
    }

    var rows = projects.map(function (p) {
      var titleEs = (p.title && p.title.es) ? p.title.es : (p.slug || '—');
      var pubBadge = p.published
        ? '<span class="dash-badge dash-badge--published">✓ Publicado</span>'
        : '<span class="dash-badge dash-badge--draft">Borrador</span>';

      return (
        '<tr class="dashboard-row" data-id="' + escHtml(p._id) + '">' +
          '<td class="dash-td dash-td--slug"><code>' + escHtml(p.slug) + '</code></td>' +
          '<td class="dash-td">' + escHtml(titleEs) + '</td>' +
          '<td class="dash-td">' + escHtml(p.category || '—') + '</td>' +
          '<td class="dash-td">' + escHtml(p.year || '—') + '</td>' +
          '<td class="dash-td">' + pubBadge + '</td>' +
          '<td class="dash-td dash-td--actions">' +
            '<button class="btn btn--sm btn--outline" data-action="edit-project" data-id="' + escHtml(p._id) + '">✏️ Editar</button>' +
            '<button class="btn btn--sm btn--ghost" data-action="toggle-project" data-id="' + escHtml(p._id) + '" data-pub="' + p.published + '">' +
              (p.published ? '⬇️ Despublicar' : '🚀 Publicar') +
            '</button>' +
            '<button class="btn btn--sm btn--danger" data-action="delete-project" data-id="' + escHtml(p._id) + '" data-slug="' + escHtml(p.slug) + '">🗑 Eliminar</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    projList.innerHTML =
      '<div class="dashboard-table-wrap">' +
        '<table class="dashboard-table">' +
          '<thead><tr>' +
            '<th>Slug</th><th>Título (ES)</th><th>Categoría</th><th>Año</th><th>Estado</th><th>Acciones</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    // Adjuntar eventos
    projList.addEventListener('click', handleProjectListClick);
  }

  function handleProjectListClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var action = btn.dataset.action;
    var id     = btn.dataset.id;

    if (action === 'edit-project')   openProjectForm(id);
    if (action === 'delete-project') confirmDeleteProject(id, btn.dataset.slug);
    if (action === 'toggle-project') {
      var pub = btn.dataset.pub === 'true';
      doToggleProjectPublished(id, !pub);
    }
  }

  async function confirmDeleteProject(id, slug) {
    if (!window.confirm('¿Eliminar el proyecto "' + slug + '"? Esta acción no se puede deshacer.')) return;
    try {
      await window.SupabaseAPI.deleteProject(id);
      showToast('Proyecto eliminado.', '');
      loadProjects();
    } catch (err) {
      showToast('Error al eliminar: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  async function doToggleProjectPublished(id, publish) {
    try {
      await window.SupabaseAPI.toggleProjectPublished(id, publish);
      showToast(publish ? 'Proyecto publicado.' : 'Proyecto despublicado.', '');
      loadProjects();
    } catch (err) {
      showToast('Error: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  /* ══════════════════════════════════════
     PROYECTOS — Formulario
  ══════════════════════════════════════ */

  var projTagsControl = null;

  function setupProjectForm() {
    projTagsControl = setupTagsInput('pTechWrap', 'pTechInput', pTechs, null);

    setupImageUpload('pImageFile', 'pImageUrl', 'pImagePreview', 'projects');

    // Auto-generar slug desde título ES
    var titleEsEl = document.getElementById('pTitleEs');
    var slugEl    = document.getElementById('pSlug');
    if (titleEsEl && slugEl) {
      titleEsEl.addEventListener('input', function () {
        if (!editingProjId) { // solo en modo nuevo
          slugEl.value = slugify(titleEsEl.value);
        }
      });
    }

    // Botones cancelar
    ['btnCancelProject','btnCancelProject2'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', closeProjectForm);
    });

    if (btnNewProj) {
      btnNewProj.addEventListener('click', function () { openProjectForm(null); });
    }

    if (projForm) {
      projForm.addEventListener('submit', handleProjectSubmit);
    }
  }

  function openProjectForm(id) {
    editingProjId = id || null;
    clearFormError(projFormErr);

    if (id) {
      // Modo edición: buscar el proyecto en la BD
      projFormTitleEl.textContent = 'Editar proyecto';
      populateProjectForm(id);
    } else {
      // Modo creación: limpiar
      projFormTitleEl.textContent = 'Nuevo proyecto';
      resetProjectForm();
    }

    projFormPanel.classList.remove('admin-form-hidden');
    projFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeProjectForm() {
    projFormPanel.classList.add('admin-form-hidden');
    editingProjId = null;
    resetProjectForm();
  }

  function resetProjectForm() {
    if (projForm) projForm.reset();
    pTechs.length = 0;
    if (projTagsControl) projTagsControl.render();
    var preview = document.getElementById('pImagePreview');
    if (preview) preview.innerHTML = '';
    setVal('pContent', '[]');
    setVal('pLinks', '[]');
  }

  async function populateProjectForm(id) {
    try {
      var projects = await window.SupabaseAPI.getProjects(true);
      var p = projects.find(function (x) { return x._id === id; });
      if (!p) { showToast('No se encontró el proyecto.', 'error'); return; }

      setVal('pSlug',        p.slug);
      setVal('pCategory',    p.category);
      setVal('pYear',        p.year);
      setVal('pTitleEs',     p.title   && p.title.es   ? p.title.es   : '');
      setVal('pTitleEn',     p.title   && p.title.en   ? p.title.en   : '');
      setVal('pSubtitleEs',  p.subtitle && p.subtitle.es ? p.subtitle.es : '');
      setVal('pSubtitleEn',  p.subtitle && p.subtitle.en ? p.subtitle.en : '');
      setVal('pDescEs',      p.description && p.description.es ? p.description.es : '');
      setVal('pDescEn',      p.description && p.description.en ? p.description.en : '');
      setVal('pImageUrl',    p.cover || '');
      setVal('pContent',     p.sections && p.sections.length ? JSON.stringify(p.sections, null, 2) : '[]');
      setVal('pLinks',       p.links && p.links.length ? JSON.stringify(p.links, null, 2) : '[]');
      setChecked('pPublished', p.published);

      // Preview de imagen
      if (p.cover) {
        var preview = document.getElementById('pImagePreview');
        if (preview) preview.innerHTML = '<img src="' + escHtml(p.cover) + '" alt="preview" class="dashboard-image-preview__img" />';
      }

      // Tags
      pTechs.length = 0;
      (p.tags || []).forEach(function (t) { pTechs.push(t); });
      if (projTagsControl) projTagsControl.render();

    } catch (err) {
      showToast('Error al cargar el proyecto: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  async function handleProjectSubmit(e) {
    e.preventDefault();
    clearFormError(projFormErr);

    var slug    = val('pSlug') || slugify(val('pTitleEs'));
    var titleEs = val('pTitleEs');

    if (!titleEs) {
      showFormError(projFormErr, 'El título en español es obligatorio.');
      return;
    }
    if (!validateSlug(slug)) {
      showFormError(projFormErr, 'El slug solo puede contener letras minúsculas, números y guiones, mínimo 2 caracteres.');
      return;
    }

    var content = parseJsonField(val('pContent'), []);
    var links   = parseJsonField(val('pLinks'), []);

    // Validar que el JSON parseó como array
    if (!Array.isArray(content)) { showFormError(projFormErr, 'El campo Secciones debe ser un array JSON válido.'); return; }
    if (!Array.isArray(links))   { showFormError(projFormErr, 'El campo Links debe ser un array JSON válido.');     return; }

    var payload = {
      slug:         slug,
      category:     val('pCategory')    || null,
      year:         val('pYear')        || null,
      title:        { es: titleEs,       en: val('pTitleEn')    || titleEs },
      subtitle:     { es: val('pSubtitleEs') || '', en: val('pSubtitleEn') || '' },
      summary:      { es: val('pDescEs') || '', en: val('pDescEn') || '' },
      image_url:    val('pImageUrl')    || null,
      technologies: pTechs.slice(),
      tags:         pTechs.slice(),
      links:        links,
      content:      content,
      published:    checked('pPublished')
    };

    setLoading(btnSaveProj, true, 'Guardando…');

    try {
      if (editingProjId) {
        await window.SupabaseAPI.saveProject(payload, editingProjId);
        showToast('Proyecto actualizado correctamente.', '');
      } else {
        // Agregar author_id
        var session = await window.SupabaseAPI.getSession();
        if (session) payload.author_id = session.user.id;
        await window.SupabaseAPI.saveProject(payload, null);
        showToast('Proyecto creado correctamente.', '');
      }
      closeProjectForm();
      loadProjects();
    } catch (err) {
      var msg = (err && err.message) || 'Error desconocido';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        msg = 'Ya existe un proyecto con ese slug. Usá uno diferente.';
      }
      showFormError(projFormErr, 'Error al guardar: ' + msg);
      showToast('Error al guardar el proyecto.', 'error');
    } finally {
      setLoading(btnSaveProj, false, 'Guardar proyecto');
    }
  }

  /* ══════════════════════════════════════
     ARTÍCULOS — Lista
  ══════════════════════════════════════ */

  async function loadArticles() {
    if (!artList) return;
    artList.innerHTML = '<div class="dashboard-loading">Cargando artículos…</div>';
    try {
      var articles = await window.SupabaseAPI.getArticles(true);
      renderArticleList(articles);
    } catch (err) {
      artList.innerHTML = '<div class="dashboard-error">Error al cargar artículos: ' + escHtml((err && err.message) || 'error') + '</div>';
    }
  }

  function renderArticleList(articles) {
    if (!artList) return;

    if (!articles.length) {
      artList.innerHTML = '<p class="dashboard-empty">No hay artículos aún. Creá el primero.</p>';
      return;
    }

    var rows = articles.map(function (a) {
      var titleEs = (a.title && a.title.es) ? a.title.es : (a.slug || '—');
      var pubBadge = a.published
        ? '<span class="dash-badge dash-badge--published">✓ Publicado</span>'
        : '<span class="dash-badge dash-badge--draft">Borrador</span>';
      var dateStr = a.date ? a.date : '—';

      return (
        '<tr class="dashboard-row" data-id="' + escHtml(a._id) + '">' +
          '<td class="dash-td dash-td--slug"><code>' + escHtml(a.slug) + '</code></td>' +
          '<td class="dash-td">' + escHtml(titleEs) + '</td>' +
          '<td class="dash-td">' + escHtml(a.category || '—') + '</td>' +
          '<td class="dash-td">' + escHtml(dateStr) + '</td>' +
          '<td class="dash-td">' + pubBadge + '</td>' +
          '<td class="dash-td dash-td--actions">' +
            '<button class="btn btn--sm btn--outline" data-action="edit-article" data-id="' + escHtml(a._id) + '">✏️ Editar</button>' +
            '<button class="btn btn--sm btn--ghost" data-action="toggle-article" data-id="' + escHtml(a._id) + '" data-pub="' + a.published + '">' +
              (a.published ? '⬇️ Despublicar' : '🚀 Publicar') +
            '</button>' +
            '<button class="btn btn--sm btn--danger" data-action="delete-article" data-id="' + escHtml(a._id) + '" data-slug="' + escHtml(a.slug) + '">🗑 Eliminar</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    artList.innerHTML =
      '<div class="dashboard-table-wrap">' +
        '<table class="dashboard-table">' +
          '<thead><tr>' +
            '<th>Slug</th><th>Título (ES)</th><th>Categoría</th><th>Fecha</th><th>Estado</th><th>Acciones</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    artList.addEventListener('click', handleArticleListClick);
  }

  function handleArticleListClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var action = btn.dataset.action;
    var id     = btn.dataset.id;

    if (action === 'edit-article')   openArticleForm(id);
    if (action === 'delete-article') confirmDeleteArticle(id, btn.dataset.slug);
    if (action === 'toggle-article') {
      var pub = btn.dataset.pub === 'true';
      doToggleArticlePublished(id, !pub);
    }
  }

  async function confirmDeleteArticle(id, slug) {
    if (!window.confirm('¿Eliminar el artículo "' + slug + '"? Esta acción no se puede deshacer.')) return;
    try {
      await window.SupabaseAPI.deleteArticle(id);
      showToast('Artículo eliminado.', '');
      loadArticles();
    } catch (err) {
      showToast('Error al eliminar: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  async function doToggleArticlePublished(id, publish) {
    try {
      await window.SupabaseAPI.toggleArticlePublished(id, publish);
      showToast(publish ? 'Artículo publicado.' : 'Artículo despublicado.', '');
      loadArticles();
    } catch (err) {
      showToast('Error: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  /* ══════════════════════════════════════
     ARTÍCULOS — Formulario
  ══════════════════════════════════════ */

  var artTagsControl = null;

  function setupArticleForm() {
    artTagsControl = setupTagsInput('aTagWrap', 'aTagInput', aTags, null);

    setupImageUpload('aImageFile', 'aImageUrl', 'aImagePreview', 'articles');

    // Auto-generar slug desde título ES
    var titleEsEl = document.getElementById('aTitleEs');
    var slugEl    = document.getElementById('aSlug');
    if (titleEsEl && slugEl) {
      titleEsEl.addEventListener('input', function () {
        if (!editingArtId) {
          slugEl.value = slugify(titleEsEl.value);
        }
      });
    }

    // Fecha por defecto: hoy
    var dateEl = document.getElementById('aDate');
    if (dateEl && !dateEl.value) {
      dateEl.value = new Date().toISOString().slice(0, 10);
    }

    ['btnCancelArticle','btnCancelArticle2'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', closeArticleForm);
    });

    if (btnNewArt) {
      btnNewArt.addEventListener('click', function () { openArticleForm(null); });
    }

    if (artForm) {
      artForm.addEventListener('submit', handleArticleSubmit);
    }
  }

  function openArticleForm(id) {
    editingArtId = id || null;
    clearFormError(artFormErr);

    if (id) {
      artFormTitleEl.textContent = 'Editar artículo';
      populateArticleForm(id);
    } else {
      artFormTitleEl.textContent = 'Nuevo artículo';
      resetArticleForm();
    }

    artFormPanel.classList.remove('admin-form-hidden');
    artFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeArticleForm() {
    artFormPanel.classList.add('admin-form-hidden');
    editingArtId = null;
    resetArticleForm();
  }

  function resetArticleForm() {
    if (artForm) artForm.reset();
    aTags.length = 0;
    if (artTagsControl) artTagsControl.render();
    var preview = document.getElementById('aImagePreview');
    if (preview) preview.innerHTML = '';
    setVal('aContent', '[]');
    // Fecha por defecto al resetear
    var dateEl = document.getElementById('aDate');
    if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
  }

  async function populateArticleForm(id) {
    try {
      var articles = await window.SupabaseAPI.getArticles(true);
      var a = articles.find(function (x) { return x._id === id; });
      if (!a) { showToast('No se encontró el artículo.', 'error'); return; }

      setVal('aSlug',        a.slug);
      setVal('aDate',        a.date || '');
      setVal('aCategory',    a.category);
      setVal('aTitleEs',     a.title   && a.title.es   ? a.title.es   : '');
      setVal('aTitleEn',     a.title   && a.title.en   ? a.title.en   : '');
      setVal('aSummaryEs',   a.summary && a.summary.es ? a.summary.es : '');
      setVal('aSummaryEn',   a.summary && a.summary.en ? a.summary.en : '');
      setVal('aImageUrl',    a.cover || '');
      setVal('aReadingTime', a.readingTime || '');
      setVal('aExternalLink', a.externalLink || '');
      setVal('aContent',     a.sections && a.sections.length ? JSON.stringify(a.sections, null, 2) : '[]');
      setChecked('aPublished', a.published);

      if (a.cover) {
        var preview = document.getElementById('aImagePreview');
        if (preview) preview.innerHTML = '<img src="' + escHtml(a.cover) + '" alt="preview" class="dashboard-image-preview__img" />';
      }

      aTags.length = 0;
      (a.tags || []).forEach(function (t) { aTags.push(t); });
      if (artTagsControl) artTagsControl.render();

    } catch (err) {
      showToast('Error al cargar el artículo: ' + ((err && err.message) || 'error'), 'error');
    }
  }

  async function handleArticleSubmit(e) {
    e.preventDefault();
    clearFormError(artFormErr);

    var slug    = val('aSlug') || slugify(val('aTitleEs'));
    var titleEs = val('aTitleEs');

    if (!titleEs) {
      showFormError(artFormErr, 'El título en español es obligatorio.');
      return;
    }
    if (!validateSlug(slug)) {
      showFormError(artFormErr, 'El slug solo puede contener letras minúsculas, números y guiones, mínimo 2 caracteres.');
      return;
    }

    var content = parseJsonField(val('aContent'), []);
    if (!Array.isArray(content)) {
      showFormError(artFormErr, 'El campo Secciones debe ser un array JSON válido.');
      return;
    }

    var externalLink = val('aExternalLink');
    // Validar URL si se proporcionó
    if (externalLink) {
      try { new URL(externalLink); } catch (e) {
        showFormError(artFormErr, 'El link externo no es una URL válida.');
        return;
      }
    }

    var dateVal = val('aDate');

    var payload = {
      slug:            slug,
      date:            dateVal || null,
      category:        val('aCategory')      || 'general',
      cover_image_url: val('aImageUrl')      || null,
      title:           { es: titleEs,         en: val('aTitleEn') || titleEs },
      excerpt:         { es: val('aSummaryEs') || '', en: val('aSummaryEn') || '' },
      reading_time:    val('aReadingTime')   || null,
      external_link:   externalLink          || null,
      tags:            aTags.slice(),
      content:         content,
      published:       checked('aPublished')
    };

    setLoading(btnSaveArt, true, 'Guardando…');

    try {
      if (editingArtId) {
        await window.SupabaseAPI.saveArticle(payload, editingArtId);
        showToast('Artículo actualizado correctamente.', '');
      } else {
        var session = await window.SupabaseAPI.getSession();
        if (session) payload.author_id = session.user.id;
        await window.SupabaseAPI.saveArticle(payload, null);
        showToast('Artículo creado correctamente.', '');
      }
      closeArticleForm();
      loadArticles();
    } catch (err) {
      var msg = (err && err.message) || 'Error desconocido';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        msg = 'Ya existe un artículo con ese slug. Usá uno diferente.';
      }
      showFormError(artFormErr, 'Error al guardar: ' + msg);
      showToast('Error al guardar el artículo.', 'error');
    } finally {
      setLoading(btnSaveArt, false, 'Guardar artículo');
    }
  }

  /* ══════════════════════════════════════
     HELPERS DE FORM
  ══════════════════════════════════════ */

  function setLoading(btn, loading, defaultText) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Guardando…' : (defaultText || btn.textContent);
  }

  function showFormError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearFormError(el) {
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
  }

  /* ══════════════════════════════════════
     INICIO
  ══════════════════════════════════════ */

  // Esperar a que auth-guard termine (el DOM ya está visible si llegamos aquí)
  window.addEventListener('load', function () {
    if (window.SupabaseAPI) {
      init();
    }
  });

}());
