/**
 * supabase-client.js — Cliente y helpers de Supabase
 *
 * Prerrequisitos (cargar antes de este archivo):
 *   1. config.js           → define window.SUPABASE_URL y window.SUPABASE_ANON_KEY
 *   2. supabase-js CDN UMD → expone window.supabase.createClient
 *
 * Exporta: window.SupabaseAPI  (null si Supabase no está configurado)
 *
 * La anon key es pública por diseño de Supabase. Toda la seguridad real
 * está respaldada por las políticas RLS en la base de datos.
 */
(function () {
  'use strict';

  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;

  // Detectar si las credenciales son reales (no el placeholder)
  var configured = (
    url && key &&
    url.indexOf('YOUR_PROJECT_REF') === -1 &&
    key.indexOf('YOUR_ANON') === -1 &&
    typeof window.supabase !== 'undefined' &&
    typeof window.supabase.createClient === 'function'
  );

  if (!configured) {
    window.SupabaseAPI = null;
    return;
  }

  var client = window.supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  /* ══════════════════════════════════════
     AUTH
  ══════════════════════════════════════ */

  async function signIn(email, password) {
    var result = await client.auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signOut() {
    var result = await client.auth.signOut();
    if (result.error) throw result.error;
  }

  async function getSession() {
    var result = await client.auth.getSession();
    if (result.error) return null;
    return result.data.session;
  }

  async function getUserProfile() {
    var session = await getSession();
    if (!session) return null;

    var userEmail = session.user.email;

    // 1. Try reading from profiles table (requires RLS policy to allow it)
    var result = await client
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', session.user.id)
      .single();

    if (result.data) return result.data;

    // 2. Fallback: check user_metadata (set in Supabase Dashboard → Users → User Metadata)
    var meta = (session.user.user_metadata) || {};
    if (meta.role) {
      return { id: session.user.id, email: userEmail, role: meta.role };
    }

    // 3. Fallback: check ADMIN_EMAIL from config.js — for single-admin personal portfolios
    if (window.ADMIN_EMAIL && userEmail === window.ADMIN_EMAIL) {
      return { id: session.user.id, email: userEmail, role: 'admin' };
    }

    return null;
  }

  /* ══════════════════════════════════════
     PROJECTS
  ══════════════════════════════════════ */

  async function getProjects(adminMode) {
    var query = client
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!adminMode) {
      query = query.eq('published', true);
    }

    var result = await query;
    if (result.error) throw result.error;
    return (result.data || []).map(mapProjectRow);
  }

  async function getProjectBySlug(slug) {
    var result = await client
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (result.error) return null;
    if (!result.data) return null;
    return mapProjectRow(result.data);
  }

  // payload = objeto con los campos de la tabla projects (snake_case)
  // id = UUID de la fila (para update); omitir para insert
  async function saveProject(payload, id) {
    if (id) {
      var result = await client
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    } else {
      var result = await client
        .from('projects')
        .insert(payload)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    }
  }

  async function deleteProject(id) {
    var result = await client.from('projects').delete().eq('id', id);
    if (result.error) throw result.error;
  }

  async function toggleProjectPublished(id, published) {
    var result = await client
      .from('projects')
      .update({ published: published })
      .eq('id', id)
      .select()
      .single();
    if (result.error) throw result.error;
    return result.data;
  }

  /* ══════════════════════════════════════
     ARTICLES
  ══════════════════════════════════════ */

  async function getArticles(adminMode) {
    var query = client
      .from('articles')
      .select('*')
      .order('date', { ascending: false });

    if (!adminMode) {
      query = query.eq('published', true);
    }

    var result = await query;
    if (result.error) throw result.error;
    return (result.data || []).map(mapArticleRow);
  }

  async function getArticleBySlug(slug) {
    var result = await client
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (result.error) return null;
    if (!result.data) return null;
    return mapArticleRow(result.data);
  }

  async function saveArticle(payload, id) {
    if (id) {
      var result = await client
        .from('articles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    } else {
      var result = await client
        .from('articles')
        .insert(payload)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    }
  }

  async function deleteArticle(id) {
    var result = await client.from('articles').delete().eq('id', id);
    if (result.error) throw result.error;
  }

  async function toggleArticlePublished(id, published) {
    var result = await client
      .from('articles')
      .update({ published: published })
      .eq('id', id)
      .select()
      .single();
    if (result.error) throw result.error;
    return result.data;
  }

  /* ══════════════════════════════════════
     STORAGE
  ══════════════════════════════════════ */

  // Sube un archivo al bucket portfolio-images.
  // path: nombre de archivo dentro del bucket (ej: 'projects/mi-imagen.jpg')
  // Retorna la URL pública del archivo.
  async function uploadImage(file, path) {
    // Sanitizar nombre de archivo: solo caracteres seguros
    var safeName = (path || file.name)
      .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
      .replace(/_{2,}/g, '_');

    var result = await client.storage
      .from('portfolio-images')
      .upload(safeName, file, { upsert: true });

    if (result.error) throw result.error;

    var urlResult = client.storage
      .from('portfolio-images')
      .getPublicUrl(result.data.path);

    return urlResult.data.publicUrl;
  }

  /* ══════════════════════════════════════
     MAPPERS — fila DB → formato interno
  ══════════════════════════════════════ */

  // Mapea una fila de la tabla projects al formato usado por project.js / script.js
  function mapProjectRow(row) {
    return {
      _id:         row.id,          // UUID interno de la BD
      id:          row.slug,        // usado en ?id= de la URL
      slug:        row.slug,
      category:    row.category     || '',
      year:        row.year         || '',
      cover:       row.image_url    || null,
      title:       row.title        || {},
      subtitle:    row.subtitle     || {},
      description: row.summary      || {},
      tags:        row.technologies || row.tags || [],
      links:       row.links        || [],
      sections:    row.content      || [],
      published:   row.published,
      created_at:  row.created_at,
      updated_at:  row.updated_at,
      author_id:   row.author_id
    };
  }

  // Mapea una fila de la tabla articles al formato usado por article.js / script.js
  function mapArticleRow(row) {
    return {
      _id:          row.id,
      id:           row.slug,
      slug:         row.slug,
      date:         row.date,
      category:     row.category        || 'general',
      cover:        row.cover_image_url || null,
      title:        row.title           || {},
      summary:      row.excerpt         || {},
      readingTime:  row.reading_time    || null,
      externalLink: row.external_link   || null,
      tags:         row.tags            || [],
      sections:     row.content         || [],
      published:    row.published,
      created_at:   row.created_at,
      updated_at:   row.updated_at,
      author_id:    row.author_id
    };
  }

  /* ══════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════ */

  // Genera un slug URL-safe a partir de un texto libre
  function slugify(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // quitar tildes
      .replace(/[^a-z0-9\s\-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-');
  }

  /* ══════════════════════════════════════
     EXPORT
  ══════════════════════════════════════ */

  window.SupabaseAPI = {
    client,
    // Auth
    signIn,
    signOut,
    getSession,
    getUserProfile,
    // Projects
    getProjects,
    getProjectBySlug,
    saveProject,
    deleteProject,
    toggleProjectPublished,
    // Articles
    getArticles,
    getArticleBySlug,
    saveArticle,
    deleteArticle,
    toggleArticlePublished,
    // Storage
    uploadImage,
    // Utils
    slugify,
    mapProjectRow,
    mapArticleRow
  };

}());
