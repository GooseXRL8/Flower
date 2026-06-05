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
    image_url text CONSTRAINT check_profile_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ~* '^https?://[^\s/$.?#].[^\s]*$'),
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
    image_url text CONSTRAINT check_memory_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ~* '^https?://[^\s/$.?#].[^\s]*$'),
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
    url text NOT NULL CONSTRAINT check_photo_url CHECK (url ~* '^https?://[^\s/$.?#].[^\s]*$'),
    profile_id text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_photos_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Definer helper to check is_admin state of user bypass-level safely to dodge infinite recursion under select rules
CREATE OR REPLACE FUNCTION public.is_admin(user_uid text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_uid AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECURITY DEFINER helper to fetch assigned profile id without triggering recursion on table SELECT policies
CREATE OR REPLACE FUNCTION public.get_user_profile_id(user_uid text)
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT assigned_profile_id FROM public.users 
        WHERE id = user_uid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger to enforce maximum limits of 5 photos per profile at database layer
CREATE OR REPLACE FUNCTION public.check_photos_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM public.photos WHERE profile_id = NEW.profile_id) >= 5 THEN
        RAISE EXCEPTION 'Limite de 5 fotos por casal atingido para este perfil!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_photos_limit ON public.photos;
CREATE TRIGGER trigger_check_photos_limit
BEFORE INSERT ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.check_photos_limit();

-- ============================================================
-- PROFILES — acesso restrito por relacionamento
-- ============================================================
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner ou parceiro pode ler" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: usuario autenticado cria o proprio" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: owner ou parceiro pode atualizar" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: somente owner pode deletar" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admin le todos" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admin edita todos" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admin deleta todos" ON public.profiles;

CREATE POLICY "Profiles: owner ou parceiro pode ler"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = created_by
    OR id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Profiles: usuario autenticado cria o proprio"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid()::text = created_by 
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Profiles: owner ou parceiro pode atualizar"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid()::text = created_by
    OR id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Profiles: somente owner pode deletar"
  ON public.profiles FOR DELETE
  USING (
    auth.uid()::text = created_by 
    OR public.is_admin(auth.uid()::text)
  );

-- ============================================================
-- USERS — cada usuario gerencia apenas seus proprios dados
-- ============================================================
DROP POLICY IF EXISTS "Allow public select users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
DROP POLICY IF EXISTS "Allow public update users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete users" ON public.users;
DROP POLICY IF EXISTS "Users: usuario le o proprio perfil ou do parceiro" ON public.users;
DROP POLICY IF EXISTS "Users: usuario cria o proprio registro" ON public.users;
DROP POLICY IF EXISTS "Users: usuario atualiza apenas o proprio (sem promover a admin)" ON public.users;
DROP POLICY IF EXISTS "Users: admin le todos" ON public.users;
DROP POLICY IF EXISTS "Users: admin atualiza todos" ON public.users;

CREATE POLICY "Users: usuario le o proprio perfil ou do parceiro"
  ON public.users FOR SELECT
  USING (
    auth.uid()::text = id
    OR (
      assigned_profile_id IS NOT NULL
      AND assigned_profile_id = public.get_user_profile_id(auth.uid()::text)
    )
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Users: usuario cria o proprio registro"
  ON public.users FOR INSERT
  WITH CHECK (
    auth.uid()::text = id 
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Users: usuario atualiza apenas o proprio (sem promover a admin)"
  ON public.users FOR UPDATE
  USING (
    auth.uid()::text = id 
    OR public.is_admin(auth.uid()::text)
  )
  WITH CHECK (
    auth.uid()::text = id
    OR public.is_admin(auth.uid()::text)
  );

-- ============================================================
-- MEMORIES — restrito ao profile_id do usuario
-- ============================================================
DROP POLICY IF EXISTS "Allow public select memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public insert memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public update memories" ON public.memories;
DROP POLICY IF EXISTS "Allow public delete memories" ON public.memories;
DROP POLICY IF EXISTS "Memories: usuario le memorias do seu perfil" ON public.memories;
DROP POLICY IF EXISTS "Memories: usuario cria apenas no seu perfil" ON public.memories;
DROP POLICY IF EXISTS "Memories: usuario edita apenas memorias do seu perfil" ON public.memories;
DROP POLICY IF EXISTS "Memories: usuario deleta apenas do seu perfil" ON public.memories;

CREATE POLICY "Memories: usuario le memorias do seu perfil"
  ON public.memories FOR SELECT
  USING (
    profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Memories: usuario cria apenas no seu perfil"
  ON public.memories FOR INSERT
  WITH CHECK (
    profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Memories: usuario edita apenas memorias do seu perfil"
  ON public.memories FOR UPDATE
  USING (
    profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Memories: usuario deleta apenas do seu perfil"
  ON public.memories FOR DELETE
  USING (
    profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

-- ============================================================
-- PHOTOS — restrito ao profile_id e ao user_id do autor
-- ============================================================
DROP POLICY IF EXISTS "Allow public select photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public insert photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public update photos" ON public.photos;
DROP POLICY IF EXISTS "Allow public delete photos" ON public.photos;
DROP POLICY IF EXISTS "Photos: usuario ve fotos do seu perfil" ON public.photos;
DROP POLICY IF EXISTS "Photos: usuario insere com seu proprio user_id" ON public.photos;
DROP POLICY IF EXISTS "Photos: usuario deleta apenas as proprias fotos ou do seu perfil" ON public.photos;

CREATE POLICY "Photos: usuario ve fotos do seu perfil"
  ON public.photos FOR SELECT
  USING (
    profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Photos: usuario insere com seu proprio user_id"
  ON public.photos FOR INSERT
  WITH CHECK (
    (
      auth.uid()::text = user_id
      AND profile_id = public.get_user_profile_id(auth.uid()::text)
    )
    OR public.is_admin(auth.uid()::text)
  );

CREATE POLICY "Photos: usuario deleta apenas as proprias fotos ou do seu perfil"
  ON public.photos FOR DELETE
  USING (
    auth.uid()::text = user_id
    OR profile_id = public.get_user_profile_id(auth.uid()::text)
    OR public.is_admin(auth.uid()::text)
  );
