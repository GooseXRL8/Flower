-- 1. Enable UUID Extension if needed (though we use randomized key IDs as text)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the tables if they don't exist yet
-- PROFILES TABLE (Stores the shared couple workspace configuration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id text PRIMARY KEY,
    name1 text NOT NULL,
    name2 text NOT NULL,
    created_by text NOT NULL,
    start_date text NOT NULL,
    custom_title text,
    image_url text,
    theme text NOT NULL DEFAULT 'pink',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- USERS TABLE (Stores individual registered accounts linked to profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    username text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    assigned_profile_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_profiles FOREIGN KEY (assigned_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- MEMORIES TABLE (Stores sweet shared timeline achievements and records)
CREATE TABLE IF NOT EXISTS public.memories (
    id text PRIMARY KEY,
    profile_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    memory_date text NOT NULL,
    location text,
    image_url text,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_favorite boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_memories_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- PHOTOS TABLE (Stores the shared gallery pictures and uploads)
CREATE TABLE IF NOT EXISTS public.photos (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    owner_name text NOT NULL,
    url text NOT NULL,
    profile_id text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_photos_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 4. Create secure Row Level Security policies

-- ============================================================
-- PROFILES — acesso restrito por relacionamento
-- ============================================================
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;

CREATE POLICY "Profiles: owner ou parceiro pode ler"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = created_by
    OR auth.uid()::text IN (
      SELECT id FROM public.users WHERE assigned_profile_id = profiles.id
    )
  );

CREATE POLICY "Profiles: usuario autenticado cria o proprio"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Profiles: owner ou parceiro pode atualizar"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid()::text = created_by
    OR auth.uid()::text IN (
      SELECT id FROM public.users WHERE assigned_profile_id = profiles.id
    )
  );

CREATE POLICY "Profiles: somente owner pode deletar"
  ON public.profiles FOR DELETE
  USING (auth.uid()::text = created_by);

-- ============================================================
-- USERS — cada usuario gerencia apenas seus proprios dados
-- ============================================================
DROP POLICY IF EXISTS "Allow public select users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
DROP POLICY IF EXISTS "Allow public update users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete users" ON public.users;

CREATE POLICY "Users: usuario le o proprio perfil ou do parceiro"
  ON public.users FOR SELECT
  USING (
    auth.uid()::text = id
    OR (
      assigned_profile_id IS NOT NULL
      AND assigned_profile_id IN (
        SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users: usuario cria o proprio registro"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users: usuario atualiza apenas o proprio (sem promover a admin)"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (
    auth.uid()::text = id
    AND is_admin = (SELECT is_admin FROM public.users WHERE id = auth.uid()::text)
  );

-- ============================================================
-- MEMORIES — restrito ao profile_id do usuario
-- ============================================================
DROP POLICY IF EXISTS "Allow public select memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public insert memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public update memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public delete memories" ON public.memories;

CREATE POLICY "Memories: usuario le memorias do seu perfil"
  ON public.memories FOR SELECT
  USING (
    profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Memories: usuario cria apenas no seu perfil"
  ON public.memories FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Memories: usuario edita apenas memorias do seu perfil"
  ON public.memories FOR UPDATE
  USING (
    profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Memories: usuario deleta apenas do seu perfil"
  ON public.memories FOR DELETE
  USING (
    profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

-- ============================================================
-- PHOTOS — restrito ao profile_id e ao user_id do autor
-- ============================================================
DROP POLICY IF EXISTS "Allow public select photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public insert photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public update photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public delete photos" ON public.photos;

CREATE POLICY "Photos: usuario ve fotos do seu perfil"
  ON public.photos FOR SELECT
  USING (
    profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Photos: usuario insere com seu proprio user_id"
  ON public.photos FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    AND profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Photos: usuario deleta apenas as proprias fotos ou do seu perfil"
  ON public.photos FOR DELETE
  USING (
    auth.uid()::text = user_id
    OR profile_id IN (
      SELECT assigned_profile_id FROM public.users WHERE id = auth.uid()::text
    )
  );
