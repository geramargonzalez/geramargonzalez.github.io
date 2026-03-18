-- ============================================================
-- SUPABASE SCHEMA — geramaargonzalez.github.io
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Orden: ejecutar todo en una sola pasada o sección por sección
-- ============================================================


-- ─── PROFILES ───────────────────────────────────────────────
-- Cada usuario de auth.users tiene un perfil con rol.
-- El trigger lo crea automáticamente al registrarse.

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- Trigger: crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ─── PROJECTS ───────────────────────────────────────────────
-- title, subtitle, summary y content son JSONB para soportar
-- contenido bilingüe { "es": "...", "en": "..." } y secciones.

CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  category     TEXT,
  year         TEXT,
  title        JSONB       NOT NULL,   -- { "es": "Título", "en": "Title" }
  subtitle     JSONB,                  -- { "es": "...", "en": "..." }
  summary      JSONB,                  -- { "es": "...", "en": "..." } (description)
  content      JSONB,                  -- array de sections (igual que projects-data.js)
  image_url    TEXT,
  technologies TEXT[],
  tags         TEXT[],
  links        JSONB,                  -- array de { label, url, style, download? }
  published    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);


-- ─── ARTICLES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.articles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  date            DATE,
  category        TEXT,
  cover_image_url TEXT,
  title           JSONB       NOT NULL,   -- { "es": "...", "en": "..." }
  excerpt         JSONB,                  -- { "es": "...", "en": "..." } (summary/resumen)
  reading_time    TEXT,
  external_link   TEXT,
  tags            TEXT[],
  content         JSONB,                  -- array de sections
  published       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);


-- ─── TRIGGER: updated_at automático ─────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ─── ÍNDICES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_slug      ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_slug      ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_date      ON public.articles(date DESC);


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles  ENABLE ROW LEVEL SECURITY;


-- ─── POLÍTICAS: profiles ────────────────────────────────────

-- Cada usuario solo puede leer su propio perfil
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins pueden gestionar todos los perfiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- ─── POLÍTICAS: projects ────────────────────────────────────

-- Público (anon): solo puede leer proyectos publicados
DROP POLICY IF EXISTS "Public can read published projects" ON public.projects;
CREATE POLICY "Public can read published projects"
  ON public.projects
  FOR SELECT
  USING (published = TRUE);

-- Admins pueden leer todos los proyectos (incluyendo no publicados)
DROP POLICY IF EXISTS "Admins can read all projects" ON public.projects;
CREATE POLICY "Admins can read all projects"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins pueden insertar proyectos
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins pueden actualizar proyectos
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins pueden eliminar proyectos
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── POLÍTICAS: articles ────────────────────────────────────

DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
CREATE POLICY "Public can read published articles"
  ON public.articles
  FOR SELECT
  USING (published = TRUE);

DROP POLICY IF EXISTS "Admins can read all articles" ON public.articles;
CREATE POLICY "Admins can read all articles"
  ON public.articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
CREATE POLICY "Admins can insert articles"
  ON public.articles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles"
  ON public.articles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles"
  ON public.articles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── STORAGE ────────────────────────────────────────────────
-- Crear el bucket desde Dashboard → Storage → New bucket
-- Nombre: portfolio-images | Public bucket: ON
-- Luego ejecutar estas políticas:

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
CREATE POLICY "Public can read images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
CREATE POLICY "Admins can upload images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
CREATE POLICY "Admins can update images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
CREATE POLICY "Admins can delete images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── ASIGNAR ROL ADMIN al primer usuario ────────────────────
-- Ejecutar DESPUÉS de crear tu primer usuario en Authentication → Users
-- Reemplazar el email con el tuyo:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'tu-email@ejemplo.com';
