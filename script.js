/**
 * script.js — Portfolio personal de Gerardo González
 *
 * Funcionalidades:
 * 1. Año dinámico en el footer
 * 2. Navbar: shadow al hacer scroll
 * 3. Menú mobile (hamburguesa)
 * 4. Resaltar enlace activo en la navbar según la sección visible
 * 5. Scroll suave para browsers que no lo soporten nativamente
 * 6. Cambio de idioma ES ↔ EN
 */

/* ─── 0. WIP POPUP ─────────────────────────────────────────── */
(function wipPopup() {
  var overlay = document.getElementById('wipOverlay');
  var btn     = document.getElementById('wipClose');
  if (!overlay || !btn) return;

  btn.addEventListener('click', function () {
    overlay.classList.add('hidden');
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) btn.click();
  });
})();


/* ─── 1. AÑO DINÁMICO ──────────────────────────────────────── */
(function setYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ─── 2. NAVBAR: SHADOW AL SCROLL ──────────────────────────── */
(function navbarScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
})();


/* ─── 3. MENÚ MOBILE ───────────────────────────────────────── */
(function mobileMenu() {
  var toggle = document.getElementById('navToggle');
  var menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  // Abrir / cerrar menú
  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar menú al hacer click en un enlace
  menu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Cerrar menú al presionar Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
})();


/* ─── 4. ACTIVE NAV LINK (Intersection Observer) ───────────── */
(function activeNav() {
  var navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  // Construir mapa: sectionId → navLink
  var linkMap = {};
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;
    }
  });

  // Secciones a observar
  var sections = Array.from(document.querySelectorAll('section[id]'));
  if (!sections.length) return;

  var activeId = null;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (id !== activeId) {
            // Quitar clase activa de todos
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            // Activar el link correspondiente
            if (linkMap[id]) {
              linkMap[id].classList.add('active');
            }
            activeId = id;
          }
        }
      });
    },
    {
      // Dispara cuando el 30% superior de la sección está visible
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();


/* ─── 5. SCROLL SUAVE (fallback para browsers sin CSS support) ─ */
(function smoothScrollFallback() {
  // Si el browser ya soporta scroll-behavior, no hacer nada
  if ('scrollBehavior' in document.documentElement.style) return;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      var navbarH = document.getElementById('navbar')
        ? document.getElementById('navbar').offsetHeight
        : 0;

      var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarH;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ─── 6. CAMBIO DE IDIOMA ES ↔ EN ──────────────────────────── */
(function langToggle() {
  var btn = document.getElementById('langToggle');
  var html = document.documentElement;
  if (!btn) return;

  var currentLang = html.getAttribute('data-lang') || 'es';

  function applyLang(lang) {
    document.querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang);
    });
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    btn.textContent = lang === 'es' ? 'EN' : 'ES';
    currentLang = lang;
    try { localStorage.setItem('lang', lang); } catch(e) {}
  }

  try {
    var saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') { currentLang = saved; }
  } catch(e) {}

  if (currentLang === 'en') { applyLang('en'); } else { btn.textContent = 'EN'; }

  btn.addEventListener('click', function () {
    applyLang(currentLang === 'es' ? 'en' : 'es');
  });
})();


/* ─── 7. PROJECT CATEGORY FILTER ───────────────────────────── */
(function projectFilter() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = this.dataset.filter;

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('filter-btn--active'); });
      this.classList.add('filter-btn--active');

      // Show / hide cards
      cards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.removeAttribute('hidden');
        } else {
          card.setAttribute('hidden', '');
        }
      });
    });
  });
})();


/* ─── 8. ARTICLES — RENDER + FILTER ────────────────────────── */
(function articlesSection() {
  var grid        = document.getElementById('articlesGrid');
  var filterWrap  = document.getElementById('articlesFilters');
  if (!grid || typeof ARTICLES_DATA === 'undefined') return;

  var liveData = null; // replaced by Supabase data when available

  var MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length < 3) return iso;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    var lang = document.documentElement.getAttribute('data-lang') || 'es';
    var months = lang === 'en' ? MONTHS_EN : MONTHS_ES;
    return d + ' ' + months[m] + ' ' + y;
  }

  var CATEGORY_LABELS = {
    'data-science': { es: '📊 Data Science', en: '📊 Data Science' },
    'netsuite':     { es: '⚙️ NetSuite',     en: '⚙️ NetSuite'     },
    'ia':           { es: '🤖 IA',           en: '🤖 AI'            },
    'general':      { es: '💡 General',      en: '💡 General'       }
  };

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function t(obj) {
    var lang = document.documentElement.getAttribute('data-lang') || 'es';
    if (!obj) return '';
    return obj[lang] || obj.es || '';
  }

  function renderCards() {
    grid.innerHTML = '';

    // Sort by date descending
    var sorted = (liveData || ARTICLES_DATA).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });

    if (!sorted.length) {
      grid.innerHTML = '<p class="articles__empty">No hay artículos publicados aún.</p>';
      return;
    }

    sorted.forEach(function (article) {
      var catKey   = article.category || 'general';
      var catLabel = (CATEGORY_LABELS[catKey] && t(CATEGORY_LABELS[catKey])) || catKey;
      var summary  = t(article.summary);
      var title    = t(article.title);
      var tags     = (article.tags || []).slice(0, 4);
      var dest     = article.externalLink
        ? article.externalLink
        : 'article.html?id=' + encodeURIComponent(article.id);
      var isExt    = !!article.externalLink;

      var coverHtml = article.cover
        ? '<img src="' + escHtml(article.cover) + '" alt="" class="article-card__cover" loading="lazy" />'
        : '<div class="article-card__cover-stripe article-card__cover-stripe--' + escHtml(catKey) + '"></div>';

      var tagsHtml = tags.map(function (tag) {
        return '<span class="tag tag--sm">' + escHtml(tag) + '</span>';
      }).join('');

      var readLabel = document.documentElement.getAttribute('data-lang') === 'en' ? 'Read →' : 'Leer →';

      var card = document.createElement('article');
      card.className = 'article-card';
      card.dataset.category = catKey;
      card.innerHTML =
        coverHtml +
        '<div class="article-card__body">' +
          '<div class="article-card__meta">' +
            '<span class="article-card__category article-card__category--' + escHtml(catKey) + '">' + catLabel + '</span>' +
            '<time class="article-card__date">' + escHtml(formatDate(article.date)) + '</time>' +
          '</div>' +
          '<h3 class="article-card__title">' + escHtml(title) + '</h3>' +
          (article.readingTime ? '<span class="article-card__reading-time">⏱ ' + escHtml(article.readingTime) + '</span>' : '') +
          '<p class="article-card__summary">' + escHtml(summary) + '</p>' +
          '<div class="article-card__footer">' +
            '<div class="tags">' + tagsHtml + '</div>' +
            '<a href="' + escHtml(dest) + '"' +
              (isExt ? ' target="_blank" rel="noopener noreferrer"' : '') +
              ' class="btn btn--sm btn--ghost">' + readLabel +
            '</a>' +
          '</div>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  renderCards();

  // Enrich with live data from Supabase if configured
  if (window.SupabaseAPI) {
    window.SupabaseAPI.getArticles(false).then(function (data) {
      if (data && data.length) { liveData = data; renderCards(); }
    }).catch(function () { /* silent: keep showing static data */ });
  }

  // Filter buttons
  if (filterWrap) {
    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      var filter = btn.dataset.filter;

      filterWrap.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('filter-btn--active');
      });
      btn.classList.add('filter-btn--active');

      grid.querySelectorAll('.article-card').forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.removeAttribute('hidden');
        } else {
          card.setAttribute('hidden', '');
        }
      });
    });
  }

  // Re-render when language changes (to update labels / dates)
  document.documentElement.addEventListener('langchange', renderCards);
  // Patch langToggle to dispatch event
  var langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      setTimeout(renderCards, 0);
    });
  }
})();
