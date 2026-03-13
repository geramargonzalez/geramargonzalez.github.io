/**
 * article.js — Renderiza la página de detalle de un artículo
 *
 * Lee ?id= de la URL, busca el artículo en ARTICLES_DATA e
 * inyecta el HTML en #article-main.
 */

(function articleDetail() {

  /* ── Utilidades ── */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Año en footer ── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Navbar scroll ── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Menú mobile ── */
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
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Cambio de idioma ── */
  var langBtn  = document.getElementById('langToggle');
  var htmlEl   = document.documentElement;
  var lang     = (function () {
    try { return localStorage.getItem('lang') || 'es'; } catch (e) { return 'es'; }
  }());

  function applyLang(l) {
    document.querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + l);
    });
    htmlEl.setAttribute('lang', l);
    htmlEl.setAttribute('data-lang', l);
    if (langBtn) langBtn.textContent = l === 'es' ? 'EN' : 'ES';
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    renderPage(); // re-render with new lang
  }

  if (langBtn) {
    if (lang === 'en') applyLang('en'); else if (langBtn) langBtn.textContent = 'EN';
    langBtn.addEventListener('click', function () {
      applyLang(lang === 'es' ? 'en' : 'es');
    });
  }

  /* ── Helpers de traducción ── */
  function t(obj) {
    if (!obj) return '';
    return obj[lang] || obj.es || '';
  }

  /* ── Formato de fecha ── */
  var MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length < 3) return iso;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    var months = lang === 'en' ? MONTHS_EN : MONTHS_ES;
    return d + ' ' + months[m] + ' ' + y;
  }

  /* ── Categorías ── */
  var CATEGORY_LABELS = {
    'data-science': { es: '📊 Data Science', en: '📊 Data Science' },
    'netsuite':     { es: '⚙️ NetSuite',     en: '⚙️ NetSuite'     },
    'ia':           { es: '🤖 IA',            en: '🤖 AI'           },
    'general':      { es: '💡 General',       en: '💡 General'      }
  };

  /* ── Leer ID desde URL ── */
  var params = new URLSearchParams(window.location.search);
  var id     = params.get('id');
  var main   = document.getElementById('article-main');

  if (!id || typeof ARTICLES_DATA === 'undefined') {
    main.innerHTML = '<div class="container" style="padding-top:calc(var(--navbar-h) + 3rem);padding-bottom:4rem"><p>Artículo no encontrado.</p><a href="index.html#articulos" class="btn btn--outline" style="margin-top:1rem">← Volver</a></div>';
    return;
  }

  var article = null;
  for (var i = 0; i < ARTICLES_DATA.length; i++) {
    if (ARTICLES_DATA[i].id === id) { article = ARTICLES_DATA[i]; break; }
  }

  if (!article) {
    if (window.SupabaseAPI && id) {
      main.innerHTML = '<div class="container" style="padding-top:calc(var(--navbar-h) + 3rem);padding-bottom:4rem;text-align:center;color:var(--clr-text-muted)">Cargando…</div>';
      window.SupabaseAPI.getArticleBySlug(id).then(function (fetched) {
        if (fetched) { article = fetched; renderPage(); }
        else { main.innerHTML = '<div class="container" style="padding-top:calc(var(--navbar-h) + 3rem);padding-bottom:4rem"><p>Artículo no encontrado.</p><a href="index.html#articulos" class="btn btn--outline" style="margin-top:1rem">← Volver</a></div>'; }
      }).catch(function () {
        main.innerHTML = '<div class="container" style="padding-top:calc(var(--navbar-h) + 3rem);padding-bottom:4rem"><p>Artículo no encontrado.</p><a href="index.html#articulos" class="btn btn--outline" style="margin-top:1rem">← Volver</a></div>';
      });
      return;
    }
    main.innerHTML = '<div class="container" style="padding-top:calc(var(--navbar-h) + 3rem);padding-bottom:4rem"><p>Artículo no encontrado.</p><a href="index.html#articulos" class="btn btn--outline" style="margin-top:1rem">← Volver</a></div>';
    return;
  }

  /* ── Render ── */
  function renderPage() {
    // Update document title
    document.title = t(article.title) + ' · Gerardo González';

    var catKey    = article.category || 'general';
    var catLabel  = (CATEGORY_LABELS[catKey] && t(CATEGORY_LABELS[catKey])) || catKey;
    var dateStr   = formatDate(article.date);

    /* Hero */
    var heroHtml;
    if (article.cover) {
      heroHtml =
        '<div class="project-detail__hero">' +
          '<img src="' + escHtml(article.cover) + '" alt="" class="project-detail__cover" />' +
          '<div class="project-detail__hero-overlay">' +
            '<div class="container">' +
              '<div class="article-detail__meta">' +
                '<span class="article-card__category article-card__category--' + escHtml(catKey) + '">' + catLabel + '</span>' +
                (article.readingTime ? '<span class="article-detail__reading">⏱ ' + escHtml(article.readingTime) + '</span>' : '') +
              '</div>' +
              '<h1 class="project-detail__title">' + escHtml(t(article.title)) + '</h1>' +
              '<p class="project-detail__subtitle">' + escHtml(dateStr) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>';
    } else {
      heroHtml =
        '<div class="project-detail__hero">' +
          '<div class="project-detail__cover--placeholder"></div>' +
          '<div class="project-detail__hero-overlay">' +
            '<div class="container">' +
              '<div class="article-detail__meta">' +
                '<span class="article-card__category article-card__category--' + escHtml(catKey) + '">' + catLabel + '</span>' +
                (article.readingTime ? '<span class="article-detail__reading">⏱ ' + escHtml(article.readingTime) + '</span>' : '') +
              '</div>' +
              '<h1 class="project-detail__title">' + escHtml(t(article.title)) + '</h1>' +
              '<p class="project-detail__subtitle">' + escHtml(dateStr) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    /* Breadcrumb */
    var breadcrumbHtml =
      '<div class="project-detail__breadcrumb">' +
        '<div class="container">' +
          '<a href="index.html#articulos" data-es="← Todos los artículos" data-en="← All articles">' +
            (lang === 'en' ? '← All articles' : '← Todos los artículos') +
          '</a>' +
        '</div>' +
      '</div>';

    /* Sections */
    var sectionsHtml = '';
    if (Array.isArray(article.sections)) {
      sectionsHtml = article.sections.map(function (sec, si) {
        var blocksHtml = (sec.blocks || []).map(function (block) {
          if (block.type === 'image') {
            return '<figure class="project-detail__figure">' +
              '<img src="' + escHtml(block.content) + '" alt="' + escHtml(block.caption || '') + '" class="project-detail__figure-img" />' +
              (block.caption ? '<figcaption class="project-detail__figure-caption">' + escHtml(block.caption) + '</figcaption>' : '') +
            '</figure>';
          }
          return '<div class="project-detail__section-body">' + block.content + '</div>';
        }).join('');

        return '<div class="project-detail__section">' +
          '<h3 class="project-detail__section-title">' + escHtml(sec.title) + '</h3>' +
          blocksHtml +
        '</div>';
      }).join('');
    }

    /* Tags */
    var tagsHtml = '';
    if (article.tags && article.tags.length) {
      tagsHtml =
        '<div class="tags" style="margin-top:var(--space-lg);padding-top:var(--space-lg);border-top:1px solid var(--clr-border)">' +
          article.tags.map(function (tag) {
            return '<span class="tag tag--accent">' + escHtml(tag) + '</span>';
          }).join('') +
        '</div>';
    }

    /* External link notice */
    var extLinkHtml = '';
    if (article.externalLink) {
      extLinkHtml =
        '<div class="article-detail__ext-link">' +
          '<a href="' + escHtml(article.externalLink) + '" target="_blank" rel="noopener noreferrer" class="btn btn--primary">' +
            (lang === 'en' ? '↗ Read full article' : '↗ Leer artículo completo') +
          '</a>' +
        '</div>';
    }

    /* Full page */
    main.innerHTML =
      heroHtml +
      breadcrumbHtml +
      '<div class="container">' +
        '<div class="article-detail__body">' +
          sectionsHtml +
          extLinkHtml +
          tagsHtml +
        '</div>' +
      '</div>';
  }

  renderPage();

})();
