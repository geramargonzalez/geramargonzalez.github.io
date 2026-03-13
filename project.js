/**
 * project.js — Lógica de la página de detalle de proyecto
 *
 * Lee el parámetro ?id= de la URL, busca el proyecto en PROJECTS_DATA
 * (definido en projects-data.js) y renderiza el contenido en #project-main.
 */

(function projectDetail() {

  /* ── Helpers de idioma ───────────────────────────────────── */
  var html  = document.documentElement;
  var langBtn = document.getElementById('langToggle');
  var currentLang = html.getAttribute('data-lang') || 'es';

  // Leer preferencia guardada
  try {
    var saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') { currentLang = saved; }
  } catch (e) {}

  function t(obj) {
    return (obj && obj[currentLang]) ? obj[currentLang] : (obj && obj.es) || '';
  }

  /* ── Constantes de categorías ────────────────────────────── */
  var CAT_LABEL = { 'data-science': 'Data Science', web: 'Web', software: 'Software' };
  var CAT_ICON  = { 'data-science': '📊', web: '🌐', software: '⚙️' };

  /* ── Buscar proyecto ─────────────────────────────────────── */
  var params  = new URLSearchParams(window.location.search);
  var id      = params.get('id');
  var project = (typeof PROJECTS_DATA !== 'undefined')
    ? PROJECTS_DATA.find(function (p) { return p.id === id; })
    : null;

  var mainEl = document.getElementById('project-main');

  if (!project) {
    mainEl.innerHTML =
      '<div style="padding-top:calc(var(--navbar-h) + 4rem);padding-bottom:4rem;text-align:center">' +
        '<p style="color:var(--clr-text-muted);margin-bottom:1.5rem">Proyecto no encontrado.</p>' +
        '<a href="index.html#proyectos" class="btn btn--outline">← Volver a Proyectos</a>' +
      '</div>';
    return;
  }

  /* ── Construir HTML ──────────────────────────────────────── */

  // Cover image o gradiente
  var coverHtml = project.cover
    ? '<img src="' + project.cover + '" alt="' + escHtml(t(project.title)) + '" class="project-detail__cover">'
    : '<div class="project-detail__cover project-detail__cover--placeholder"></div>';

  // Tags del sidebar
  var tagsHtml = project.tags.map(function (tag) {
    return '<span class="tag tag--sm">' + escHtml(tag) + '</span>';
  }).join('');

  // Links del sidebar
  var linksHtml = project.links.map(function (l) {
    var dl = l.download ? ' download' : '';
    return '<a href="' + escHtml(l.url) + '" class="btn btn--sm btn--' + l.style + '"' +
           ' target="_blank" rel="noopener noreferrer"' + dl + '>' + escHtml(l.label) + '</a>';
  }).join('');

  // Secciones fijas opcionales (context, methodology, results) — compatibilidad hacia atrás
  var sectionsHtml = [
    { key: 'context',     labelEs: 'Contexto',      labelEn: 'Context'      },
    { key: 'methodology', labelEs: 'Metodología',   labelEn: 'Methodology'  },
    { key: 'results',     labelEs: 'Resultados',    labelEn: 'Results'      }
  ].map(function (s) {
    var content = project[s.key] ? t(project[s.key]) : '';
    if (!content) return '';
    return (
      '<div class="project-detail__section" data-key="' + s.key + '">' +
        '<h3 class="project-detail__section-title"' +
            ' data-es="' + escHtml(s.labelEs) + '"' +
            ' data-en="' + escHtml(s.labelEn) + '">' +
          s.labelEs +
        '</h3>' +
        '<div class="project-detail__section-body">' + content + '</div>' +
      '</div>'
    );
  }).join('');

  // Secciones libres (generadas desde el admin)
  // Cada sección: { title, blocks: [ {type:'text'|'image', content, caption?} ] }
  if (Array.isArray(project.sections)) {
    sectionsHtml += project.sections.map(function (sec, si) {
      var blocksHtml = (sec.blocks || []).map(function (block) {
        if (block.type === 'image') {
          return (
            '<figure class="project-detail__figure">' +
              '<img src="' + escHtml(block.content) + '" alt="' + escHtml(block.caption || '') + '" class="project-detail__figure-img">' +
              (block.caption ? '<figcaption class="project-detail__figure-caption">' + escHtml(block.caption) + '</figcaption>' : '') +
            '</figure>'
          );
        }
        // type === 'text'
        return '<div class="project-detail__section-body">' + block.content + '</div>';
      }).join('');

      return (
        '<div class="project-detail__section" data-free-section="' + si + '">' +
          '<h3 class="project-detail__section-title">' + escHtml(sec.title) + '</h3>' +
          blocksHtml +
        '</div>'
      );
    }).join('');
  }

  var rendered =
    '<div class="project-detail">' +

      // Breadcrumb
      '<div class="container">' +
        '<nav class="project-detail__breadcrumb" aria-label="Breadcrumb">' +
          '<a href="index.html" data-es="Inicio" data-en="Home">Inicio</a>' +
          '<span aria-hidden="true">›</span>' +
          '<a href="index.html#proyectos" data-es="Proyectos" data-en="Projects">Proyectos</a>' +
          '<span aria-hidden="true">›</span>' +
          '<span>' + escHtml(t(project.title)) + '</span>' +
        '</nav>' +
      '</div>' +

      // Hero
      '<div class="project-detail__hero">' +
        coverHtml +
        '<div class="project-detail__hero-overlay">' +
          '<div class="container">' +
            '<div class="project-card__category project-card__category--' + project.category + '" style="margin-bottom:0.75rem">' +
              CAT_ICON[project.category] + ' ' + CAT_LABEL[project.category] +
            '</div>' +
            '<h1 class="project-detail__title"' +
                ' data-es="' + escHtml(t(project.title)) + '"' +
                ' data-en="' + escHtml(project.title.en || project.title.es) + '">' +
              escHtml(t(project.title)) +
            '</h1>' +
            '<p class="project-detail__subtitle"' +
               ' data-es="' + escHtml(project.subtitle.es || '') + '"' +
               ' data-en="' + escHtml(project.subtitle.en || '') + '">' +
              escHtml(t(project.subtitle)) +
            '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Body (main + sidebar)
      '<div class="container">' +
        '<div class="project-detail__body">' +

          // Main content
          '<div class="project-detail__main">' +
            '<p class="project-detail__desc"' +
               ' data-es="' + escHtml(project.description.es || '') + '"' +
               ' data-en="' + escHtml(project.description.en || '') + '">' +
              t(project.description) +
            '</p>' +
            sectionsHtml +
          '</div>' +

          // Sidebar
          '<aside class="project-detail__sidebar">' +
            '<div class="project-detail__meta-card">' +
              '<div class="project-detail__meta-row">' +
                '<span class="project-detail__meta-label" data-es="Año" data-en="Year">Año</span>' +
                '<span class="project-detail__meta-value">' + escHtml(project.year) + '</span>' +
              '</div>' +
              '<div class="project-detail__meta-row">' +
                '<span class="project-detail__meta-label" data-es="Categoría" data-en="Category">Categoría</span>' +
                '<span class="project-card__category project-card__category--' + project.category + '" style="font-size:0.72rem;margin-bottom:0">' +
                  CAT_ICON[project.category] + ' ' + CAT_LABEL[project.category] +
                '</span>' +
              '</div>' +
              '<div class="project-detail__meta-row">' +
                '<span class="project-detail__meta-label">Stack</span>' +
                '<div class="project-card__tags" style="margin-top:0.3rem">' + tagsHtml + '</div>' +
              '</div>' +
              '<div class="project-detail__meta-links">' + linksHtml + '</div>' +
            '</div>' +
          '</aside>' +

        '</div>' +

        // Back button
        '<div class="project-detail__back">' +
          '<a href="index.html#proyectos" class="btn btn--outline"' +
             ' data-es="← Volver a Proyectos" data-en="← Back to Projects">' +
            '← Volver a Proyectos' +
          '</a>' +
        '</div>' +

      '</div>' + // .container
    '</div>'; // .project-detail

  mainEl.innerHTML = rendered;

  /* ── Aplicar idioma guardado ─────────────────────────────── */
  document.title = t(project.title) + ' | Gerardo González';

  function applyLang(lang) {
    currentLang = lang;
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    if (langBtn) langBtn.textContent = lang === 'es' ? 'EN' : 'ES';

    // Actualizar todos los elementos con data-es / data-en
    document.querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang);
    });

    // Actualizar secciones con HTML dinámico (methodology puede tener HTML)
    document.querySelectorAll('.project-detail__section[data-key]').forEach(function (sec) {
      var key = sec.dataset.key;
      if (project[key]) {
        sec.querySelector('.project-detail__section-body').innerHTML = t(project[key]);
      }
    });

    // Actualizar descripción
    var descEl = mainEl.querySelector('.project-detail__desc');
    if (descEl) descEl.textContent = t(project.description);

    // Actualizar título de página
    document.title = t(project.title) + ' | Gerardo González';

    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  if (currentLang === 'en') {
    applyLang('en');
  } else if (langBtn) {
    langBtn.textContent = 'EN';
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(currentLang === 'es' ? 'en' : 'es');
    });
  }

  /* ── Navbar helpers ──────────────────────────────────────── */

  // Shadow al hacer scroll
  var navbar = document.getElementById('navbar');
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú mobile
  var toggle = document.getElementById('navToggle');
  var menu   = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    menu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  // Año dinámico en el footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Utilidad: escapar HTML ──────────────────────────────── */
  function escHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

})();
