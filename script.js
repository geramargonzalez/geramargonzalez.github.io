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
    // Actualizar todos los elementos con data-es / data-en
    document.querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang);
    });

    // Actualizar atributo html y botón
    html.setAttribute('lang', lang);
    html.setAttribute('data-lang', lang);
    btn.textContent = lang === 'es' ? 'EN' : 'ES';
    currentLang = lang;

    // Persistir preferencia
    try { localStorage.setItem('lang', lang); } catch(e) {}
  }

  // Leer preferencia guardada
  try {
    var saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') {
      currentLang = saved;
    }
  } catch(e) {}

  // Aplicar idioma inicial si no es español
  if (currentLang === 'en') {
    applyLang('en');
  } else {
    btn.textContent = 'EN';
  }

  btn.addEventListener('click', function () {
    applyLang(currentLang === 'es' ? 'en' : 'es');
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
