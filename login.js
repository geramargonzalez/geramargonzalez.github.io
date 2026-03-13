/**
 * login.js — Lógica de la página de login
 *
 * - Si hay sesión activa con rol admin → redirige al dashboard
 * - Maneja el formulario de login con validaciones básicas
 * - Muestra errores claros (sin exponer detalles internos)
 * - Redirige al ?next= param después de login exitoso, o al dashboard
 */
(function () {
  'use strict';

  var form      = document.getElementById('loginForm');
  var emailEl   = document.getElementById('loginEmail');
  var pwEl      = document.getElementById('loginPassword');
  var errorEl   = document.getElementById('loginError');
  var submitBtn = document.getElementById('loginBtn');
  var togglePw  = document.getElementById('togglePw');
  var toggleIcon = document.getElementById('togglePwIcon');

  /* ── Notificación de sesión expirada ──────────────────────── */
  var params = new URLSearchParams(window.location.search);
  if (params.get('reason') === 'session_expired') {
    showError('Tu sesión expiró. Iniciá sesión nuevamente.');
  }

  /* ── Si ya está autenticado como admin → redirigir ────────── */
  async function checkAlreadyLoggedIn() {
    if (!window.SupabaseAPI) return;
    try {
      var session = await window.SupabaseAPI.getSession();
      if (!session) return;
      var profile = await window.SupabaseAPI.getUserProfile();
      if (profile && profile.role === 'admin') {
        redirectAfterLogin();
      }
    } catch (e) { /* continuar con el formulario */ }
  }

  function redirectAfterLogin() {
    var next = params.get('next');
    // Validar que next sea una ruta relativa (prevenir open redirect)
    if (next && /^\/[^\/]/.test(next)) {
      window.location.href = next;
    } else {
      window.location.href = 'admin-dashboard.html';
    }
  }

  /* ── Toggle mostrar/ocultar contraseña ───────────────────── */
  if (togglePw && pwEl) {
    togglePw.addEventListener('click', function () {
      var isHidden = pwEl.type === 'password';
      pwEl.type = isHidden ? 'text' : 'password';
      if (toggleIcon) toggleIcon.textContent = isHidden ? '🙈' : '👁';
    });
  }

  /* ── Helpers UI ───────────────────────────────────────────── */
  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Verificando…' : 'Entrar';
  }

  /* ── Formulario de login ──────────────────────────────────── */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError();

      var email    = emailEl ? emailEl.value.trim() : '';
      var password = pwEl ? pwEl.value : '';

      if (!email || !password) {
        showError('Completá el email y la contraseña.');
        return;
      }

      if (!window.SupabaseAPI) {
        showError('Supabase no está configurado. Revisá config.js.');
        return;
      }

      setLoading(true);

      try {
        await window.SupabaseAPI.signIn(email, password);

        var profile = await window.SupabaseAPI.getUserProfile();

        if (!profile || profile.role !== 'admin') {
          // Cerrar sesión y mostrar error: el usuario no tiene permisos
          await window.SupabaseAPI.signOut();
          showError('Tu cuenta no tiene permisos de administrador.');
          return;
        }

        redirectAfterLogin();

      } catch (err) {
        // Traducir errores comunes sin exponer detalles técnicos
        var raw = (err && err.message) ? err.message.toLowerCase() : '';
        var msg;
        if (raw.includes('invalid login') || raw.includes('invalid credentials')) {
          msg = 'Email o contraseña incorrectos.';
        } else if (raw.includes('email not confirmed')) {
          msg = 'Confirmá tu email para continuar.';
        } else if (raw.includes('rate limit') || raw.includes('too many requests')) {
          msg = 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';
        } else {
          msg = 'Error al iniciar sesión. Intentá de nuevo.';
        }
        showError(msg);
      } finally {
        setLoading(false);
      }
    });
  }

  checkAlreadyLoggedIn();

}());
