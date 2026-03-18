/**
 * auth-guard.js — Protección de páginas admin
 *
 * Cargar DESPUÉS de supabase-client.js en todas las páginas admin.
 *
 * Comportamiento:
 *   - Oculta el contenido inmediatamente (evita flash de contenido no autorizado)
 *   - Verifica sesión activa y rol 'admin' en profiles
 *   - Si no hay sesión → redirige a login.html
 *   - Si no es admin → muestra página de acceso denegado
 *   - Si es admin → muestra la página
 *   - Escucha SIGNED_OUT para redirigir en caso de logout o expiración
 */
(function () {
  'use strict';

  // Ocultar el documento inmediatamente para evitar flash de contenido
  document.documentElement.style.visibility = 'hidden';

  function showDenied(message) {
    // IMPORTANT: restore visibility only AFTER setting innerHTML.
    // Scripts run in <head> so document.body may be null at this point —
    // if so, wait for DOMContentLoaded before rendering.
    var html =
      '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;' +
           'justify-content:center;gap:1.25rem;font-family:system-ui,sans-serif;' +
           'background:var(--clr-primary,#090e1a);color:#f8fafc;padding:2rem;text-align:center;">' +
        '<span style="font-size:3rem;">🔒</span>' +
        '<h1 style="font-size:1.5rem;font-weight:700;margin:0;">Acceso denegado</h1>' +
        '<p style="color:#94a3b8;margin:0;max-width:360px;">' + message + '</p>' +
        '<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">' +
          '<a href="login.html" style="padding:.6rem 1.5rem;background:#4f46e5;color:#fff;' +
               'border-radius:.5rem;text-decoration:none;font-weight:600;">Iniciar sesión</a>' +
          '<a href="index.html" style="padding:.6rem 1.5rem;border:1px solid #334155;' +
               'color:#94a3b8;border-radius:.5rem;text-decoration:none;">← Portfolio</a>' +
        '</div>' +
      '</div>';

    function render() {
      document.body.innerHTML = html;
      document.documentElement.style.visibility = '';
    }

    if (document.body) {
      render();
    } else {
      document.addEventListener('DOMContentLoaded', render);
    }
  }

  async function checkAdminAccess() {
    // Si Supabase no está configurado, bloquear acceso
    if (!window.SupabaseAPI) {
      showDenied('Supabase no está configurado. Revisá <code>config.js</code> antes de acceder al panel admin.');
      return;
    }

    try {
      var session = await window.SupabaseAPI.getSession();

      if (!session) {
        // No hay sesión → redirigir a login con parámetro de retorno
        var returnPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace('login.html?next=' + returnPath);
        return;
      }

      var profile = await window.SupabaseAPI.getUserProfile();

      if (!profile) {
        showDenied('No se encontró tu perfil de usuario. Contactá al administrador.');
        return;
      }

      if (profile.role !== 'admin') {
        showDenied('Tu cuenta (' + profile.email + ') no tiene permisos de administrador.');
        return;
      }

      // Acceso autorizado → mostrar página
      document.documentElement.style.visibility = '';

    } catch (err) {
      showDenied('Error al verificar la sesión. Intentá iniciar sesión de nuevo.');
    }
  }

  // Escuchar cambios de estado de auth (logout, expiración de token)
  window.addEventListener('load', function () {
    if (!window.SupabaseAPI) return;
    window.SupabaseAPI.client.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_OUT') {
        window.location.replace('login.html?reason=session_expired');
      }
    });
  });

  checkAdminAccess();

}());
